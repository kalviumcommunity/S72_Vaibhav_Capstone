import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/profile');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async () => {
    setError('Google login is coming soon.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Dark Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Login background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center px-12">
          <Link to="/" className="text-4xl font-heading font-bold text-white mb-6 block">
            Cred<span className="text-primary">Buzz</span>
          </Link>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Exchange skills, earn credits, and get things done with our collaborative community.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-lighter px-8 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="text-3xl font-heading font-bold text-white">
              Cred<span className="text-primary">Buzz</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-white">Welcome Back</h2>
            <p className="mt-2 text-white/55">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <div className="text-right text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white font-semibold font-nav rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wider text-sm"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-dark-lighter text-white/40">or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSuccess}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-white/10 rounded bg-dark-card text-sm font-medium text-white/60 hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.04C34.553 4.246 29.627 2 24 2C11.854 2 2 11.854 2 24s9.854 22 22 22s22-9.854 22-22c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.46-2.023 5.23-2.023 8.309c0 3.079.794 5.849 2.023 8.309L11.5 29.98c-1.07-1.92-1.7-4.1-1.7-6.48s.63-4.56 1.7-6.48L6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.1-4.9c-1.63 1.1-3.682 1.7-5.809 1.7c-4.4 0-8.12-2.8-9.45-6.6H4.18C7.171 38.334 14.977 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.592l5.1 4.9c3.21-2.9 5.3-7.2 5.3-12.492c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Google login coming soon!
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm">
            <p className="text-white/50">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 