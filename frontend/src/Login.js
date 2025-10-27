import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Login.css';

function Login({ onSuccess }) {
  const { login, register, authEnabled } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState('local');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isRegistering) {
        result = await register(formData.username, formData.password, formData.email);
      } else {
        result = await login(formData.username, formData.password, authMethod);
      }

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!authEnabled) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎯 OrchestrateUI</h1>
          <h2>{isRegistering ? 'Create Account' : 'Sign In'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}

          {!isRegistering && (
            <div className="form-group">
              <label htmlFor="authMethod">Authentication Method</label>
              <select
                id="authMethod"
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value)}
              >
                <option value="local">Username/Password</option>
                <option value="ldap">LDAP</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering 
              ? 'Already have an account? Sign in' 
              : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
