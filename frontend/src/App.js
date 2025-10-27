import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    method: 'GET',
    url: '',
    headers: '{}',
    body: '',
    schedule: '',
    webhookUrl: '',
    enabled: true
  });

  useEffect(() => {
    loadTasks();
    loadHistory();
    const interval = setInterval(() => {
      loadHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history?limit=20`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        headers: formData.headers ? JSON.parse(formData.headers) : {},
        body: formData.body || null
      };

      if (editingTask) {
        await axios.put(`${API_URL}/tasks/${editingTask.id}`, taskData);
      } else {
        await axios.post(`${API_URL}/tasks`, taskData);
      }

      loadTasks();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task: ' + error.message);
    }
  };

  const handleExecute = async (taskId) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/execute`);
      setTimeout(loadHistory, 500);
      alert('Task executed successfully');
    } catch (error) {
      console.error('Error executing task:', error);
      alert('Error executing task: ' + error.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task: ' + error.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      method: task.method,
      url: task.url,
      headers: JSON.stringify(task.headers || {}, null, 2),
      body: task.body || '',
      schedule: task.schedule || '',
      webhookUrl: task.webhookUrl || '',
      enabled: task.enabled
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      method: 'GET',
      url: '',
      headers: '{}',
      body: '',
      schedule: '',
      webhookUrl: '',
      enabled: true
    });
    setEditingTask(null);
    setShowForm(false);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🎯 OrchestrateUI</h1>
        <p>API Automation & Scheduling Tool</p>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={activeTab === 'tasks' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={activeTab === 'history' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('history')}
          >
            Execution History
          </button>
        </div>

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>API Tasks</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : '+ New Task'}
              </button>
            </div>

            {showForm && (
              <form className="task-form" onSubmit={handleSubmit}>
                <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                
                <div className="form-group">
                  <label>Task Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Method *</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div className="form-group flex-grow">
                    <label>URL *</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://api.example.com/endpoint"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Headers (JSON)</label>
                  <textarea
                    value={formData.headers}
                    onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                    placeholder='{"Content-Type": "application/json"}'
                    rows="3"
                  />
                </div>

                {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
                  <div className="form-group">
                    <label>Request Body</label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder='{"key": "value"}'
                      rows="4"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="*/5 * * * * (every 5 minutes)"
                  />
                  <small>Examples: "*/5 * * * *" (every 5 min), "0 9 * * *" (daily at 9am)</small>
                </div>

                <div className="form-group">
                  <label>Webhook URL (for notifications)</label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="https://webhook.site/your-unique-url"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks yet. Create your first API automation task!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <div className="task-info">
                        <h3>{task.name}</h3>
                        <p className="task-description">{task.description}</p>
                      </div>
                      <div className="task-status">
                        <span className={`status-badge ${task.enabled ? 'enabled' : 'disabled'}`}>
                          {task.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="task-details">
                      <div className="detail-item">
                        <strong>Method:</strong> <span className={`method method-${task.method.toLowerCase()}`}>{task.method}</span>
                      </div>
                      <div className="detail-item">
                        <strong>URL:</strong> <span className="url">{task.url}</span>
                      </div>
                      {task.schedule && (
                        <div className="detail-item">
                          <strong>Schedule:</strong> <code>{task.schedule}</code>
                        </div>
                      )}
                      {task.webhookUrl && (
                        <div className="detail-item">
                          <strong>Webhook:</strong> <span className="url">{task.webhookUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="task-actions">
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleExecute(task.id)}
                      >
                        ▶ Execute Now
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(task)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(task.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="section-header">
              <h2>Execution History</h2>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>No execution history yet. Execute a task to see results here.</p>
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(exec => (
                      <tr key={exec.id}>
                        <td>{new Date(exec.startTime).toLocaleString()}</td>
                        <td>{exec.taskName}</td>
                        <td>
                          <span className={`status-badge ${exec.status}`}>
                            {exec.status}
                          </span>
                        </td>
                        <td>{exec.duration}ms</td>
                        <td>
                          {exec.statusCode && <span>Status: {exec.statusCode}</span>}
                          {exec.error && <span className="error-text">Error: {exec.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
