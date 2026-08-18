import { useLayoutEffect, useState } from "react";
import { floorKey, getRegionYawDeg } from "./panoData";
import { deriveRadarFacing, planAngleTo } from "./floorPlanRadarData";

/**
 * Keep the minimap radar in step with the room yaws, with nothing to maintain.
 *
 * Each room on a floor plan already carries a hand-tuned `yawDeg` in
 * REGION_PANO_MAP — the direction the camera must face to look at that room —
 * and the plan itself already knows where that room sits on the paper. Those are
 * the same fact stated twice, so the gap between them is exactly how far this
 * capture is turned relative to its sheet. Measure it per room, average it, and
 * the radar aims itself: retune a room's yaw and the cone follows, with no
 * second set of numbers to keep in step.
 *
 * The rooms are measured off the shapes the minimap has already drawn (getBBox
 * gives their centres in the plan's own coordinates), so this needs the minimap
 * open and painted — which is also the only time the radar is on screen.
 *
 * Returns `{ floor, rooms, count }` — the floor's average correction, each
 * room's own, and how many rooms had a say — or null when this floor has no
 * room yaws to learn from (floorPlanRadarData.js then decides what to do).
 */
const useRadarAutoFacing = ({
  buildingId,
  floor,
  pano,
  regions,
  planFrame,
  planNorthDeg,
  shapes,
  ready,
}) => {
  const [derived, setDerived] = useState(null);

  // Identity of what's being measured. Re-deriving is cheap (a handful of
  // getBBox calls) but it must happen after the shapes paint, and again whenever
  // the floor, the plan or the capture's own north changes.
  const planId = `${buildingId}|${String(floorKey(floor))}|${pano?.id ?? ""}`;
  const northDeg = pano?.northDeg ?? 0;

  useLayoutEffect(() => {
    // Measure, then decide. Rooms are shapes in a live SVG — their centres only
    // exist once the minimap has drawn them — so this is the measure-then-paint
    // case useLayoutEffect exists for: it lands before the browser paints, and
    // the cone is never on screen misaimed. Re-measuring returns the SAME object
    // when nothing moved, so this can't cascade renders.
    const next = !ready || !planFrame || !regions.length ? null : measure();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDerived((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
    );

    function measure() {
      const centre = {
        x: planFrame.x + planFrame.w / 2,
        y: planFrame.y + planFrame.h / 2,
      };
      // A room sitting on the hub has no direction to speak of — a pixel of
      // wobble would swing its angle right around, so it gets no vote.
      const deadZone = Math.min(planFrame.w, planFrame.h) * 0.04;

      const samples = [];
      regions.forEach((region, i) => {
        const yawDeg = getRegionYawDeg(buildingId, floor, region.name);
        if (yawDeg == null) return; // inherits the floor's framing — says nothing

        const el = shapes.current.get(i);
        if (!el) return;

        const box = el.getBBox();
        const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        if (Math.hypot(point.x - centre.x, point.y - centre.y) < deadZone)
          return;

        samples.push({
          name: region.name,
          // where the room is on the paper …
          planAngle: planAngleTo(centre, point),
          // … against where the radar would point when framed at that room
          // (plan north + the capture's real bearing at that yaw)
          radarAngle: planNorthDeg + northDeg + yawDeg,
        });
      });

      return deriveRadarFacing(samples);
    }
    // `regions` and `floor` are pinned by planId; shapes is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, ready, planNorthDeg, northDeg, planFrame?.w, planFrame?.h]);

  return derived;
};

export default useRadarAutoFacing;
