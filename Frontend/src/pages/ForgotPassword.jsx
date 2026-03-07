import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

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
    <div className="min-h-screen bg-dark flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-heading font-bold text-heading">
              Cred<span className="text-primary">Buzz</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Reset your password</h2>
          <p className="text-white/55">Enter your email to receive a reset code</p>
        </div>

        {/* Reset Card */}
        <div className="bg-dark-card border border-white/10 rounded-xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          {message && step !== 3 && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium text-sm">{message}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={requestOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white/70 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={e => setOTP(e.target.value)}
                  required
                  className="input"
                  placeholder="Enter the code from your email"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-white/40 mt-1">Must be at least 6 characters long</p>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">Password Reset Successful!</h3>
              <p className="text-white/55 mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <Link to="/login" className="inline-block bg-primary text-white px-6 py-3 rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                Sign In
              </Link>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-white/50">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-white/30">
            Need help? Contact our{' '}
            <Link to="/support" className="text-primary hover:text-primary-dark font-medium">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 