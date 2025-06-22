import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
// import './Pages.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`${API_URL}/api/auth/request-otp`, { email });
      setMessage('OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      setMessage('Password reset successful! You can now log in.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-accent-50 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-neutral-900">Cred</span>
              <span className="text-accent-600">Buzz</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Reset your password</h2>
          <p className="text-neutral-600">Enter your email to receive a reset code</p>
        </div>

        {/* Reset Card */}
        <div className="card p-8">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {message && step !== 3 && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">{message}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={requestOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white text-neutral-900"
                  placeholder="Enter your email"
                />
              </div>
              <button 
                type="submit" 
                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={e => setOTP(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white text-neutral-900"
                  placeholder="Enter the code from your email"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white text-neutral-900"
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>
              <button 
                type="submit" 
                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading"></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Password Reset Successful!</h3>
              <p className="text-neutral-600 mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-neutral-600">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-accent-600 hover:text-accent-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">
            Need help? Contact our{' '}
            <Link to="/support" className="text-accent-600 hover:text-accent-700">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 