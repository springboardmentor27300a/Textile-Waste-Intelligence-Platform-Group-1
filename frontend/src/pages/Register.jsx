import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'recycling_facility_operator', label: 'Recycling Facility Operator' },
  { value: 'sustainability_manager', label: 'Sustainability Manager' },
  { value: 'textile_manufacturer', label: 'Textile Manufacturer' },
  { value: 'administrator', label: 'Administrator' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', role: ROLES[0].value,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ width: 420 }}>
        <div className="auth-brand">
          <BrandMark />
          <div className="brand-name" style={{ color: 'var(--moss-dark)' }}>Textile Waste<br />Intelligence</div>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Register with a role to access the right dashboard.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              minLength={8} required />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
