import type { Job, LogEntry, AuditResult, AuditFinding } from './types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function generateAuditFindings(): AuditFinding[] {
  return [
    {
      id: '1',
      severity: 'CRITICAL',
      category: 'SSH Configuration',
      description: 'Root login via SSH is enabled',
      recommendation: 'Set PermitRootLogin to "no" in /etc/ssh/sshd_config',
      currentValue: 'yes',
      expectedValue: 'no'
    },
    {
      id: '2',
      severity: 'CRITICAL',
      category: 'SSH Configuration',
      description: 'Password authentication is enabled',
      recommendation: 'Disable PasswordAuthentication and use key-based auth only',
      currentValue: 'yes',
      expectedValue: 'no'
    },
    {
      id: '3',
      severity: 'HIGH',
      category: 'Firewall',
      description: 'UFW firewall is inactive',
      recommendation: 'Enable and configure UFW with restrictive rules',
      currentValue: 'inactive',
      expectedValue: 'active'
    },
    {
      id: '4',
      severity: 'HIGH',
      category: 'System Updates',
      description: 'Security updates are available',
      recommendation: 'Run apt update && apt upgrade to install security patches',
      currentValue: '23 updates available',
      expectedValue: '0 updates available'
    },
    {
      id: '5',
      severity: 'MEDIUM',
      category: 'User Accounts',
      description: 'Unused system accounts detected',
      recommendation: 'Remove or lock unused accounts',
      currentValue: '3 unused accounts',
      expectedValue: '0 unused accounts'
    },
    {
      id: '6',
      severity: 'MEDIUM',
      category: 'File Permissions',
      description: 'World-writable files found in /tmp',
      recommendation: 'Review and restrict permissions on sensitive files',
      currentValue: '12 world-writable files',
      expectedValue: '0 world-writable files'
    },
    {
      id: '7',
      severity: 'LOW',
      category: 'Logging',
      description: 'Log rotation not configured optimally',
      recommendation: 'Configure logrotate to retain logs for 90 days',
      currentValue: '30 days retention',
      expectedValue: '90 days retention'
    },
    {
      id: '8',
      severity: 'LOW',
      category: 'Network',
      description: 'IPv6 is enabled but not configured',
      recommendation: 'Either configure IPv6 security or disable if not needed',
      currentValue: 'enabled, unconfigured',
      expectedValue: 'disabled or configured'
    }
  ]
}

function generateHardenLogs(): LogEntry[] {
  const logs: LogEntry[] = []
  const timestamp = Date.now()
  
  logs.push({ timestamp: timestamp, message: 'Starting hardening process...', level: 'info' })
  logs.push({ timestamp: timestamp + 1000, message: 'Backing up current configuration', level: 'info' })
  logs.push({ timestamp: timestamp + 2000, message: 'Updating SSH configuration', level: 'info' })
  logs.push({ timestamp: timestamp + 3000, message: '  ✓ Disabled root login', level: 'success' })
  logs.push({ timestamp: timestamp + 4000, message: '  ✓ Disabled password authentication', level: 'success' })
  logs.push({ timestamp: timestamp + 5000, message: 'Configuring firewall', level: 'info' })
  logs.push({ timestamp: timestamp + 6000, message: '  ✓ UFW enabled', level: 'success' })
  logs.push({ timestamp: timestamp + 7000, message: '  ✓ Default deny incoming', level: 'success' })
  logs.push({ timestamp: timestamp + 8000, message: '  ✓ Allow SSH (port 22)', level: 'success' })
  logs.push({ timestamp: timestamp + 9000, message: 'Installing security updates', level: 'info' })
  logs.push({ timestamp: timestamp + 12000, message: '  ✓ 23 packages updated', level: 'success' })
  logs.push({ timestamp: timestamp + 13000, message: 'Hardening complete!', level: 'success' })
  
  return logs
}

function generateAuditLogs(): LogEntry[] {
  const logs: LogEntry[] = []
  const timestamp = Date.now()
  
  logs.push({ timestamp: timestamp, message: 'Connecting to server...', level: 'info' })
  logs.push({ timestamp: timestamp + 1000, message: 'Running security audit checks', level: 'info' })
  logs.push({ timestamp: timestamp + 2000, message: 'Analyzing SSH configuration', level: 'info' })
  logs.push({ timestamp: timestamp + 3000, message: '  ⚠ Root login enabled', level: 'warning' })
  logs.push({ timestamp: timestamp + 4000, message: '  ⚠ Password auth enabled', level: 'warning' })
  logs.push({ timestamp: timestamp + 5000, message: 'Checking firewall status', level: 'info' })
  logs.push({ timestamp: timestamp + 6000, message: '  ⚠ UFW inactive', level: 'warning' })
  logs.push({ timestamp: timestamp + 7000, message: 'Scanning for updates', level: 'info' })
  logs.push({ timestamp: timestamp + 8000, message: '  ⚠ 23 security updates available', level: 'warning' })
  logs.push({ timestamp: timestamp + 9000, message: 'Audit complete: 8 findings', level: 'info' })
  
  return logs
}

export async function simulateWorkerExecution(
  job: Job,
  onUpdate: (updates: Partial<Job>) => void
): Promise<void> {
  await delay(Math.random() * 2000 + 3000)
  
  onUpdate({ status: 'PICKED_UP', updatedAt: Date.now() })
  await delay(1000)
  
  onUpdate({ status: 'RUNNING', startedAt: Date.now(), updatedAt: Date.now() })
  await delay(500)
  
  const isAudit = job.type === 'AUDIT'
  const shouldFail = Math.random() < 0.1
  
  if (shouldFail) {
    const errorLog: LogEntry = {
      timestamp: Date.now(),
      message: 'Connection timeout: Unable to reach server',
      level: 'error'
    }
    
    onUpdate({
      status: 'FAILED',
      logs: [...job.logs, errorLog],
      error: 'Connection timeout: Unable to reach server',
      updatedAt: Date.now(),
      completedAt: Date.now()
    })
    return
  }
  
  if (isAudit) {
    const auditLogs = generateAuditLogs()
    for (const log of auditLogs) {
      await delay(500)
      onUpdate({
        logs: [...job.logs, log],
        updatedAt: Date.now()
      })
    }
    
    await delay(1000)
    
    const findings = generateAuditFindings()
    const result: AuditResult = {
      totalFindings: findings.length,
      criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
      highCount: findings.filter(f => f.severity === 'HIGH').length,
      mediumCount: findings.filter(f => f.severity === 'MEDIUM').length,
      lowCount: findings.filter(f => f.severity === 'LOW').length,
      findings,
      scanDate: Date.now()
    }
    
    onUpdate({
      status: 'COMPLETED',
      result,
      updatedAt: Date.now(),
      completedAt: Date.now()
    })
  } else {
    const hardenLogs = generateHardenLogs()
    for (const log of hardenLogs) {
      await delay(600)
      onUpdate({
        logs: [...job.logs, log],
        updatedAt: Date.now()
      })
    }
    
    await delay(1000)
    
    onUpdate({
      status: 'COMPLETED',
      updatedAt: Date.now(),
      completedAt: Date.now()
    })
  }
}
