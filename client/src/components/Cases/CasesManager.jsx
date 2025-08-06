import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  Edit2,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CasesManager.css';

const CasesManager = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewHistory, setViewHistory] = useState(['list']); // Track navigation history
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const caseStatuses = ['Open', 'In Progress', 'Pending', 'Closed', 'Archived'];
  const casePriorities = ['Low', 'Medium', 'High', 'Critical'];
  const caseTypes = [
    'Theft', 'Burglary', 'Assault', 'Domestic Violence', 'Drug Offense',
    'Traffic Violation', 'Fraud', 'Vandalism', 'Missing Person', 'Other'
  ];

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (viewHistory.length > 1) {
        const newHistory = [...viewHistory];
        newHistory.pop(); // Remove current view
        const previousView = newHistory[newHistory.length - 1];
        setViewHistory(newHistory);
        setCurrentView(previousView);
        if (previousView === 'list') {
          setSelectedCase(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewHistory]);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cases');
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      setError('Failed to fetch cases');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(caseItem => 
        caseItem.caseNumber?.toLowerCase().includes(search) ||
        caseItem.title?.toLowerCase().includes(search) ||
        caseItem.description?.toLowerCase().includes(search) ||
        caseItem.location?.toLowerCase().includes(search) ||
        caseItem.assignedOfficer?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(caseItem => caseItem.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(caseItem => caseItem.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  };

  const navigateToView = (newView, caseData = null) => {
    // Add current view to history
    const newHistory = [...viewHistory, newView];
    setViewHistory(newHistory);
    setCurrentView(newView);
    
    if (caseData) {
      setSelectedCase(caseData);
    }

    // Update browser history
    window.history.pushState({ view: newView }, '', '');
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // Remove current view
      const previousView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setCurrentView(previousView);
      
      if (previousView === 'list') {
        setSelectedCase(null);
      }
      
      // Update browser history
      window.history.back();
    }
  };

  const handleCaseClick = (caseItem) => {
    navigateToView('detail', caseItem);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="status-icon" />;
      case 'In Progress': return <Clock className="status-icon" />;
      case 'Closed': return <CheckCircle className="status-icon" />;
      case 'Archived': return <Archive className="status-icon" />;
      default: return <FileText className="status-icon" />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  };

  // Cases List View
  const CasesList = () => (
    <div className="cases-list">
      <div className="cases-header">
        <div className="header-content">
          <FileText className="header-icon" />
          <div>
            <h1>Cases Management</h1>
            <p>Manage and track police cases</p>
          </div>
        </div>
        <button className="add-case-btn" onClick={() => navigateToView('create')}>
          <Plus size={18} />
          New Case
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {caseStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            {casePriorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="cases-grid">
        {isLoading ? (
          <div className="loading-state">Loading cases...</div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No cases found</h3>
            <p>Create a new case or adjust your search filters</p>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="case-card" onClick={() => handleCaseClick(caseItem)}>
              <div className="case-header">
                <div className="case-info">
                  <h3>{caseItem.caseNumber}</h3>
                  <p className="case-title">{caseItem.title}</p>
                </div>
                <div className={`priority-badge ${getPriorityClass(caseItem.priority)}`}>
                  {caseItem.priority}
                </div>
              </div>
              <div className="case-body">
                <div className="status-row">
                  {getStatusIcon(caseItem.status)}
                  <span className="status-text">{caseItem.status}</span>
                </div>
                <div className="case-details">
                  <p><strong>Type:</strong> {caseItem.type}</p>
                  <p><strong>Date:</strong> {new Date(caseItem.incidentDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {caseItem.location}</p>
                  {caseItem.assignedOfficer && (
                    <p><strong>Officer:</strong> {caseItem.assignedOfficer}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Case Detail View
  const CaseDetail = () => (
    <div className="case-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={20} />
          Back to Cases
        </button>
        <div className="detail-actions">
          <button onClick={() => navigateToView('edit', selectedCase)}>
            <Edit2 size={16} />
            Edit Case
          </button>
        </div>
      </div>
      
      <div className="case-info-panel">
        <div className="panel-header">
          <h1>Case #{selectedCase?.caseNumber}</h1>
          <div className="case-badges">
            <span className={`priority-badge ${getPriorityClass(selectedCase?.priority)}`}>
              {selectedCase?.priority} Priority
            </span>
            <span className="status-badge">
              {getStatusIcon(selectedCase?.status)}
              {selectedCase?.status}
            </span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h3>Case Information</h3>
            <div className="info-grid">
              <div><strong>Title:</strong> {selectedCase?.title}</div>
              <div><strong>Type:</strong> {selectedCase?.type}</div>
              <div><strong>Incident Date:</strong> {new Date(selectedCase?.incidentDate).toLocaleString()}</div>
              <div><strong>Reported Date:</strong> {new Date(selectedCase?.reportedDate || selectedCase?.createdAt).toLocaleString()}</div>
              <div><strong>Location:</strong> {selectedCase?.location}</div>
              <div><strong>Assigned Officer:</strong> {selectedCase?.assignedOfficer || 'Unassigned'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p className="case-description">{selectedCase?.description}</p>
          </div>

          {selectedCase?.evidence && (
            <div className="detail-section">
              <h3>Evidence</h3>
              <div className="evidence-list">
                {/* Evidence items would be listed here */}
                <p>Evidence management coming soon...</p>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Activity Log</h3>
            <div className="activity-log">
              <div className="activity-item">
                <span className="activity-time">{new Date(selectedCase?.createdAt).toLocaleString()}</span>
                <span className="activity-text">Case created</span>
              </div>
              {selectedCase?.updatedAt !== selectedCase?.createdAt && (
                <div className="activity-item">
                  <span className="activity-time">{new Date(selectedCase?.updatedAt).toLocaleString()}</span>
                  <span className="activity-text">Case updated</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render appropriate view based on currentView state
  switch (currentView) {
    case 'detail':
      return <CaseDetail />;
    case 'create':
      return (
        <div className="case-form">
          <button className="back-btn" onClick={goBack}>
            <ArrowLeft size={20} />
            Back to Cases
          </button>
          <h1>Create New Case</h1>
          <p>Case creation form coming soon...</p>
        </div>
      );
    case 'edit':
      return (
        <div className="case-form">
          <button className="back-btn" onClick={goBack}>
            <ArrowLeft size={20} />
            Back to Case
          </button>
          <h1>Edit Case</h1>
          <p>Case editing form coming soon...</p>
        </div>
      );
    default:
      return <CasesList />;
  }
};

export default CasesManager;