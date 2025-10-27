# GitHub Copilot Instructions for OrchestrateUI

## Project Overview
OrchestrateUI is a Docker-runnable API automation tool with a React frontend and Node.js/Express backend. It allows users to schedule and execute API calls with webhook notifications.

## Technology Stack
- **Backend**: Node.js, Express, node-cron, Axios
- **Frontend**: React 18, Axios
- **Deployment**: Docker, Docker Compose, Nginx
- **Storage**: In-memory (no database currently)

## Code Style and Standards

### JavaScript
- Use CommonJS (`require/module.exports`) for backend code
- Use ES6+ modules (`import/export`) for frontend code
- Use `const` and `let`; avoid `var`
- Use semicolons consistently
- Use single quotes for strings
- Use template literals for string interpolation
- Use arrow functions for callbacks and functional operations
- Use async/await instead of raw promises or callbacks

### React
- Use functional components with hooks
- Use `useState` and `useEffect` appropriately
- Component files should use `.js` extension
- Keep components in the `frontend/src` directory
- Use React best practices for state management

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for React components
- Use UPPERCASE for constants
- Use descriptive names that explain purpose

## Project Structure
```
orchestrateui/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Security Practices
- **Never commit secrets or API keys** to source code
- Use environment variables for configuration (see `.env.example` files)
- **This is a home lab/development tool** - be aware of SSRF risks when deploying
- Validate user inputs, especially URLs, headers, and request bodies
- Consider URL allowlisting/denylisting for production use
- Use `httpOnly`, `secure`, and `sameSite` flags for cookies if implementing authentication
- Keep dependencies updated to address security vulnerabilities

## API and Data Handling
- Backend API endpoints are under `/api` prefix
- Use RESTful conventions for API design
- Handle errors gracefully with appropriate HTTP status codes
- Log errors for debugging but avoid logging sensitive data
- Tasks are stored in-memory (array); consider data persistence for production

## Testing
- Frontend uses `react-scripts test` (Jest)
- Write tests for new features when appropriate
- Test API endpoints manually or with tools like curl/Postman
- Verify Docker builds before committing Dockerfile changes

## Docker and Deployment
- Always test Docker builds locally before committing
- Backend runs on port 3001
- Frontend runs on port 80 (via Nginx)
- Use `docker-compose up --build` to test changes
- Keep Dockerfiles minimal and efficient
- Use multi-stage builds when beneficial

## Documentation
- Update README.md when adding features or changing setup instructions
- Document API endpoints in README when adding new routes
- Add inline comments for complex logic or non-obvious code
- Document environment variables in `.env.example` files

## Dependencies
- Minimize new dependencies; use existing libraries when possible
- Keep package.json organized with appropriate dependency types
- Run `npm install` after adding dependencies
- Test that new dependencies work in Docker environment

## Common Patterns in This Codebase
- **Task Execution**: Tasks are executed via `executeTask()` function with Axios
- **Scheduling**: Uses node-cron for scheduling recurring tasks
- **Webhook Notifications**: Sends POST requests to webhook URLs on task completion
- **History Tracking**: In-memory array with execution records
- **CORS**: Enabled for cross-origin requests from frontend

## When Making Changes
- Test both backend and frontend components
- Verify Docker builds work correctly
- Check that API endpoints return expected responses
- Ensure frontend UI updates reflect backend changes
- Test cron scheduling if modifying task scheduling logic
- Verify webhook notifications if modifying notification logic

## Best Practices for Pull Requests
- Make minimal, focused changes
- Test changes locally before committing
- Update documentation if changing functionality
- Ensure Docker compose stack starts successfully
- Check that frontend UI looks good and is functional
- Verify API endpoints work as expected
