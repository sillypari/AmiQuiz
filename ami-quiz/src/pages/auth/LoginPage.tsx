import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const blueGradients = [
  'radial-gradient(circle at 50% 50%, #3b82f6 0%, #1e40af 60%, transparent 100%)',
  'radial-gradient(circle at 50% 50%, #2563eb 0%, #0ea5e9 60%, transparent 100%)',
  'radial-gradient(circle at 50% 50%, #60a5fa 0%, #1e3a8a 60%, transparent 100%)',
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();
  const role = query.get('role') || 'student';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Here you would use role to determine backend logic if needed
      await loginWithEmail(email, password, role); // Pass role if your backend supports it
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle(role); // Pass role if your backend supports it
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md bg-[#101a30] border border-blue-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center animate-popup-in">
        {/* Role Indicator */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-extrabold uppercase text-white tracking-widest">{role === 'teacher' ? 'Teacher Login' : 'Student Login'}</h2>
        </div>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-white mb-2 uppercase">WELCOME TO AMIQUIZ</h1>
          <p className="text-blue-100">Sign in to your account to continue</p>
        </div>
        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input bg-[#181f2e] border-blue-700 text-blue-100 placeholder-blue-300 focus:border-[#008080] focus:ring-[#008080]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input bg-[#181f2e] border-blue-700 text-blue-100 placeholder-blue-300 focus:border-[#008080] focus:ring-[#008080]"
            required
          />
          {error && <div className="form-error text-center text-[#ff6b6b]">{error}</div>}
          <button
            type="submit"
            className="btn w-full bg-[#008080] text-white font-bold py-2 rounded-lg hover:bg-[#009999] transition-colors"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            className="btn w-full border-2 border-[#008080] text-[#008080] font-bold py-2 rounded-lg hover:bg-[#008080] hover:text-white transition-colors"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue with Google'}
          </button>
        </form>
        {/* Register Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-200">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-[#008080] hover:underline font-medium transition-colors duration-200"
            >
              Create one here
            </button>
          </p>
        </div>
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-blue-300">
            © 2024 AmiQuiz for Amity University. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 