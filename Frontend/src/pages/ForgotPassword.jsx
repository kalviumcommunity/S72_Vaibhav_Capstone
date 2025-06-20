import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './Pages.css';

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
    <div className="page-container" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={requestOTP} className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={resetPassword} className="form-group">
          <label>OTP</label>
          <input type="text" value={otp} onChange={e => setOTP(e.target.value)} required />
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      )}
      {step === 3 && (
        <div className="success-message">Password reset successful! <a href="/login">Login</a></div>
      )}
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
    </div>
  );
};

export default ForgotPassword; 