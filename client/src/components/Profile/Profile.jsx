import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = ({ onRegisterClick }) => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    badgeNumber: user?.badgeNumber || '',
    department: user?.department || '',
    position: user?.position || '',
    phone: user?.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      badgeNumber: user?.badgeNumber || '',
      department: user?.department || '',
      position: user?.position || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        </div>
        <div className="profile-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p className="profile-role">{user.role === 'admin' ? 'Administrator' : 'Officer'}</p>
          <p className="profile-badge">Badge: {user.badgeNumber || 'N/A'}</p>
        </div>
        <div className="profile-actions">
          {!isEditing && (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="badgeNumber">Badge Number</label>
                  <input
                    type="text"
                    id="badgeNumber"
                    name="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="position">Position/Rank</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="details-section">
              <h3>Personal Information</h3>
              <div className="detail-row">
                <div className="detail-item">
                  <label>Name</label>
                  <span>{user.firstName} {user.lastName}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <span>{user.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Professional Information</h3>
              <div className="detail-row">
                <div className="detail-item">
                  <label>Badge Number</label>
                  <span>{user.badgeNumber || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Department</label>
                  <span>{user.department || 'Not specified'}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>Position/Rank</label>
                <span>{user.position || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Access Level</label>
                <span className={`role-badge ${user.role}`}>
                  {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>
            </div>

            <div className="details-section">
              <h3>Account Information</h3>
              <div className="detail-row">
                <div className="detail-item">
                  <label>Username</label>
                  <span>{user.username}</span>
                </div>
                <div className="detail-item">
                  <label>Account Status</label>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <label>Member Since</label>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Login</label>
                  <span>
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="admin-section">
            <h3>Administrator Actions</h3>
            <div className="admin-actions">
              <button className="admin-btn register-user-btn" onClick={onRegisterClick}>
                Register New User
              </button>
            </div>
          </div>
        )}

        <div className="profile-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;