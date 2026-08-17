# Floor Cut-Out Mapping

How a flat building render becomes floor-by-floor interactive, and how one
click travels from a band on the elevation → to that floor's plan → to a
room's 360° view.

Nothing here is new code. It documents what already runs in
`src/components/Building/`.

---

## The whole thing in one sentence

> Two images and their vector overlays are made to **share a coordinate
> space**, and every hop between them is joined by **one number: the floor**.

If you remember only two ideas:

1. **Alignment** is achieved by giving the picture and the SVG the same aspect
   ratio and the same cropping rule. No JavaScript measures anything.
2. **Wiring** is achieved by parsing a floor number out of every filename and
   every shape id, and using that number as the key everywhere.

---

## The join key

The floor number is derived once, from the elevation drawing, and then used to
look up everything else:

```
        elevation cut-out
        <polygon id="_12th">
                 │
                 │  parse first digits
                 ▼
            ┌─────────┐
            │   12    │  ← the join key
            └─────────┘
                 │
     ┌───────────┼────────────────┬─────────────────────┐
     ▼           ▼                ▼                     ▼
 plan photo   region cut-out   floorMap[12]        aside / readout
 filename     filename         → pano scene        "12th Floor"
 lists 11,12, lists the same
 14,19        floors
```

Two levels don't have numbers, so they get fixed keys instead:

| Level   | `num`  | pano / compass key |
| ------- | ------ | ------------------ |
| Ground  | `0`    | `"ground"`         |
| Terrace | `9999` | `"terrace"`        |
| 12th    | `12`   | `12`               |

`0` sorts ground to the bottom. `9999` is a sentinel that sorts the terrace to
the top without needing a real storey number, and without colliding with
ground when the label carries no digit at all.

---

# Part 1 — Shapes on the building render

*(files: `floorShapes.js`, `BuildingPage.jsx`)*

## 1. Draw the cut-out at the render's own size

Set the Illustrator artboard to the render's exact pixel size, trace one shape
per floor directly over the photo, export SVG.

The only thing that must survive export is that the `viewBox` describes the
same rectangle as the photo:

```
render:  8000 × 3636 px
svg:     viewBox="0 0 8000 3636"
```

Strictly, what has to match is the **aspect ratio** — identical numbers are
just the easiest way to guarantee it.

## 2. Put the floor number in the shape's name

Layer names in Illustrator become element ids:

```svg
<polygon id="_12th"   points="2022.24 1067.17 …"/>
<polygon id="Ground"  points="2990.52 2267.30 …"/>
<polygon id="Terrace" points="1621.35 1474.52 …"/>
```

## 3. Read the SVG as text and pull the geometry out

Loaded as a raw string at build time, then sliced id by id:

```js
const FILES = import.meta.glob("../../assets/Building_Floor_SVG/**/*.svg", {
  query: "?raw", import: "default", eager: true,
});

// for each id, take the markup up to the NEXT id — that slice is this floor
const seg    = raw.slice(m.index, ids[i + 1]?.index ?? raw.length);
const points = seg.match(/points="([^"]+)"/);
const d      = seg.match(/\sd="([^"]+)"/);
```

Only the geometry is kept. The fill and stroke baked in by the export are
thrown away, so hover styling isn't fighting a hard-coded colour.

## 4. Turn the name into a number

```js
const num = isGround  ? 0
          : isTerrace ? 9999
          : parseInt(id.match(/(\d+)/)?.[1] ?? "0", 10);
```

## 5. Group shapes by number

A floor isn't always one shape. Notan Tides is L-shaped, so the 12th floor is
two bands — and Illustrator, refusing to repeat an id, exports them as
`_12th` and `_12th-2`. Both parse to `12` and are collected into **one** floor:

```js
const floor = byFloor.get(num) ?? { num, isGround, isTerrace, shapes: [] };
floor.shapes.push(shape);
byFloor.set(num, floor);
```

Skip this and you get two "12th Floor" rows in the sidebar, duplicate React
keys, and only half the storey lighting up on hover.

