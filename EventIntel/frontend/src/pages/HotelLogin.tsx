import { useState } from 'react';
import axios from 'axios';
import './Login.css';

interface Props {
  onLogin: (token: string) => void;
}

function HotelLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/hotels/login`, { email, password });
      const token = res.data.token;
      localStorage.setItem('hotelToken', token);
      onLogin(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hotel Portal</h1>
          <p>Sign in to manage your property</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="hotel-email">Email Address</label>
            <input id="hotel-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="hotel-password">Password</label>
            <input id="hotel-password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demo-hint">
          <p>Seed account: manager@grandvelasloscabos.com / hotel123</p>
        </div>
      </div>
    </div>
  );
}

export default HotelLogin;


