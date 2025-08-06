import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CollapsibleSidebar from './components/Sidebar/CollapsibleSidebar';
import OfficerManagement from './components/Profile/OfficerManagement';
import EnhancedCases from './components/Cases/EnhancedCases';
import Dashboard from './components/Dashboard/Dashboard';
import OccurrenceBook from './components/OccurrenceBook/OccurrenceBook';
import LicensePlateModal from './components/LicensePlateModal/LicensePlateModal';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import ForgotPasswordModal from './components/Auth/ForgotPasswordModal';
import './App.css';

const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLicensePlateModalOpen, setIsLicensePlateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const section = event.state?.section || 'dashboard';
      setActiveSection(section);
    };

    // Set initial state from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'cases', 'occurrenceBook', 'licensePlates', 'profile'].includes(hash)) {
      setActiveSection(hash);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track sidebar expansion state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setSidebarExpanded(JSON.parse(savedState));
    }
  }, []);

  const [licensePlates, setLicensePlates] = useState([
    {
      id: 'LP-1',
      plateNumber: 'ABC123',
      ownerName: 'John Smith',
      fatherName: 'Robert Smith',
      motherName: 'Mary Smith',
      idNumber: 'ID123456789',
      passportNumber: 'P987654321',
      ownerImage: null,
      dateAdded: '2025-01-15'
    }
  ]);

  const [obEntries, setOBEntries] = useState([
    {
      id: 'OB-2024-001',
      obNumber: 'OB/2024/0001',
      dateTime: '2025-01-15 14:30',
      type: 'Incident',
      description: 'Traffic accident at Main Street intersection',
      reportedBy: 'John Doe',
      recordingOfficer: 'Officer Smith',
      location: 'Main Street & 5th Ave',
      status: 'Under Investigation'
    }
  ]);

  const handleAddOB = (newOBEntry) => {
    setOBEntries(prev => [newOBEntry, ...prev]);
  };

  const handleUpdateOB = (updatedOB) => {
    setOBEntries(prev => prev.map(ob => ob.id === updatedOB.id ? updatedOB : ob));
  };

  const handleDeleteOB = (obId) => {
    setOBEntries(prev => prev.filter(ob => ob.id !== obId));
  };

  const handleAddPlate = (newPlate) => {
    setLicensePlates(prev => [newPlate, ...prev]);
  };

  const handleLicensePlateClick = () => {
    setIsLicensePlateModalOpen(true);
  };

  // Browser navigation support
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.section) {
        setActiveSection(event.state.section);
      } else {
        // Default to dashboard if no state
        const hash = window.location.hash.substring(1);
        if (hash) {
          setActiveSection(hash);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Handle initial hash on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
      setActiveSection(hash);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update sidebar expanded state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setSidebarExpanded(JSON.parse(savedState));
    }
  }, []);

  // Authentication modal handlers
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onLicensePlateClick={handleLicensePlateClick} />;
      case 'cases':
        return <EnhancedCases />;
      case 'occurrenceBook':
        return <OccurrenceBook onAddOB={handleAddOB} obEntries={obEntries} onUpdateOB={handleUpdateOB} onDeleteOB={handleDeleteOB} />;
      case 'licensePlates':
        return (
          <div style={{ padding: '30px', color: '#1f2937' }}>
            <h1>License Plate Management</h1>
            <button className="btn btn-primary" onClick={handleLicensePlateClick}>
              Add License Plate
            </button>
            <div style={{ marginTop: '20px' }}>
              {licensePlates.map(plate => (
                <div key={plate.id} style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
                  <h3>{plate.plateNumber}</h3>
                  <p><strong>Owner:</strong> {plate.ownerName}</p>
                  <p><strong>Father:</strong> {plate.fatherName}</p>
                  <p><strong>Mother:</strong> {plate.motherName}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return <OfficerManagement />;
      default:
        return (
          <div style={{ padding: '30px', color: '#1f2937' }}>
            <h1 style={{ textTransform: 'capitalize' }}>{activeSection}</h1>
            <p>This section is coming soon...</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Police Management System</h2>
          <p>Loading secure connection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-content">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-badge">🛡️</div>
              <h1>Police Management System</h1>
              <p>Secure Law Enforcement Portal</p>
            </div>
          </div>
          
          <div className="login-form">
            <button 
              className="login-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Access System
            </button>
            
            <div className="login-help">
              Authorized personnel only. Please use your official credentials to access the system.
            </div>
            
            <div className="default-credentials">
              <strong>Demo Access:</strong><br />
              Username: <strong>admin</strong><br />
              Password: <strong>admin123</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <CollapsibleSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
      />
      <div className="main-content-wrapper">
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <LicensePlateModal
        isOpen={isLicensePlateModalOpen}
        onClose={() => setIsLicensePlateModalOpen(false)}
        onAddPlate={handleAddPlate}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;