## 6. Stack the photo and one SVG per floor

```jsx
<div className="relative h-screen w-full overflow-hidden">

  <img src={render} className="absolute inset-0 h-full w-full object-cover" />

  {/* pointer-events-none so empty sky stays click-through */}
  <div className="pointer-events-none absolute inset-0 h-full w-full">
    {floors.map((f) => (
      <svg key={f.num}
           viewBox={viewBox}                     /* "0 0 8000 3636" */
           preserveAspectRatio="xMidYMid slice"  /* == object-cover  */
           className="absolute inset-0 h-full w-full">
        …shapes…
      </svg>
    ))}
  </div>
</div>
```

**`object-cover` and `xMidYMid slice` are the same instruction in two
dialects:** *fill the box, keep the aspect ratio, crop the overflow, stay
centred.* Because both layers obey it, the shapes cannot drift off their
storeys at any window size. They must always be changed as a pair.

## 7. Invisible, but still hoverable

```js
const isActive = f.num === active;

const common = {
  pointerEvents: "all",                // opt back in; the parent is "none"
  vectorEffect: "non-scaling-stroke",  // 2.5 real px, not 2.5 viewBox units
  style: {
    fill:   isActive ? "rgba(7,11,23,0.55)"
                     : "rgba(59,83,130,0.001)",   // ← NOT transparent
    stroke: isActive ? "#070B17" : "rgba(255,255,255,0.001)",
    strokeWidth: isActive ? 2.5 : 1,
  },
  onMouseEnter: () => setActive(f.num),
  onClick:      () => setSelected(f.num),
};
```

> **The 0.001 alpha is load-bearing.** A shape filled `transparent` or `none`
> generates no hit area — the cursor passes straight through and nothing ever
> hovers. An almost-zero alpha is invisible to the eye and solid to the pointer.

`common` is spread onto **every** shape the floor owns, which is why both
halves of an L-shaped storey light together.

---

# Part 2 — From the click to the floor plan

*(files: `BuildingPage.jsx`, `floorPlansData.js`, `FloorPlanOverlay.jsx`)*

## 8. The click hands over a number, nothing else

```jsx
// BuildingPage
onClick: () => setSelected(f.num)

const selectedFloor = view?.floors.find((f) => f.num === selected) ?? null;

<FloorPlanOverlay floor={selectedFloor} floors={view.floors} … />
```

That's the entire handoff. The overlay receives a floor object whose only
meaningful content is `num` / `isGround` / `isTerrace`.

## 9. Number → plan photo, via the filename

Plan photos are globbed as URLs, and **each filename declares which floors it
covers**:

```
Notan_floor_plans/Notan_lands_end/
  Ground_floor.jpg            → ground
  Podium_floor.jpg            → floors 1–9
  11,12,14,19_floor.jpg       → floors 11, 12, 14 and 19
  13_floor_Refuge.jpg         → floor 13
  terrace_Amenity_floor.jpg   → terrace
```

`floorKeysFromName()` parses that:

```js
if (/ground/.test(lower))  return { ground: true };
if (/basement/.test(lower)) return { basement: true };
const terrace = /terrace/.test(lower);
const head    = lower.split("floor")[0];        // ← only the part BEFORE "floor"
const nums    = (head.match(/\d+/g) || []).map(Number);
```

Taking digits only from the part **before** the word "floor" is deliberate: it
stops `10th_floor_plan_v2` from picking up stray numbers further along the
name.

Matching is then trivial:

```js
const keyMatches = (keys, floor) =>
  floor.isGround  ? !!keys.ground
: floor.isTerrace ? !!keys.terrace
:                   keys.nums.includes(floor.num);
```

## 10. Number → hover-region cut-out, via the same rule

The clickable rooms drawn on the plan are a second set of SVGs, grouped by
folder or by file, and keyed with **the exact same filename parser**:

```
Building_Floor_SVG/Notan_Lands-End/FloorPlan_ImgSvg/
  11,12,14,19_floor.svg   ← one file, one shape per unit
  13_floor_Refuge.svg
  terrace_Amenity_floor.svg
```

