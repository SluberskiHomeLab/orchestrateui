require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Import authentication modules
const passport = require('./auth/passport');
const authRoutes = require('./auth/routes');
const adminRoutes = require('./auth/adminRoutes');
const { authenticate, optionalAuth, authEnabled } = require('./auth/middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

// In-memory storage (could be replaced with a database)
let tasks = [];
let taskHistory = [];
const scheduledJobs = new Map();

// Execute API task
async function executeTask(task) {
  const startTime = Date.now();
  const execution = {
    id: uuidv4(),
    taskId: task.id,
    taskName: task.name,
    startTime: new Date().toISOString(),
    status: 'running'
  };
  
  taskHistory.unshift(execution);
  
  try {
    const response = await axios({
      method: task.method,
      url: task.url,
      headers: task.headers || {},
      data: task.body || undefined,
      timeout: task.timeout || 30000
    });
    
    execution.status = 'success';
    execution.statusCode = response.status;
    execution.responseData = response.data;
    execution.duration = Date.now() - startTime;
    execution.endTime = new Date().toISOString();
    
    // Send webhook notification if configured
    if (task.webhookUrl) {
      await sendWebhookNotification(task, execution);
    }
    
    return execution;
  } catch (error) {
    execution.status = 'error';
    execution.error = error.message;
    execution.duration = Date.now() - startTime;
    execution.endTime = new Date().toISOString();
    
    // Send webhook notification on error too
    if (task.webhookUrl) {
      await sendWebhookNotification(task, execution);
    }
    
    return execution;
  }
}

// Send webhook notification
async function sendWebhookNotification(task, execution) {
  try {
    await axios.post(task.webhookUrl, {
      taskId: task.id,
      taskName: task.name,
      execution: execution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook notification failed:', error.message);
  }
}

// Schedule task
function scheduleTask(task) {
  if (task.schedule && cron.validate(task.schedule)) {
    const job = cron.schedule(task.schedule, () => {
      console.log(`Executing scheduled task: ${task.name}`);
      executeTask(task);
    }, {
      scheduled: task.enabled
    });
    
    scheduledJobs.set(task.id, job);
    
    if (task.enabled) {
      job.start();
    }
  }
}

// Unschedule task
function unscheduleTask(taskId) {
  const job = scheduledJobs.get(taskId);
  if (job) {
    job.stop();
    scheduledJobs.delete(taskId);
  }
}

// API Routes

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    authEnabled: authEnabled
  });
});

// Get all tasks
app.get('/api/tasks', optionalAuth, (req, res) => {
  // If auth is enabled, filter tasks by user
  let userTasks = tasks;
  if (authEnabled && req.user) {
    userTasks = tasks.filter(t => !t.userId || t.userId === req.user.id || req.user.role === 'admin');
  }
  res.json(userTasks);
});

// Get task by ID
app.get('/api/tasks/:id', optionalAuth, (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Check access
  if (authEnabled && req.user) {
    if (task.userId && task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  res.json(task);
});

// Create new task
app.post('/api/tasks', optionalAuth, (req, res) => {
  const task = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description || '',
    method: req.body.method || 'GET',
    url: req.body.url,
    headers: req.body.headers || {},
    body: req.body.body || null,
    schedule: req.body.schedule || null,
    enabled: req.body.enabled !== undefined ? req.body.enabled : true,
    webhookUrl: req.body.webhookUrl || null,
    timeout: req.body.timeout || 30000,
    userId: authEnabled && req.user ? req.user.id : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(task);
  
  // Schedule if cron expression provided
  if (task.schedule) {
    scheduleTask(task);
  }
  
  res.status(201).json(task);
});

// Update task
app.put('/api/tasks/:id', optionalAuth, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Check access
  if (authEnabled && req.user) {
    if (tasks[index].userId && tasks[index].userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  // Unschedule old task
  unscheduleTask(req.params.id);
  
  const task = {
    ...tasks[index],
    name: req.body.name || tasks[index].name,
    description: req.body.description !== undefined ? req.body.description : tasks[index].description,
    method: req.body.method || tasks[index].method,
    url: req.body.url || tasks[index].url,
    headers: req.body.headers !== undefined ? req.body.headers : tasks[index].headers,
    body: req.body.body !== undefined ? req.body.body : tasks[index].body,
    schedule: req.body.schedule !== undefined ? req.body.schedule : tasks[index].schedule,
    enabled: req.body.enabled !== undefined ? req.body.enabled : tasks[index].enabled,
    webhookUrl: req.body.webhookUrl !== undefined ? req.body.webhookUrl : tasks[index].webhookUrl,
    timeout: req.body.timeout || tasks[index].timeout,
    updatedAt: new Date().toISOString()
  };
  
  tasks[index] = task;
  
  // Reschedule if needed
  if (task.schedule) {
    scheduleTask(task);
  }
  
  res.json(task);
});

// Delete task
app.delete('/api/tasks/:id', optionalAuth, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Check access
  if (authEnabled && req.user) {
    if (tasks[index].userId && tasks[index].userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  unscheduleTask(req.params.id);
  tasks.splice(index, 1);
  
  res.json({ message: 'Task deleted successfully' });
});

// Execute task manually
app.post('/api/tasks/:id/execute', optionalAuth, async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Check access
  if (authEnabled && req.user) {
    if (task.userId && task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  try {
    const execution = await executeTask(task);
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task execution history
app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(taskHistory.slice(0, limit));
});

// Get task execution history for specific task
app.get('/api/tasks/:id/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = taskHistory.filter(h => h.taskId === req.params.id).slice(0, limit);
  res.json(history);
});

// Start server
app.listen(PORT, () => {
  console.log(`OrchestrateUI Backend running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
