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
    // Placeholder for Google login logic
    setError('Google login is coming soon.');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Login to CredBuzz</h2>
          <p className="mt-2 text-gray-600">Enter your credentials to access your account.</p>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg my-6 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-gray-900">
              Forgot Password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSuccess}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-800 hover:text-gray-900">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 