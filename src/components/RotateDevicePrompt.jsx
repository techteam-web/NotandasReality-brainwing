import brandLogo from "../assets/notandaslogo.svg";
import gateBg from "../assets/fullscreengatebg.png";

const serif = { fontFamily: "'Times New Roman', Times, serif" };

/* The device turns on its side (see .rotate-hint in index.css), with the arc
   of the turn drawn beside it. */
const RotateIcon = ({ className }) => (
  <svg
    viewBox="0 0 96 96"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M67 15.1A38 38 0 0 0 11.3 38.2" opacity="0.5" />
    <path d="M16.3 33.2 11.3 38.2 9.5 31.4" opacity="0.5" />
    <g
      className="rotate-hint"
      style={{ transformBox: "view-box", transformOrigin: "48px 48px" }}
    >
      <rect x="30" y="20" width="36" height="56" rx="5" />
      <circle cx="48" cy="25" r="1.4" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

/**
 * Asks a device held upright to turn sideways.
 *
 * The site is one composition drawn across — on a phone as much as on a
 * tablet, the only difference being how far it is scaled down (see
 * DesignStage) — so upright is not a layout here, it is a prompt. This covers
 * everything, the full-screen gate included, until the device is turned.
 *
 * Shown by CSS alone (the `device-portrait` variant in index.css), not by
 * state: it appears the instant the device turns upright and is gone the
 * instant it turns back, with nothing under it remounting either way. The
 * panel is sized for the SHORT side, since that is the width it is read at.
 */
const RotateDevicePrompt = () => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="rotate-device-title"
    className="fixed inset-0 z-10000 hidden touch-none items-center justify-center overflow-hidden overscroll-contain device-portrait:flex"
  >
    <div className="absolute inset-0 bg-[#070B17]" />
    <img
      src={gateBg}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
    />

    {/* the same framed cream panel as the full-screen gate */}
    <div className="fs-rise relative mx-6 w-[min(88vw,30rem)] overflow-hidden rounded-[14px] border border-[rgba(31,42,64,0.18)] bg-[#faf6ed]/88 px-8 py-10 text-center shadow-[0_30px_80px_-32px_rgba(60,50,25,0.55)] backdrop-blur-md sm:px-10 sm:py-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-[10px] border border-[rgba(117,129,150,0.26)]"
      />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#4E5157]/18 via-[#2f3e58]/10 to-transparent" />

      <div className="relative flex flex-col items-center">
        <img
          src={brandLogo}
          alt="Notandas Realty"
          className="mb-7 h-14 w-auto opacity-95 sm:mb-10 sm:h-20"
          draggable="false"
        />

        <RotateIcon className="h-18 w-18 text-[#1A2334] sm:h-24 sm:w-24" />

        <h2
          id="rotate-device-title"
          className="mt-6 text-lg tracking-wide text-[#4E5157] italic sm:mt-8 sm:text-xl"
          style={serif}
        >
          Please Rotate Your Device
        </h2>
        <p
          className="mt-3 max-w-[22rem] text-[14px] leading-relaxed text-[#5b5f66] sm:mt-4 sm:text-[15px]"
          style={serif}
        >
          Notandas Realty is designed to be explored in landscape. Turn your
          device sideways to continue.
        </p>

        <p className="mt-6 text-[10px] tracking-[0.32em] text-[#6b6f76] uppercase sm:mt-8 sm:text-[11px]">
          Landscape view only
        </p>
      </div>
    </div>
  </div>
);

export default RotateDevicePrompt;
