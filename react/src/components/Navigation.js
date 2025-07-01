import React from 'react';
import {User, Search, Plus} from 'lucide-react';

const Navigation = ({ currentPage, onPageChange, isAdmin }) => {
  const navItems = [
    { id: 'create', label: 'Create Report', icon: Plus },
    { id: 'reports', label: 'View Reports', icon: Search },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: User }] : [])
  ];

  return (
    <nav className="bg-white shadow-sm border-b mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === item.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};


export default Navigation;