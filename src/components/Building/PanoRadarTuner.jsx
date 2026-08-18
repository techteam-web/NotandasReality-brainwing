import { RADAR_SCOPES } from "./floorPlanRadarData";

/**
 * The `?radar=1` panel: aim the minimap radar's cone by hand.
 *
 * An authoring aid, never shown on a normal visit. You're standing in the 360°
 * looking at a room you can identify on the plan; nudge until the cone covers
 * that room, then Copy and paste the block into floorPlanRadarData.js.
 *
 * The scope switch is the point of the thing: the same nudge can be written as
 * "this room only", "this whole floor" or "this whole building", so a tour
 * that's uniformly off by 20° is one number, while a single odd sheet stays a
 * single override. Dial-ins accumulate across floors and rooms as you walk the
 * building — Copy emits all of them at once.
 *
 * Props:
 *   • scope / onScope     — which level nudges are written to.
 *   • facing              — the aim in force here, dial-ins included.
 *   • fileFacing          — what the app would render without this session.
 *   • derived             — what the room yaws worked out, for reference.
 *   • headingDeg          — where the cone points on the plan right now.
 *   • buildingId / floorLabel / regionName — what you're aiming.
 *   • count               — how many dial-ins the session is holding.
 *   • onNudge / onReset / onClear / onCopy
 */

const STEPS = [-45, -15, -5, 5, 15, 45];

const SCOPE_HINT = {
  room: "this room only",
  floor: "every room on this floor",
  building: "every floor of this building",
};

const PanoRadarTuner = ({
  scope,
  onScope,
  facing,
  fileFacing,
  derived,
  headingDeg,
  buildingId,
  floorLabel,
  regionName,
  count,
  copied,
  onNudge,
  onReset,
  onClear,
  onCopy,
}) => (
  <div className="absolute bottom-24 left-5 z-20 w-60 rounded-md border border-white/15 bg-[#0e1726]/90 p-3 font-mono text-[11px] text-white/80 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md md:bottom-36 md:left-8">
    <p className="mb-2 text-[10px] tracking-[0.18em] text-[#e8c879] uppercase">
      Radar aim
    </p>

    <p className="truncate text-white/45">
      {buildingId} · {floorLabel}
      {regionName ? ` · ${regionName}` : ""}
    </p>
    <p className="text-white/45">
      cone at <span className="text-white/70">{Math.round(headingDeg)}°</span> on
      plan
    </p>

    {/* which level the nudges below get written to */}
    <div className="mt-2 flex items-center gap-1">
      {RADAR_SCOPES.map((s) => {
        const usable = s !== "room" || regionName != null;
        return (
          <button
            key={s}
            onClick={() => usable && onScope(s)}
            disabled={!usable}
            title={
              usable
                ? SCOPE_HINT[s]
                : "open the 360° from a room to aim that room"
            }
            className={`flex-1 rounded-sm border py-1 text-[10px] transition-colors ${
              scope === s
                ? "border-[#e8c879]/70 bg-white/10 text-[#e8c879]"
                : usable
                  ? "border-white/20 hover:border-[#e8c879]/70 hover:text-[#e8c879]"
                  : "cursor-not-allowed border-white/10 text-white/25"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
    <p className="mt-1 text-[10px] text-white/35">
      writing to {SCOPE_HINT[scope]}
    </p>

    <div className="mt-2">
      <p className="text-white">
        facing <span className="text-[#e8c879]">{facing}°</span>
        {facing !== fileFacing && (
          <span className="text-white/35"> (was {fileFacing}°)</span>
        )}
      </p>
      {/* what the room yaws worked out on their own — usually you can leave it */}
      <p className="text-[10px] text-white/35">
        {derived
          ? `auto ${derived.floor}° from ${derived.count} room${
              derived.count === 1 ? "" : "s"
            }${
              regionName != null && derived.rooms[regionName] != null
                ? ` · this room ${derived.rooms[regionName]}°`
                : ""
            }`
          : "no room yaws on this floor to derive from"}
      </p>
      <div className="mt-1 flex items-center gap-1">
        {STEPS.map((step) => (
          <button
            key={step}
            onClick={() => onNudge(step)}
            className="flex-1 rounded-sm border border-white/20 py-1 text-[10px] transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
      </div>
    </div>

    <div className="mt-2 flex items-center gap-1">
      <button
        onClick={onReset}
        title="drop this scope's dial-in"
        className="flex-1 rounded-sm border border-white/20 py-1 transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
      >
        Reset
      </button>
      <button
        onClick={onCopy}
        title="copy every dial-in this session has made"
        className="flex-1 rounded-sm border border-white/20 py-1 transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
      >
        {copied ? "Copied!" : `Copy ${count || ""}`.trim()}
      </button>
    </div>
    {count > 1 && (
      <button
        onClick={onClear}
        className="mt-1 w-full rounded-sm border border-white/10 py-1 text-[10px] text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
      >
        Clear all {count} dial-ins
      </button>
    )}
  </div>
);

export default PanoRadarTuner;
