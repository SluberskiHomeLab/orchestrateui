# 🎯 OrchestrateUI HAS BEEN MOVED FOR FORGJO: https://git.sluberskihomelab.com/Public/orchestrateui

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

## 🔐 Authentication & Authorization

OrchestrateUI now supports optional authentication with multiple authentication methods:

### Authentication Methods

1. **Username/Password (Local Authentication)**
   - Traditional username and password authentication
   - Passwords are securely hashed using bcrypt
   - First registered user becomes an administrator

2. **OIDC/OAuth2 (Auth0, Okta, etc.)**
   - Single Sign-On (SSO) with your organization's identity provider
   - Supports Auth0, Okta, Azure AD, and other OIDC-compliant providers

3. **LDAP Authentication**
   - Integration with Active Directory or LDAP servers
   - Users can authenticate with their corporate credentials

4. **API Keys**
   - Generate API keys for programmatic access
   - Perfect for CI/CD pipelines and automation
   - Keys can have optional expiration dates

### Enabling Authentication

Authentication is **disabled by default** for backwards compatibility. To enable it:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set `AUTH_ENABLED=true` in your `.env` file

3. **IMPORTANT**: Set a strong, random `JWT_SECRET` in your `.env` file:
   ```bash
   JWT_SECRET=$(openssl rand -hex 32)
   ```
   Never use the default secret in production!

3. Configure your preferred authentication methods

4. Start the application:
   ```bash
   docker-compose up -d
   ```

5. Register the first user (will automatically become an admin)

### Admin Features

Administrators have access to an Admin panel with the following capabilities:

- **User Management**: Create, edit, and delete user accounts
- **Role Assignment**: Assign admin or user roles
- **API Key Management**: Generate and manage API keys for users
- **Access Control**: Tasks are automatically scoped to their creators

### Configuration

See `.env.example` for all available authentication configuration options:

- **JWT Settings**: Secret key and token expiration
- **OIDC/OAuth2**: Provider URLs and credentials
- **LDAP**: Server connection and search parameters

## 🔒 Security Notes

**Important Security Considerations:**

- This is designed as a **development/home lab tool** for trusted environments
- The application makes HTTP requests to user-provided URLs - this is intentional core functionality
- **Request Forgery Risk**: Users can configure tasks to call any URL. In production environments, consider:
  - Adding URL allowlisting/denylisting
  - Network-level restrictions (firewall rules, network policies)
  - Running in an isolated network segment
  - Enabling authentication/authorization (now available!)
  
**For production use, we recommend:**
- ✅ **Authentication/Authorization** - Now available with multiple methods!
- **HTTPS/TLS** - Encrypt traffic between client and server
- **Rate Limiting** - Add rate limiting to prevent brute force attacks on login endpoints
- **CORS Configuration** - Restrict CORS to specific domains (set `CORS_ORIGIN` in `.env`)
- **Input Validation** - Additional validation for URLs, headers, and body content
- **Database Persistence** - Replace in-memory storage with a database
- **URL Filtering** - Allowlist/blocklist for target URLs
- **Network Isolation** - Run in a restricted network environment
- **Audit Logging** - Track all task executions and modifications

**Known Security Considerations:**
- JWT tokens are used for authentication (not session cookies), reducing CSRF risk
- Rate limiting is not implemented - consider adding a reverse proxy with rate limiting (e.g., nginx)
- CORS is permissive by default - restrict in production via `CORS_ORIGIN` environment variable

**Recommended Deployment:**
- Use in private/internal networks only
- Enable authentication for production environments
- Use strong JWT secrets (change default in `.env`)
- Configure CORS to allow only your frontend domain
- Add rate limiting via reverse proxy (nginx, Cloudflare, etc.)
- Regular security audits
- Keep dependencies updated

## 📝 Environment Variables

### Docker Compose (using .env file)
See `.env.example` for all available configuration options including:
- `AUTH_ENABLED` - Enable/disable authentication (default: false)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRY` - Token expiration time (default: 24h)
- `OIDC_*` - OIDC/OAuth2 provider settings
- `LDAP_*` - LDAP server configuration

### Backend (direct node execution)
- `PORT` - Server port (default: 3001)
- See `backend/.env.example` for authentication settings

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
