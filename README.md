# Linux Hardening Console

A professional SaaS control plane for managing Linux server hardening operations through a secure "mailbox pattern" architecture where the web application queues security jobs and external isolated workers execute them.

## 🔒 Security Features

This application implements enterprise-grade security measures:

### 1. **Input Validation** (Command Injection Prevention)
- **Zod schema validation** on all hostname and IP address fields
- Rejects special characters: `;`, `&`, `|`, backticks, `$`, `()`, `<>`, `\`, `'`, `"`, `{}`, `[]`
- Frontend validation with real-time error feedback
- Backend-ready validation schemas in `src/lib/validation.ts`

### 2. **API Authentication** (Worker Endpoints)
- Worker API endpoints authenticate using `process.env.WORKER_API_SECRET`
- Never hardcoded - environment variable only
- Bearer token authentication required for all worker operations
- See `API_SECURITY.md` for implementation details

### 3. **Data Isolation** (Multi-tenancy)
- All servers and jobs scoped to user's organization ID
- Organization ID derived from authenticated user (`spark.user().login`)
- Frontend filters all data by current organization
- Backend queries must include organization filter (see examples in `API_SECURITY.md`)
- **Zero cross-organization data leakage**

### 4. **Job Timeout Detection**
- Jobs running longer than 20 minutes automatically marked as `TIMED_OUT`
- UI displays timeout status with warning indicator
- Prevents resource exhaustion from hung jobs
- Configurable timeout in `src/lib/auth.ts`

## 🚀 Quick Start

1. Clone and start the application
2. Add servers to your infrastructure inventory
3. Run security audits or apply hardening
4. Monitor job progress in real-time

## 📋 Features

- **Server Management**: CRUD operations for server inventory with tags
- **Security Audits**: Scan servers for vulnerabilities and misconfigurations
- **Automated Hardening**: Apply security best practices automatically
- **Real-time Monitoring**: Live job status updates and streaming logs
- **Audit Reports**: Detailed findings categorized by severity

## 🏗️ Architecture

**Control Plane** (This App):
- Queues jobs in persistent storage
- Provides UI for management
- No direct server access
- Organization-scoped data isolation

**Worker Plane** (External):
- Polls for pending jobs via authenticated API
- Executes security operations on target servers
- Reports progress and results back
- Isolated from control plane

## 📚 Documentation

- **[API_SECURITY.md](./API_SECURITY.md)**: Complete security implementation guide
- **[PRD.md](./PRD.md)**: Product requirements and design decisions
- **[SECURITY.md](./SECURITY.md)**: Security vulnerability reporting

## 🛡️ Security Best Practices

✅ Input validation using Zod schemas  
✅ Organization-scoped data queries  
✅ Environment variable secrets  
✅ Job timeout enforcement  
✅ No hardcoded credentials  
✅ Command injection prevention  

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
