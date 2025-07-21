import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const gradientColors = [
  'radial-gradient(circle at 50% 50%, #ff9800 0%, #ffb74d 60%, transparent 100%)', // Orange
  'radial-gradient(circle at 50% 50%, #008080 0%, #00bcd4 60%, transparent 100%)', // Teal Blue
  'radial-gradient(circle at 50% 50%, #e040fb 0%, #ff80ab 60%, transparent 100%)', // Pink
];

const AnimatedBackground: React.FC = () => {
  const gradientsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const animate = () => {
      gradientsRef.current.forEach((el, i) => {
        if (el) {
          const x = 10 + Math.random() * 80;
          const y = 10 + Math.random() * 80;
          el.style.left = `${x}%`;
          el.style.top = `${y}%`;
        }
      });
    };
    const interval = setInterval(animate, 3500);
    animate();
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-gradient-to-b from-[#0a1020] to-[#101a30]">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          ref={el => { gradientsRef.current[i] = el; }}
          className="absolute w-[32rem] h-[32rem] rounded-full opacity-30 mix-blend-lighten pointer-events-none animate-gradient-move"
          style={{
            background: gradientColors[i],
            left: '50%',
            top: '50%',
            filter: 'blur(32px)',
            transition: 'left 2.5s cubic-bezier(.4,0,.2,1), top 2.5s cubic-bezier(.4,0,.2,1)',
            zIndex: 2
          }}
        />
      ))}
    </div>
  );
};

const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <AnimatedBackground />
      <div className="flex flex-col items-center justify-center min-h-screen w-full animate-popup-in relative z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mb-12 text-center tracking-widest">PLEASE SELECT YOUR ROLE</h1>
        <div className="flex flex-row items-center justify-center gap-16">
          {/* Student Icon */}
          <div
            className="flex flex-col items-center group cursor-pointer animate-popup-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            onClick={() => navigate('/login?role=student')}
          >
            <svg
              className="w-20 h-20 stroke-white group-hover:scale-110 group-hover:stroke-[#008080] transition-all duration-300 mb-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 48 48"
            >
              {/* Graduation cap icon */}
              <path d="M24 8L4 18l20 10 20-10-20-10z" />
              <path d="M24 28v12" />
              <path d="M12 22v6c0 2.5 5.4 6 12 6s12-3.5 12-6v-6" />
            </svg>
            <span className="text-white text-lg font-semibold mt-1 uppercase tracking-wide">Student</span>
          </div>
          {/* Teacher Icon */}
          <div
            className="flex flex-col items-center group cursor-pointer animate-popup-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            onClick={() => navigate('/login?role=teacher')}
          >
            <svg
              className="w-20 h-20 stroke-white group-hover:scale-110 group-hover:stroke-[#008080] transition-all duration-300 mb-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 48 48"
            >
              {/* Chalkboard/teacher icon */}
              <rect x="6" y="10" width="36" height="24" rx="3" />
              <path d="M12 34v4h24v-4" />
              <circle cx="16" cy="22" r="2.5" />
              <path d="M20 28c0-2 4-2 4 0" />
              <path d="M32 18h4v8h-4z" />
            </svg>
            <span className="text-white text-lg font-semibold mt-1 uppercase tracking-wide">Teacher</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage; 