Each group carries the `viewBox` read off its own SVG, plus the list of
regions. `getFloorPlan()` then returns, for one floor:

```js
{ available, planImg, viewBox, regions, options }
```

## 11. Aligning the regions to the plan photo

Same principle as the elevation, **opposite pair of rules**:

|                | Building elevation      | Floor plan            |
| -------------- | ----------------------- | --------------------- |
| image CSS      | `object-cover`          | `object-contain`      |
| svg attribute  | `xMidYMid slice`        | `xMidYMid meet`       |
| effect         | fill the box, crop      | fit inside, letterbox |

```jsx
<img src={planImg} className="block h-full w-full object-contain" />

<svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet"
     className="pointer-events-none absolute inset-0 h-full w-full">
```

And one extra trick: the containing box is **pre-shaped to the plan's own
aspect ratio**, so `meet` has nothing left to letterbox:

```js
const [, , vbW, vbH]  = viewBox.split(/\s+/).map(Number);
const planAspect      = (vbW / vbH) ?? imgAspect;   // falls back to the photo

style={{ width: `min(80vw, ${80 * planAspect}vh)`, aspectRatio: planAspect }}
```

Note that the plan photo and its region SVG do **not** use the same numbers —
only the same ratio:

```
plan photo  2627 × 1858       → 1.4139
region svg  viewBox 945.72 × 668.88 → 1.4139   ✔ same ratio, different units
```

The ratio is the invariant. The numbers never need to agree.

---

# Part 3 — From a room to its 360°

*(files: `floorPlansData.js`, `FloorPlanOverlay.jsx`, `panoData.js`)*

## 12. Where region names come from

This is the part that surprises people. Region names are generated, not
authored:

```js
const name =
  inFolder && shapes.length === 1
    ? prettify(fileName)                      // "Living Room"
    : `Unit ${group.regions.length + 1}`;     // "Unit 1", "Unit 2", …
```

- If a building keeps **one SVG per room inside a floor folder**, the room is
  named after its file — `living_room.svg` → `"Living Room"`.
- Otherwise (one SVG holding every unit) the regions are numbered **in
  document order**: `"Unit 1"`, `"Unit 2"`, and so on.

That generated name is the key used to look up the pano framing, so for the
numbered style the name is really a *position*.

## 13. Region name + floor number → a pano

Clicking a region carries both halves up to the page:

```jsx
// FloorPlanOverlay → BuildingPage
onOpenPano={(regionName) => setPano({ floorNum: selected, regionName })}

<PanoViewer
  key={`${pano.floorNum}-${pano.regionName ?? "floor"}`}
  floor={panoFloor}
  pano={getRegionPano(id, panoFloor, pano.regionName)}
/>
```

`getRegionPano()` does a two-level lookup and merges them:

```js
const floorCfg = building.floorMap[floorKey(floor)];      // which scene
if (!floorCfg) return null;                               // no 360° here

const override = regionName != null
  ? building.regionMap[floorKey(floor)]?.[regionName]     // how to frame it
  : null;

// room values win; anything omitted inherits the floor's — including the scene
return resolvePano(building, { ...floorCfg, ...override }, isTerrace);
```

```
floorMap[12]                 →  { scene: "6-22nd_12th-f_7695m", panDeg: 140 }
                                            │
regionMap[12]["Unit 3"]      →  { yawDeg: -52, pitchDeg: 3, fovDeg: 64 }
                                            │
                    spread-merge (room wins) ▼
                        { scene: "6-22nd…", panDeg: 140,
                          yawDeg: -52, pitchDeg: 3, fovDeg: 64 }
```

## 14. What `resolvePano` finally produces

```js
const scene = building.sceneById.get(cfg.scene);
if (!scene) return null;

center   = { yaw, pitch, fov }          // from cfg if set, else the as-shot view
panDeg   = isTerrace ? 360 : (cfg.panDeg ?? DEFAULT_PAN_DEG);
tilesUrl = `${building.tilesBase}/${scene.id}`;
```

