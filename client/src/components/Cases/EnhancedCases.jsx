import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EnhancedCases.css';

const EnhancedCases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium'
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCase ? `/api/cases/${editingCase.id}` : '/api/cases';
      const method = editingCase ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCases();
        setIsModalOpen(false);
        setEditingCase(null);
        setFormData({
          title: '',
          description: '',
          status: 'open',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error saving case:', error);
    }
  };

  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title || '',
      description: caseItem.description || '',
      status: caseItem.status || 'open',
      priority: caseItem.priority || 'medium'
    });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchCases();
      }
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const handleDelete = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        const response = await fetch(`/api/cases/${caseId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          await fetchCases();
        }
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#059669';
      case 'in_progress': return '#d97706';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  if (loading) {
    return <div className="loading">Loading cases...</div>;
  }

  return (
    <div className="enhanced-cases">
      <div className="cases-header">
        <h1>Case Management</h1>
        <button 
          className="btn btn-primary add-case-btn"
          onClick={() => {
            setEditingCase(null);
            setFormData({
              title: '',
              description: '',
              status: 'open',
              priority: 'medium'
            });
            setIsModalOpen(true);
          }}
        >
          + Add New Case
        </button>
      </div>

      <div className="cases-grid">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="case-card">
            <div className="case-header">
              <div className="case-number">{caseItem.caseNumber}</div>
              <div className="case-actions">
                <button
                  className="btn-icon edit-btn"
                  onClick={() => handleEdit(caseItem)}
                  title="Edit Case"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete-btn"
                  onClick={() => handleDelete(caseItem.id)}
                  title="Delete Case"
                >
                  🗑️
                </button>
              </div>
            </div>

            <h3 className="case-title">{caseItem.title}</h3>
            <p className="case-description">{caseItem.description}</p>

            <div className="case-meta">
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <span 
                  className="status-badge" 
                  style={{ color: getStatusColor(caseItem.status) }}
                >
                  {caseItem.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Priority:</span>
                <span 
                  className="priority-badge"
                  style={{ color: getPriorityColor(caseItem.priority) }}
                >
                  {caseItem.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="case-status-actions">
              {caseItem.status === 'open' && (
                <button
                  className="btn btn-warning"
                  onClick={() => handleStatusUpdate(caseItem.id, 'in_progress')}
                >
                  Mark In Progress
                </button>
              )}
              {caseItem.status === 'in_progress' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate(caseItem.id, 'closed')}
                >
                  Close Case
                </button>
              )}
              {caseItem.status === 'closed' && (
                <button
                  className="btn btn-info"
                  onClick={() => handleStatusUpdate(caseItem.id, 'open')}
                >
                  Reopen Case
                </button>
              )}
            </div>

            <div className="case-footer">
              <small className="case-date">
                Created: {new Date(caseItem.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="empty-state">
          <h3>No Cases Found</h3>
          <p>Click "Add New Case" to create your first case.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal case-modal">
            <div className="modal-header">
              <h2>{editingCase ? 'Edit Case' : 'Add New Case'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="case-form">
              <div className="form-group">
                <label className="form-label">Case Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  required
                  placeholder="Enter case title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows={4}
                  placeholder="Enter case description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCase ? 'Update Case' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCases;