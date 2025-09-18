import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

interface LoginProps {
  onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      // Call parent login handler
      onLogin(token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials hint
  const handleDemoLogin = () => {
    setEmail('admin@eventconnectionsgroup.com');
    setPassword('admin123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ECG Intelligence</h1>
          <p>Corporate Travel & Event Planning Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="demo-hint">
            <button 
              type="button"
              className="demo-button"
              onClick={handleDemoLogin}
            >
              Use demo credentials
            </button>
            <div className="demo-info">
              <small>Email: admin@eventconnectionsgroup.com</small>
              <small>Password: admin123</small>
            </div>
          </div>
        </form>

        <div className="demo-hint">
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => navigate('/hotel/login')}
          >
            Hotel Admin
          </button>
          <div className="demo-info">
            <small>Hotel portal for property managers</small>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2024 ECG Intelligence. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Login; 