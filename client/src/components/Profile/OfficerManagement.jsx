import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './OfficerManagement.css';

const OfficerManagement = () => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    badgeNumber: '',
    department: '',
    position: '',
    phone: '',
    role: 'user'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOfficers();
    }
  }, [user]);

  useEffect(() => {
    filterOfficers();
  }, [officers, searchTerm, departmentFilter]);

  const fetchOfficers = async () => {
    try {
      const response = await fetch('/api/officers', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOfficers(data);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOfficers = () => {
    let filtered = officers;

    if (searchTerm) {
      filtered = filtered.filter(officer =>
        officer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.badgeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(officer => officer.department === departmentFilter);
    }

    setFilteredOfficers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingOfficer ? `/api/officers/${editingOfficer.id}` : '/api/officers';
      const method = editingOfficer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchOfficers();
        setIsModalOpen(false);
        setEditingOfficer(null);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          badgeNumber: '',
          department: '',
          position: '',
          phone: '',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error saving officer:', error);
    }
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      firstName: officer.firstName || '',
      lastName: officer.lastName || '',
      email: officer.email || '',
      badgeNumber: officer.badgeNumber || '',
      department: officer.department || '',
      position: officer.position || '',
      phone: officer.phone || '',
      role: officer.role || 'user'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (officerId) => {
    if (window.confirm('Are you sure you want to delete this officer?')) {
      try {
        const response = await fetch(`/api/officers/${officerId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          await fetchOfficers();
        }
      } catch (error) {
        console.error('Error deleting officer:', error);
      }
    }
  };

  const departments = [...new Set(officers.map(o => o.department).filter(Boolean))];

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only administrators can access officer management.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading officers...</div>;
  }

  return (
    <div className="officer-management">
      <div className="officer-header">
        <h1>Officer Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingOfficer(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              badgeNumber: '',
              department: '',
              position: '',
              phone: '',
              role: 'user'
            });
            setIsModalOpen(true);
          }}
        >
          Add New Officer
        </button>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, badge number, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="officers-grid">
        {filteredOfficers.map((officer) => (
          <div key={officer.id} className="officer-card">
            <div className="officer-header-card">
              <h3>{officer.firstName} {officer.lastName}</h3>
              <div className="officer-actions">
                <button
                  className="btn-icon edit-btn"
                  onClick={() => handleEdit(officer)}
                  title="Edit Officer"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete-btn"
                  onClick={() => handleDelete(officer.id)}
                  title="Delete Officer"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="officer-details">
              <p><strong>Badge:</strong> {officer.badgeNumber}</p>
              <p><strong>Email:</strong> {officer.email}</p>
              <p><strong>Department:</strong> {officer.department}</p>
              <p><strong>Position:</strong> {officer.position}</p>
              <p><strong>Phone:</strong> {officer.phone}</p>
              <p><strong>Role:</strong> {officer.role === 'admin' ? 'Administrator' : 'Officer'}</p>
              <p><strong>Status:</strong> 
                <span className={`status ${officer.isActive ? 'active' : 'inactive'}`}>
                  {officer.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal officer-modal">
            <div className="modal-header">
              <h2>{editingOfficer ? 'Edit Officer' : 'Add New Officer'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="officer-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Badge Number</label>
                  <input
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({...formData, badgeNumber: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="form-select"
                  >
                    <option value="user">Officer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOfficer ? 'Update Officer' : 'Add Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerManagement;