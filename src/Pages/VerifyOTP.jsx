import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('resetToken');

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp })
      });

      const data = await response.json();
      if (!response.ok) return setError(data.error || 'OTP verification failed');

      navigate('/reset-password');
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
