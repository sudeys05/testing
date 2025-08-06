import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CollapsibleSidebar.css';

const CollapsibleSidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Update browser history for navigation
    window.history.pushState({ section }, '', `#${section}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'cases', label: 'Cases', icon: '📋' },
    { id: 'occurrenceBook', label: 'OB Entries', icon: '📖' },
    { id: 'licensePlates', label: 'License Plates', icon: '🚗' },
  ];

  // Only show profile management for admins
  if (user?.role === 'admin') {
    menuItems.push({ id: 'profile', label: 'Officer Management', icon: '👥' });
  }

  return (
    <div className={`collapsible-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="toggle-dots">⋯</span>
        </button>
        {isExpanded && (
          <div className="sidebar-title">
            <h3>Police System</h3>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleSectionChange(item.id)}
            title={!isExpanded ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {isExpanded && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isExpanded && (
          <div className="user-info">
            <div className="user-details">
              <p className="user-name">{user?.firstName} {user?.lastName}</p>
              <p className="user-badge">{user?.badgeNumber}</p>
              <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Officer'}</p>
            </div>
          </div>
        )}
        
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title={!isExpanded ? 'Logout' : ''}
        >
          <span className="sidebar-icon">🚪</span>
          {isExpanded && <span className="sidebar-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;