import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', loginForm);
      loginUser(data.token, data.user);
      navigate('/submit-incident');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', registerForm);
      loginUser(data.token, data.user);
      navigate('/submit-incident');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-box flex justify-center">
      <div className="glow-box w-full max-w-md">
        <div className="flex mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 font-bold rounded-l-lg ${
              tab === 'login' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 font-bold rounded-r-lg ${
              tab === 'register' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        {error && <p className="text-red-400 mb-3 text-sm text-center">{error}</p>}

        <GoogleSignInButton
          onSuccess={(data) => {
            loginUser(data.token, data.user);
            navigate('/submit-incident');
          }}
          onError={(msg) => setError(msg)}
        />

        <div className="flex items-center gap-3 my-4 text-gray-500 text-sm">
          <div className="flex-1 h-px bg-gray-700" />
          <span>or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              className="auth-input"
              required
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              required
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone (optional, for SMS updates)"
              className="auth-input"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              required
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <button type="submit" className="auth-btn green" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
