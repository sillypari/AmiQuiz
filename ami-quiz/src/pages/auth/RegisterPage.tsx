import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
  const { registerWithEmail, registerWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    try {
      await registerWithEmail(email, password);
      navigate('/register/role');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    try {
      await registerWithGoogle();
      navigate('/register/role');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md bg-[#101a30] border border-blue-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-white mb-2 uppercase">Join AmiQuiz</h1>
          <p className="text-blue-100">Create your account to get started</p>
        </div>
        {/* Register Form */}
        <form onSubmit={handleEmailRegister} className="space-y-5 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input bg-[#181f2e] border-blue-700 text-blue-100 placeholder-blue-300 focus:border-[#008080] focus:ring-[#008080]"
            required
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input bg-[#181f2e] border-blue-700 text-blue-100 placeholder-blue-300 focus:border-[#008080] focus:ring-[#008080]"
            required
          />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="input bg-[#181f2e] border-blue-700 text-blue-100 placeholder-blue-300 focus:border-[#008080] focus:ring-[#008080]"
            required
          />
          {error && <div className="form-error text-center text-[#ff6b6b]">{error}</div>}
          <button
            type="submit"
            className="btn w-full bg-[#008080] text-white font-bold py-2 rounded-lg hover:bg-[#009999] transition-colors"
            disabled={loading || password !== confirmPassword || password.length < 6}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        {/* Divider */}
        <div className="relative my-6 w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#101a30] text-blue-300">Or continue with</span>
          </div>
        </div>
        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="btn w-full border-2 border-[#008080] text-[#008080] font-bold py-2 rounded-lg hover:bg-[#008080] hover:text-white transition-colors"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>
        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-200">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#008080] hover:underline font-medium transition-colors duration-200"
            >
              Sign in here
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

export default RegisterPage; 