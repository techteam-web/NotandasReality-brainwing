import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/");
    }, 7000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0f12] p-4 text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20">
        <div className="h-200 w-200 animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-gray-600"></div>
        <div className="w-150600px] absolute animate-[spin_40s_linear_infinite_reverse] rounded-full border border-gray-700"></div>
        <div className="absolute h-100 w-100 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-gray-800"></div>
      </div>

      <div className="z-10 max-w-2xl space-y-8 text-center">
        <div className="relative inline-block">
          <h1 className="bg-linear-to-br from-gray-200 via-gray-400 to-gray-700 bg-clip-text text-9xl font-bold tracking-tighter text-transparent select-none md:text-[150px]">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 bg-gray-500/30 blur-sm"></div>
        </div>

        <h2 className="text-3xl font-light tracking-wide text-gray-200 md:text-5xl">
          Lost on the map
        </h2>

        <p className="mx-auto max-w-md text-lg leading-relaxed font-light text-gray-400 md:text-xl">
          The building or location you're looking for doesn't exist in our
          current coordinates. Recalibrating route in{" "}
          <span className="font-semibold text-white">{countdown}</span>s...
        </p>

        <div className="relative z-20 pt-6">
          <button
            onClick={() => navigate("/")}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-800 px-8 py-3 font-medium tracking-wide text-white shadow-xl transition-all duration-300 hover:border-gray-500 hover:shadow-2xl active:scale-95"
          >
            <span className="absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-500 ease-out group-hover:h-56 group-hover:w-56"></span>
            <span className="relative flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Homepage
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
