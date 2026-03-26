import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand-section">
        <svg className="navbar-logo" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="8" fill="#1a73e8"/>
          <rect x="7" y="20" width="5" height="9" rx="1.5" fill="white"/>
          <rect x="15.5" y="13" width="5" height="16" rx="1.5" fill="white" opacity="0.85"/>
          <rect x="24" y="7" width="5" height="22" rx="1.5" fill="white" opacity="0.65"/>
        </svg>
        <span className="navbar-brand-title">T4 Survey Dashboard</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          About
        </NavLink>
        <NavLink
          to="/attitudes/environmental"
          className={({ isActive }) =>
            window.location.hash.includes('/attitudes') ? 'nav-link active' : 'nav-link'
          }
        >
          Survey Explorer
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
