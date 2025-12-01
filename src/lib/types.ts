export type ServerStatus = 'SECURE' | 'VULNERABLE' | 'UNKNOWN'

export type JobType = 'AUDIT' | 'HARDEN' | 'ROLLBACK'

export type JobStatus = 'PENDING' | 'PICKED_UP' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface Server {
  id: string
  hostname: string
  ipAddress: string
  tags: string[]
  status: ServerStatus
  createdAt: number
  updatedAt: number
}

export interface Job {
  id: string
  serverId: string
  type: JobType
  status: JobStatus
  logs: LogEntry[]
  result?: AuditResult
  error?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface LogEntry {
  timestamp: number
  message: string
  level: 'info' | 'warning' | 'error' | 'success'
}

export interface AuditFinding {
  id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  description: string
  recommendation: string
  currentValue?: string
  expectedValue?: string
}

export interface AuditResult {
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  findings: AuditFinding[]
  scanDate: number
}
