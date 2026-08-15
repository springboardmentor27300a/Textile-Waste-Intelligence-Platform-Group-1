import { NavLink } from 'react-router-dom';
import BrandMark from './BrandMark';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  recycling_facility_operator: 'Recycling Operator',
  sustainability_manager: 'Sustainability Manager',
  textile_manufacturer: 'Textile Manufacturer',
  administrator: 'Administrator',
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandMark />
        <div className="brand-name">Textile Waste<br /><span style={{ color: '#10b981', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>INTELLIGENCE</span></div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📦</span> Textile Inventory
        </NavLink>
        <NavLink to="/datasets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📂</span> Datasets Hub
        </NavLink>
        <NavLink to="/prediction" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>🤖</span> AI Computer Vision
        </NavLink>
        <NavLink to="/image-analysis" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📷</span> Texture Diagnostics
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>🌱</span> Analytics & Engines
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📄</span> ESG & Impact Reports
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 700, color: '#ffffff' }}>{user?.full_name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{user?.email}</div>
        <span className="role-pill" style={{ background: '#10b981', color: '#091f11', fontWeight: 700, margin: '8px 0 10px 0', display: 'inline-block' }}>
          {ROLE_LABELS[user?.role] || user?.role}
        </span>
        <button className="logout-btn" onClick={logout} style={{ width: '100%', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
