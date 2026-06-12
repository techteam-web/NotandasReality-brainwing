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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0f12] text-white p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-200 h-200 rounded-full border border-gray-600 border-dashed animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute w-150600px] rounded-full border border-gray-700 animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute w-100 h-100 rounded-full border border-gray-800 border-dashed animate-[spin_20s_linear_infinite]"></div>
      </div>

      <div className="z-10 text-center space-y-8 max-w-2xl">
        <div className="relative inline-block">
          <h1 className="text-9xl md:text-[150px] font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-gray-200 via-gray-400 to-gray-700 select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gray-500/30 blur-sm"></div>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-light tracking-wide text-gray-200">
          Lost on the map
        </h2>
        
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-md mx-auto leading-relaxed">
          The building or location you're looking for doesn't exist in our current coordinates. Recalibrating route in <span className="font-semibold text-white">{countdown}</span>s...
        </p>

        <div className="pt-6 relative z-20">
          <button 
            onClick={() => navigate('/')}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden rounded-full font-medium tracking-wide text-white bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
