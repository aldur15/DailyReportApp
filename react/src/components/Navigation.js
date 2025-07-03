import React from 'react';
import {User, Search, Plus} from 'lucide-react';

import "./styling/Navigation.css"

const Navigation = ({ currentPage, onPageChange, isAdmin = false }) => {
  const navItems = [
    { 
      id: 'create', 
      label: 'Create Report', 
      icon: Plus,
      description: 'Create new report'
    },
    { 
      id: 'reports', 
      label: 'View Reports', 
      icon: Search,
      description: 'Browse all reports'
    },
    ...(isAdmin ? [{ 
      id: 'admin', 
      label: 'Admin Panel', 
      icon: User,
      description: 'Administrative tools'
    }] : [])
  ];

  const handleNavigation = (itemId) => {
    if (typeof onPageChange === 'function') {
      onPageChange(itemId);
    }
  };

  return (
    <nav className="navigation-container">
      <div className="navigation-wrapper">
        <div className="navigation-content">
          {navItems.map((item) => {
  const Icon = item.icon;
  const isActive = currentPage === item.id;
  return (
    <div
      key={item.id}
      className={`navigation-item ${isActive ? 'active' : ''}`}
      onClick={() => handleNavigation(item.id)}
      title={item.description}
    >
      <Icon size={20} />
      <div className="navigation-label">{item.label}</div>
    </div>
  );
})}

        </div>
      </div>
    </nav>
  );
};

export default Navigation;