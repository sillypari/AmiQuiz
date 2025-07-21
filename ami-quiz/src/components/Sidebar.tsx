import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'home', path: '/student/dashboard' },
  { label: 'Tests', icon: 'file-text', path: '/student/tests' },
  { label: 'Practice', icon: 'edit-3', path: '/student/practice' },
  { label: 'Goals', icon: 'target', path: '/student/goals' },
  { label: 'Reports', icon: 'bar-chart-2', path: '/student/reports' },
  { label: 'Community', icon: 'users', path: '/student/community' },
  { label: 'Settings', icon: 'settings', path: '/student/settings' },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`bg-[#003366] text-white h-screen sticky top-0 transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-blue-900">
        <span className="font-bold text-lg tracking-wide flex items-center gap-2">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M8 12l2 2 4-4" strokeWidth="2" /></svg>
          {!collapsed && 'AmiQuiz'}
        </span>
        <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" className="ml-2 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'} />
          </svg>
        </button>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 my-1 rounded-lg transition-colors duration-200 hover:bg-blue-800 focus:bg-blue-800 outline-none ${isActive ? 'bg-blue-900 font-semibold' : ''}`
            }
            tabIndex={0}
            aria-label={item.label}
          >
            <span className="inline-block w-6 h-6">
              <i className={`feather feather-${item.icon}`}></i>
            </span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 