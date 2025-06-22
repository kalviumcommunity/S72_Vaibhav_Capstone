import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
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

    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/profile');
    }
    setLoading(false);
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    // This function needs to be adapted based on how you handle Google login
    // For now, it's a placeholder.
    console.log('Google login clicked');
    setError('Google login is not implemented yet.');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Register for CredBuzz</h2>
          <p className="mt-2 text-gray-600">Create your account to start finding and completing tasks.</p>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg my-6 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>
          </div>
          
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-800 hover:text-gray-900">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 