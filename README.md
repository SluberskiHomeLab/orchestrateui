# 🎯 OrchestrateUI

A powerful, Docker-runnable API automation tool with a clean, modern UI and fast backend. Schedule API calls, trigger them manually, and get notifications through webhooks.

## ✨ Features

- **Clean Modern UI**: Intuitive React-based interface for managing API automation tasks
- **Fast Backend**: Built with Node.js and Express for high-performance API execution
- **Scheduled Tasks**: Use cron expressions to schedule recurring API calls
- **Manual Execution**: Trigger any task on-demand with a single click
- **Webhook Notifications**: Get notified about task execution results via webhooks
- **RESTful API Support**: Full support for GET, POST, PUT, PATCH, and DELETE methods
- **Execution History**: Track all task executions with detailed logs
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/SluberskiHomeLab/orchestrateui.git
cd orchestrateui
```

2. Start the application:
```bash
docker-compose up -d
```

3. Open your browser and navigate to:
```
http://localhost
```

The backend API will be available at `http://localhost:3001/api`

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on port 3001 by default.

#### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend development server runs on port 3000 by default.

## 📖 Usage

### Creating a Task

1. Click the "**+ New Task**" button
2. Fill in the task details:
   - **Name**: A descriptive name for your task
   - **Description**: Optional description
   - **Method**: HTTP method (GET, POST, PUT, PATCH, DELETE)
   - **URL**: The API endpoint to call
   - **Headers**: JSON object with request headers
   - **Body**: Request body (for POST, PUT, PATCH)
   - **Schedule**: Cron expression for automated execution
   - **Webhook URL**: URL to receive execution notifications
3. Click "**Create Task**"

### Schedule Examples

- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 9 * * *` - Every day at 9:00 AM
- `0 0 * * 0` - Every Sunday at midnight
- `*/30 * * * *` - Every 30 minutes

### Manual Execution

Click the "**▶ Execute Now**" button on any task card to run it immediately.

### Webhook Notifications

Tasks can send execution results to a webhook URL. The webhook receives:

```json
{
  "taskId": "uuid",
  "taskName": "Task Name",
  "execution": {
    "id": "uuid",
    "status": "success",
    "statusCode": 200,
    "duration": 150,
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:00:00.150Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔌 API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/execute` - Execute task manually

### History

- `GET /api/history` - Get execution history (limit: 50)
- `GET /api/tasks/:id/history` - Get history for specific task

### Health

- `GET /api/health` - Health check endpoint

## 🏗️ Architecture

```
orchestrateui/
├── backend/
│   ├── server.js           # Express server with task management
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styles
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf          # Nginx configuration
└── docker-compose.yml      # Docker Compose configuration
```

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **node-cron** - Task scheduling
- **Axios** - HTTP client for API calls
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI framework
- **Axios** - API communication
- **CSS3** - Modern styling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## 🔒 Security Notes

**Important Security Considerations:**

- This is designed as a **development/home lab tool** for trusted environments
- The application makes HTTP requests to user-provided URLs - this is intentional core functionality
- **Request Forgery Risk**: Users can configure tasks to call any URL. In production environments, consider:
  - Adding URL allowlisting/denylisting
  - Network-level restrictions (firewall rules, network policies)
  - Running in an isolated network segment
  - Adding authentication/authorization
  
**For production use, consider adding:**
- **Authentication/Authorization** - Add user management and access control
- **HTTPS/TLS** - Encrypt traffic between client and server
- **Input Validation** - Additional validation for URLs, headers, and body content
- **Rate Limiting** - Prevent abuse and excessive API calls
- **Database Persistence** - Replace in-memory storage with a database
- **URL Filtering** - Allowlist/blocklist for target URLs
- **Network Isolation** - Run in a restricted network environment
- **Audit Logging** - Track all task executions and modifications

**Recommended Deployment:**
- Use in private/internal networks only
- Implement network-level security controls
- Regular security audits
- Keep dependencies updated

## 📝 Environment Variables

### Backend
- `PORT` - Server port (default: 3001)

### Frontend (build time)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Troubleshooting

### Docker Issues

If containers fail to start:
```bash
docker-compose down
docker-compose up --build
```

### Port Conflicts

If port 80 or 3001 is already in use, modify the `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Frontend
  - "3002:3001"  # Backend
```

### API Connection Issues

Make sure the backend is running and accessible. Check Docker logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.
