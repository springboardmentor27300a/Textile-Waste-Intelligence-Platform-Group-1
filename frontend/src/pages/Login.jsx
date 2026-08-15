import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, oauth2Login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('operator@demo.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth(roleKey) {
    setError('');
    setSubmitting(true);
    try {
      await oauth2Login('google', roleKey);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleQuickLogin(demoEmail) {
    setEmail(demoEmail);
    setPassword('Password123');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <BrandMark />
          <div className="brand-name" style={{ color: 'var(--moss-dark)' }}>Textile Waste<br />Intelligence</div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to access AI textile classification & sustainability analytics.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleOAuth('recycling_facility_operator')}
            disabled={submitting}
            style={{ width: '100%', fontSize: 13, background: 'rgba(255,255,255,0.8)' }}
          >
            🔑 Continue with OAuth2 (Google Sign-In)
          </button>
        </div>

        <div className="hint" style={{ marginTop: 16 }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>⚡ One-Click Demo Role Login:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 6px' }} onClick={() => handleQuickLogin('operator@demo.com')}>
              ♻️ Operator
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 6px' }} onClick={() => handleQuickLogin('manager@demo.com')}>
              🌱 Sustainability
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 6px' }} onClick={() => handleQuickLogin('manufacturer@demo.com')}>
              🏭 Manufacturer
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 6px' }} onClick={() => handleQuickLogin('admin@demo.com')}>
              ⚙️ Admin
            </button>
          </div>
        </div>

        <div className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
