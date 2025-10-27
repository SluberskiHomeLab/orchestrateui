# Example Tasks for OrchestrateUI

This file contains example tasks you can import or recreate in OrchestrateUI to test its functionality.

## Example 1: Health Check (Every 5 Minutes)

```json
{
  "name": "Backend Health Check",
  "description": "Periodic health check of the backend API",
  "method": "GET",
  "url": "http://localhost:3001/api/health",
  "schedule": "*/5 * * * *",
  "enabled": true
}
```

## Example 2: Daily Report Trigger

```json
{
  "name": "Daily Report",
  "description": "Trigger daily report generation",
  "method": "POST",
  "url": "https://api.example.com/reports/generate",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  },
  "body": "{\"reportType\": \"daily\", \"format\": \"pdf\"}",
  "schedule": "0 9 * * *",
  "webhookUrl": "https://webhook.site/your-unique-url",
  "enabled": true
}
```

## Example 3: Data Sync (Every Hour)

```json
{
  "name": "Hourly Data Sync",
  "description": "Sync data between systems",
  "method": "POST",
  "url": "https://api.example.com/sync",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"source\": \"system_a\", \"target\": \"system_b\"}",
  "schedule": "0 * * * *",
  "enabled": true
}
```

## Example 4: Status Check with Webhook

```json
{
  "name": "Service Status Check",
  "description": "Check external service status and notify via webhook",
  "method": "GET",
  "url": "https://status.example.com/api/check",
  "schedule": "*/15 * * * *",
  "webhookUrl": "https://webhook.site/your-unique-url",
  "enabled": true
}
```

## Cron Expression Examples

- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours
- `0 9 * * *` - Every day at 9:00 AM
- `0 0 * * *` - Every day at midnight
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month at midnight
- `0 9 * * 1-5` - Every weekday at 9:00 AM

## Testing with webhook.site

1. Go to https://webhook.site
2. Copy your unique URL
3. Add it to the "Webhook URL" field in your task
4. Execute the task and see the webhook payload on webhook.site

## Manual Execution

You can manually execute any task by clicking the "▶ Execute Now" button, regardless of whether it has a schedule configured.
