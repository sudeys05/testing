import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Shield, 
  Phone, 
  Mail, 
  MapPin,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './EnhancedProfile.css';

const EnhancedProfile = () => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    badgeNumber: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    specialization: '',
    yearsOfService: '',
    status: 'active'
  });

  const departments = [
    'Criminal Investigation',
    'Traffic Police',
    'Community Policing',
    'Cybercrime Unit',
    'Narcotics Division',
    'Forensics',
    'K-9 Unit',
    'SWAT Team',
    'Internal Affairs',
    'Administrative',
    'Patrol Division'
  ];

  const positions = [
    'Police Officer',
    'Sergeant',
    'Lieutenant',
    'Captain',
    'Inspector',
    'Detective',
    'Specialist',
    'Chief Inspector',
    'Deputy Commissioner',
    'Commissioner'
  ];

  const specializations = [
    'Criminal Investigation',
    'Traffic Management',
    'Cybercrime',
    'Forensics',
    'Drug Enforcement',
    'Community Relations',
    'Emergency Response',
    'Counter Terrorism',
    'Financial Crimes',
    'Domestic Violence'
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOfficers();
    }
  }, [user]);

  useEffect(() => {
    filterOfficers();
  }, [officers, searchTerm, filterDepartment]);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/officers');
      if (response.ok) {
        const data = await response.json();
        setOfficers(data);
      }
    } catch (error) {
      setError('Failed to fetch officers data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOfficers = () => {
    let filtered = [...officers];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(officer => 
        officer.firstName?.toLowerCase().includes(search) ||
        officer.lastName?.toLowerCase().includes(search) ||
        officer.badgeNumber?.toLowerCase().includes(search) ||
        officer.department?.toLowerCase().includes(search) ||
        officer.position?.toLowerCase().includes(search) ||
        officer.email?.toLowerCase().includes(search)
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(officer => officer.department === filterDepartment);
    }

    setFilteredOfficers(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = editingId ? `/api/officers/${editingId}` : '/api/officers';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchOfficers();
        resetForm();
        setShowAddForm(false);
        setEditingId(null);
      } else {
        const error = await response.json();
        setError(error.message || 'Operation failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (officer) => {
    setFormData({
      firstName: officer.firstName || '',
      lastName: officer.lastName || '',
      badgeNumber: officer.badgeNumber || '',
      department: officer.department || '',
      position: officer.position || '',
      email: officer.email || '',
      phone: officer.phone || '',
      address: officer.address || '',
      emergencyContact: officer.emergencyContact || '',
      specialization: officer.specialization || '',
      yearsOfService: officer.yearsOfService || '',
      status: officer.status || 'active'
    });
    setEditingId(officer.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this officer record?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/officers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchOfficers();
      } else {
        setError('Failed to delete officer');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      badgeNumber: '',
      department: '',
      position: '',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      specialization: '',
      yearsOfService: '',
      status: 'active'
    });
    setEditingId(null);
    setError('');
  };

  const exportData = () => {
    const csvContent = [
      ['Badge Number', 'Name', 'Department', 'Position', 'Email', 'Phone', 'Status', 'Years of Service'],
      ...filteredOfficers.map(officer => [
        officer.badgeNumber,
        `${officer.firstName} ${officer.lastName}`,
        officer.department,
        officer.position,
        officer.email,
        officer.phone,
        officer.status,
        officer.yearsOfService
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'officers_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="enhanced-profile">
        <div className="access-denied">
          <Shield size={48} />
          <h2>Access Restricted</h2>
          <p>You need administrative privileges to access profile management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-profile">
      <div className="profile-header">
        <div className="header-content">
          <Shield className="header-icon" />
          <div>
            <h1>Officer Profile Management</h1>
            <p>Manage police officer profiles, departments, and records</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={exportData}>
            <Download size={18} />
            Export Data
          </button>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            Add Officer
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, badge number, department, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={20} />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="officer-form-modal">
            <div className="form-header">
              <h2>{editingId ? 'Edit Officer' : 'Add New Officer'}</h2>
              <button onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="officer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Badge Number *</label>
                  <input
                    type="text"
                    name="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Years of Service</label>
                  <input
                    type="number"
                    name="yearsOfService"
                    value={formData.yearsOfService}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Name and phone number"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}>
                  <Save size={18} />
                  {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="officers-grid">
        {isLoading && officers.length === 0 ? (
          <div className="loading-state">Loading officers...</div>
        ) : filteredOfficers.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No officers found</h3>
            <p>Add new officers or adjust your search filters</p>
          </div>
        ) : (
          filteredOfficers.map((officer) => (
            <div key={officer.id} className="officer-card">
              <div className="card-header">
                <div className="officer-info">
                  <h3>{officer.firstName} {officer.lastName}</h3>
                  <p className="badge-number">Badge #{officer.badgeNumber}</p>
                </div>
                <div className={`status-badge ${officer.status}`}>
                  {officer.status}
                </div>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <Shield size={16} />
                  <span>{officer.department}</span>
                </div>
                <div className="info-row">
                  <User size={16} />
                  <span>{officer.position}</span>
                </div>
                {officer.email && (
                  <div className="info-row">
                    <Mail size={16} />
                    <span>{officer.email}</span>
                  </div>
                )}
                {officer.phone && (
                  <div className="info-row">
                    <Phone size={16} />
                    <span>{officer.phone}</span>
                  </div>
                )}
                {officer.specialization && (
                  <div className="info-row">
                    <span className="specialization">{officer.specialization}</span>
                  </div>
                )}
                {officer.yearsOfService && (
                  <div className="years-service">
                    {officer.yearsOfService} years of service
                  </div>
                )}
              </div>
              <div className="card-actions">
                <button onClick={() => handleEdit(officer)} className="edit-btn">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(officer.id)} className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedProfile;