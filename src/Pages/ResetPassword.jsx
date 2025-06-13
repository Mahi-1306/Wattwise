import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('resetToken');

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();
      if (!response.ok) return setError(data.error || 'Reset failed');

      localStorage.removeItem('resetToken');
      alert('Password reset successfully! Please login.');
      navigate('/');
    } catch (err) {
      setError('Server error. Try again later.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
