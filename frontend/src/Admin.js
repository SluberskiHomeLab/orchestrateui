import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Admin() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user',
    authMethod: 'local'
  });

  const [keyForm, setKeyForm] = useState({
    name: '',
    expiresAt: ''
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadApiKeys();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const loadApiKeys = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/apikeys`);
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        await axios.put(`${API_URL}/admin/users/${editingUser.id}`, userForm);
        setSuccess('User updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/users`, userForm);
        setSuccess('User created successfully');
      }
      
      loadUsers();
      resetUserForm();
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      loadUsers();
      loadApiKeys();
    } catch (error) {
      setError(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setUserForm({
      username: userToEdit.username,
      password: '',
      email: userToEdit.email || '',
      role: userToEdit.role,
      authMethod: userToEdit.authMethod
    });
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      password: '',
      email: '',
      role: 'user',
      authMethod: 'local'
    });
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleKeySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNewApiKey('');

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/admin/users/${selectedUserId}/apikeys`, keyForm);
      setSuccess('API key created successfully');
      setNewApiKey(response.data.key);
      loadApiKeys();
      resetKeyForm();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      await axios.delete(`${API_URL}/admin/apikeys/${keyId}`);
      setSuccess('API key deleted successfully');
      loadApiKeys();
    } catch (error) {
      setError(error.response?.data?.error || 'Delete failed');
    }
  };

  const resetKeyForm = () => {
    setKeyForm({
      name: '',
      expiresAt: ''
    });
    setSelectedUserId('');
    setShowKeyForm(false);
  };

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>👤 Administration</h2>
      </div>

      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}
      {newApiKey && (
        <div className="message success-message">
          <strong>New API Key (save this - it won't be shown again):</strong>
          <div className="api-key-display">
            <code>{newApiKey}</code>
            <button 
              className="btn btn-small"
              onClick={() => {
                navigator.clipboard.writeText(newApiKey);
                alert('API key copied to clipboard!');
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'apikeys' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('apikeys')}
        >
          API Keys
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>User Management</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowUserForm(!showUserForm)}
            >
              {showUserForm ? 'Cancel' : '+ New User'}
            </button>
          </div>

          {showUserForm && (
            <form className="admin-form" onSubmit={handleUserSubmit}>
              <h4>{editingUser ? 'Edit User' : 'Create New User'}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser && userForm.authMethod === 'local'}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Auth Method *</label>
                <select
                  value={userForm.authMethod}
                  onChange={(e) => setUserForm({ ...userForm, authMethod: e.target.value })}
                  disabled={editingUser}
                >
                  <option value="local">Local (Username/Password)</option>
                  <option value="oidc">OIDC/OAuth2</option>
                  <option value="ldap">LDAP</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetUserForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Auth Method</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className={`badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.authMethod}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEditUser(u)}
                        disabled={u.id === user.id}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apikeys' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>API Key Management</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowKeyForm(!showKeyForm)}
            >
              {showKeyForm ? 'Cancel' : '+ New API Key'}
            </button>
          </div>

          {showKeyForm && (
            <form className="admin-form" onSubmit={handleKeySubmit}>
              <h4>Create New API Key</h4>
              
              <div className="form-group">
                <label>User *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email || 'no email'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Key Name *</label>
                <input
                  type="text"
                  value={keyForm.name}
                  onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                  placeholder="e.g., Production API, CI/CD Pipeline"
                  required
                />
              </div>

              <div className="form-group">
                <label>Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={keyForm.expiresAt}
                  onChange={(e) => setKeyForm({ ...keyForm, expiresAt: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create API Key
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetKeyForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>User</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(k => {
                  const keyUser = users.find(u => u.id === k.userId);
                  return (
                    <tr key={k.id}>
                      <td>{k.name}</td>
                      <td>{keyUser?.username || 'Unknown'}</td>
                      <td><code>{k.key}</code></td>
                      <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}</td>
                      <td>{k.lastUsed ? new Date(k.lastUsed).toLocaleString() : 'Never'}</td>
                      <td>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteKey(k.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
