import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  History, 
  BookOpen, 
  Settings, 
  LogOut,
  Users,
  ShieldCheck,
  UploadCloud,
  FileText,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const studentNavItems = [
    { icon: <LayoutDashboard size={24} />, label: 'Overview', path: '/dashboard' },
    { icon: <ClipboardList size={24} />, label: 'My Tests', path: '/test' },
    { icon: <BarChart3 size={24} />, label: 'Performance', path: '/results' },
    { icon: <History size={24} />, label: 'Review', path: '/solutions-review' },
    { icon: <BookOpen size={24} />, label: 'Resources', path: '/resources' },
    { icon: <ShieldCheck size={24} />, label: 'Plans', path: '/pricing' },
  ];

  const adminNavItems = [
    { icon: <LayoutDashboard size={24} />, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: <ShieldAlert size={24} />, label: 'Approvals', path: '/admin/approvals/pending' },
    { icon: <ClipboardList size={24} />, label: 'Manage Tests', path: '/admin/tests' },
    { icon: <Users size={24} />, label: 'Students', path: '/admin/users' },
    { icon: <BarChart3 size={24} />, label: 'All Results', path: '/admin/results' },
    { icon: <FileText size={24} />, label: 'Resources', path: '/admin/resources' },
    { icon: <CreditCard size={24} />, label: 'Subscriptions', path: '/admin/subscriptions' },
  ];


  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <aside className="sidebar-rail" style={{ zIndex: 100 }}>
      <div style={{ marginBottom: '2.5rem' }} className="mobile-hide">
        <img src="/logo.png" alt="Mcqvitals Logo" style={{ height: '56px', borderRadius: '12px', objectFit: 'contain' }} />
      </div>

      <nav style={{ 
        display: 'flex', 
        flexDirection: 'inherit', 
        gap: '0.8rem', 
        flex: 1, 
        justifyContent: 'flex-start', 
        alignItems: 'center',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            style={({ isActive }) => ({
              width: '44px',
              height: '44px',
              flexShrink: 0,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: isActive ? 'var(--primary-container)' : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'inherit', gap: '0.8rem', marginTop: 'auto', alignItems: 'center' }}>
        {user?.role !== 'admin' && (
          <NavLink 
            to="/settings"
            title="Settings"
            style={({ isActive }) => ({
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: isActive ? 'var(--primary-container)' : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            <Settings size={24} />
          </NavLink>
        )}
        <button 
          onClick={logout}
          title="Log Out" 
          style={{ color: 'var(--error)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="mobile-hide"
        >
          <LogOut size={24} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
