import React, { useState } from 'react';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleRole = () => {
    setRole(role === 'user' ? 'admin' : 'user');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token and user role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.payload.role);
      localStorage.setItem('isAuthenticated', 'true');

      // Navigate based on role
      if (data.payload.role.toLowerCase() === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>{role === 'admin' ? 'Admin Login' : 'User Login'}</h2>

        <button type="button" className="toggle-role" onClick={toggleRole}>
          Switch to {role === 'user' ? 'Admin' : 'User'}
        </button>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div className="forgot-password">
          <a href="/forgot-password">Forgot Password?</a>
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
