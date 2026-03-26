import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand-section">
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
        <span className="nav-link disabled">
          Scenario Analysis <span className="coming-soon-badge">Soon</span>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
