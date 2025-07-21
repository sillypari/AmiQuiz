import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { title: 'Role-Based Dashboards', desc: 'Personalized dashboards for students, teachers, and admins.' },
  { title: 'AI Quiz Generator', desc: 'Generate quizzes instantly using AI-powered tools.' },
  { title: 'Advanced Quiz Interface', desc: 'Take, review, and analyze quizzes with rich feedback.' },
  { title: 'Community & Collaboration', desc: 'Engage with peers and mentors in a vibrant community.' },
  { title: 'Analytics & Reports', desc: 'Track your progress and performance with detailed analytics.' },
  { title: 'Gamification', desc: 'Leaderboards, badges, and achievements to motivate learning.' },
  { title: 'Content Library', desc: 'Access and share a wide range of educational resources.' },
  { title: 'Secure Authentication', desc: 'Safe and easy login with email or Google.' }
];

const blueGradients = [
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
            background: blueGradients[i],
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

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <AnimatedBackground />
      {/* Logo top left */}
      <div className="fixed top-6 left-6 z-20 animate-popup-in">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-2 sm:px-4 py-10">
        {/* Intro Section Centered */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-popup-in">
          {/* AmiQuiz punch label - now big, bold, white, with hover animation */}
          <div className="text-white text-4xl sm:text-6xl font-extrabold mb-6 text-center drop-shadow-lg transition-colors duration-300 cursor-pointer hover:text-[#008080]">
            AmiQuiz
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-widest text-white drop-shadow-lg mb-2 uppercase text-center animate-popup-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Empower your <span style={{ color: '#008080' }}>LEARNING.</span>
          </h1>
          <p className="text-base sm:text-xl text-blue-200 font-medium text-center mb-8 tracking-wide animate-popup-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>Pixel-perfect quizzes, analytics, and more.</p>
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              className="px-8 py-3 rounded-full border-2 border-blue-500 text-blue-100 font-bold text-lg bg-transparent hover:bg-blue-800/30 hover:shadow-lg transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => navigate('/select-role')}
            >
              Get Started
            </button>
            <button
              className="px-8 py-3 rounded-full border-2 border-blue-500 text-blue-100 font-bold text-lg bg-transparent hover:bg-blue-800/30 hover:shadow-lg transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </div>
        </div>
        {/* About AmiQuiz */}
        <div className="w-full max-w-2xl bg-[#101a30] border border-blue-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-lg backdrop-blur-md mt-10 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-3 uppercase tracking-wide text-center">About AmiQuiz</h2>
          <p className="text-blue-100 text-base sm:text-lg text-center leading-relaxed mb-1" style={{letterSpacing: '0.02em'}}>AmiQuiz is a modern quiz and learning platform designed for students, teachers, and admins. Enjoy AI-powered quiz generation, advanced analytics, gamification, and a collaborative community—all in a secure, beautiful interface.</p>
        </div>
        {/* Features List */}
        <div id="features-section" className="w-full max-w-3xl grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-12 px-2 sm:px-4 mt-8">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="group bg-[#101a30] border border-blue-600 rounded-xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:border-blue-400 cursor-pointer animate-fade-in-up"
              style={{ minHeight: 80, minWidth: 0, aspectRatio: '1 / 1', padding: '0.5rem 0.25rem', animationDelay: `${0.3 + idx * 0.1}s`, animationFillMode: 'both' }}
            >
              <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-white mb-2" style={{letterSpacing: '0.04em'}}>{feature.title}</h2>
              <p className="text-xs sm:text-sm font-light uppercase text-blue-100 opacity-90 text-center leading-snug tracking-wide" style={{letterSpacing: '0.08em'}}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexPage; 