So the layering is: **the scene decides where you are, the floor config decides
which scene and how far you may look, the region override decides where you're
pointed when it opens.** Anything not specified falls through to the level
below.

The whole-floor variant, `getFloorPano()`, is the same call without the region
override — that's what the "View Pano" button uses on floors that have a 360°
but no detailed plan.

**Buildings with no panos at all** (Beach House, Tides) simply have no entry in
`PANO_BUILDINGS`, so every one of these functions returns `null` and the UI
quietly drops the pano affordances.

---

## What actually goes wrong

| Symptom | Cause |
| --- | --- |
| Shapes drift off their floors, worse near the edges | viewBox ratio ≠ image ratio. Re-export from a correctly sized artboard. |
| Nothing hovers at all | Fill is `transparent`/`none`, so there's no hit area — or the parent's `pointer-events: none` was never opted out of. |
| Aligned on your monitor, broken on another | `cover` paired with `meet`, or `contain` paired with `slice`. The two rules must match. |
| One floor listed twice, half of it highlights | Illustrator's duplicate-id suffix (`_12th-2`) treated as its own floor. Group by number. |
| The top level is missing entirely | A shape named something the parser doesn't recognise — a bare `id="T"`. Name it `Terrace`. |
| A floor's plan never appears | The filename's floor list doesn't include it, or the digits sit *after* the word "floor" in the name. |
| Every room opens the wrong view | Shapes were reordered in the SVG, so `"Unit 3"` is now a different room. The numbered names are positional. |
| The 360° opens and spins forever | `floorMap` has no entry for that floor (many buildings have `ground: null`), so `pano` is `null` and the viewer never initialises. |
| Amenities / plans silently missing for a building | A lookup key that doesn't match the route id — `"notan-Tides"` vs `notan-tides`. These maps are keyed by the exact `/projects/:id` slug. |

Two more worth knowing:

- **`vector-effect: non-scaling-stroke`** — without it, a stroke width of `2.5`
  means 2.5 *viewBox units*. In an 8000-unit space scaled to a 1600px screen
  that renders at about half a pixel and effectively vanishes.
- **`floorMap` keys are `"ground"`, `"terrace"`, or a real number.** A string
  `"12"` will not match the number `12`.

---

## Rebuilding it from scratch

1. Set the artboard to the render's exact pixel size.
2. Trace one shape per floor; name each layer with its floor number.
3. Export SVG; confirm the `viewBox` matches those dimensions.
4. Import as a raw string; regex out each id's `points` or `d`.
5. Parse a number from every id — ground `0`, terrace `9999`, else first digits.
6. Group shapes into one object per number; sort ascending.
7. Render the photo `object-cover`, plus one full-box `<svg>` per floor with
   `xMidYMid slice`.
8. Fill shapes at ~0.001 alpha with `pointer-events: all`; hover sets the
   floor's number as state.
9. Name plan photos and region SVGs so the filename lists the floors they cover.
10. Match floor → plan with the same number; render the plan `object-contain`
    with `xMidYMid meet`, and pre-shape the box to the plan's aspect ratio.
11. Key pano scenes by `"ground"` / `"terrace"` / number, and pano framing by
    region name on top of that.

---

## Where each piece lives

| Concern | File |
| --- | --- |
| Elevation SVG → floor objects | `src/components/Building/floorShapes.js` |
| Which render + viewBox per building | `src/components/Building/buildingViewsData.js` |
| Hover overlay on the render | `src/components/Building/BuildingPage.jsx` |
| Floor → plan photo + regions | `src/components/Building/floorPlansData.js` |
| The plan overlay UI | `src/components/Building/FloorPlanOverlay.jsx` |
| Scenes, floor map, region framing | `src/components/Building/panoData.js` |
| The 360° viewer | `src/components/Building/PanoViewer.jsx` |
| Compass aim per building/floor | `src/components/Building/floorPlanCompassData.js` |
