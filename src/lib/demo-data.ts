import { ulid } from 'ulid'
import type { Server, Job, LogEntry, AuditResult, AuditFinding } from './types'

const DEMO_HOSTNAMES = [
  'prod-db-01',
  'prod-db-02',
  'web-frontend-blue',
  'web-frontend-green',
  'stage-k8s-worker-01',
  'stage-k8s-worker-02',
  'legacy-bastion',
  'prod-cache-redis',
  'dev-api-gateway',
  'prod-queue-rabbitmq'
]

const DEMO_IPS = [
  '10.0.1.10',
  '10.0.1.11',
  '10.0.2.50',
  '10.0.2.51',
  '192.168.1.100',
  '192.168.1.101',
  '192.168.5.20',
  '10.0.3.30',
  '172.16.0.15',
  '10.0.1.25'
]

const OS_OPTIONS = [
  'Ubuntu 20.04 LTS',
  'Ubuntu 22.04 LTS',
  'Debian 11',
  'Debian 12',
  'CentOS 7',
  'Rocky Linux 8',
  'AlmaLinux 9'
]

const TAG_SETS = [
  ['production', 'database'],
  ['production', 'database', 'mysql'],
  ['production', 'web', 'nginx'],
  ['production', 'web', 'nodejs'],
  ['staging', 'kubernetes', 'worker'],
  ['staging', 'k8s', 'compute'],
  ['legacy', 'bastion', 'ssh-gateway'],
  ['production', 'cache', 'redis'],
  ['development', 'api', 'gateway'],
  ['production', 'messaging', 'rabbitmq']
]

const ANSIBLE_AUDIT_OUTPUTS = [
  `PLAY [Security Audit Playbook] **************************************************

TASK [Gathering Facts] **********************************************************
ok: [prod-db-01]

TASK [Check SSH configuration] **************************************************
changed: [prod-db-01]

TASK [Verify firewall status] ***************************************************
ok: [prod-db-01]

TASK [Check for available updates] **********************************************
changed: [prod-db-01]

TASK [Scan for weak file permissions] *******************************************
ok: [prod-db-01]

TASK [Verify user account security] *********************************************
changed: [prod-db-01]

PLAY RECAP **********************************************************************
prod-db-01                 : ok=6    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,

  `PLAY [Security Audit Playbook] **************************************************

TASK [Gathering Facts] **********************************************************
ok: [web-frontend-blue]

TASK [Check SSH configuration] **************************************************
fatal: [web-frontend-blue]: FAILED! => {
    "changed": false,
    "msg": "SSH root login is enabled - CRITICAL"
}

TASK [Verify firewall status] ***************************************************
ok: [web-frontend-blue]

TASK [Check for available updates] **********************************************
ok: [web-frontend-blue]

PLAY RECAP **********************************************************************
web-frontend-blue          : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0`,

  `PLAY [Security Audit Playbook] **************************************************

TASK [Gathering Facts] **********************************************************
ok: [stage-k8s-worker-01]

TASK [Check SSH configuration] **************************************************
ok: [stage-k8s-worker-01]

TASK [Verify firewall status] ***************************************************
changed: [stage-k8s-worker-01]

TASK [Check for available updates] **********************************************
changed: [stage-k8s-worker-01]

TASK [Scan for weak file permissions] *******************************************
ok: [stage-k8s-worker-01]

TASK [Verify user account security] *********************************************
ok: [stage-k8s-worker-01]

TASK [Check kernel parameters] **************************************************
changed: [stage-k8s-worker-01]

PLAY RECAP **********************************************************************
stage-k8s-worker-01        : ok=7    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`
]

const ANSIBLE_HARDEN_OUTPUTS = [
  `PLAY [Hardening Playbook] *******************************************************

TASK [Gathering Facts] **********************************************************
ok: [prod-db-01]

TASK [Backup current SSH config] ************************************************
changed: [prod-db-01]

TASK [Disable SSH root login] ***************************************************
changed: [prod-db-01]

TASK [Disable password authentication] ******************************************
changed: [prod-db-01]

TASK [Configure SSH key-only auth] **********************************************
ok: [prod-db-01]

TASK [Enable UFW firewall] ******************************************************
changed: [prod-db-01]

TASK [Set UFW default policies] *************************************************
changed: [prod-db-01]

TASK [Allow SSH through firewall] ***********************************************
ok: [prod-db-01]

TASK [Install unattended-upgrades] **********************************************
changed: [prod-db-01]

TASK [Configure automatic security updates] *************************************
changed: [prod-db-01]

TASK [Set secure file permissions] **********************************************
changed: [prod-db-01]

TASK [Restart SSH service] ******************************************************
changed: [prod-db-01]

PLAY RECAP **********************************************************************
prod-db-01                 : ok=12   changed=9    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,

  `PLAY [Hardening Playbook] *******************************************************

TASK [Gathering Facts] **********************************************************
ok: [legacy-bastion]

TASK [Backup current SSH config] ************************************************
changed: [legacy-bastion]

TASK [Disable SSH root login] ***************************************************
changed: [legacy-bastion]

TASK [Disable password authentication] ******************************************
changed: [legacy-bastion]

TASK [Enable UFW firewall] ******************************************************
changed: [legacy-bastion]

TASK [Set UFW default policies] *************************************************
changed: [legacy-bastion]

TASK [Allow SSH through firewall] ***********************************************
ok: [legacy-bastion]

TASK [Install fail2ban] *********************************************************
changed: [legacy-bastion]

TASK [Configure fail2ban SSH jail] **********************************************
changed: [legacy-bastion]

TASK [Restart services] *********************************************************
changed: [legacy-bastion]

PLAY RECAP **********************************************************************
legacy-bastion             : ok=10   changed=8    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`
]

function generateRealisticAuditFindings(hostname: string): AuditFinding[] {
  const allFindings: AuditFinding[] = [
    {
      id: ulid(),
      severity: 'CRITICAL',
      category: 'SSH Configuration',
      description: 'Root login via SSH is enabled',
      recommendation: 'Set PermitRootLogin to "no" in /etc/ssh/sshd_config',
      currentValue: 'yes',
      expectedValue: 'no'
    },
    {
      id: ulid(),
      severity: 'CRITICAL',
      category: 'SSH Configuration',
      description: 'Password authentication is enabled',
      recommendation: 'Disable PasswordAuthentication and use key-based auth only',
      currentValue: 'yes',
      expectedValue: 'no'
    },
    {
      id: ulid(),
      severity: 'HIGH',
      category: 'Firewall',
      description: 'UFW firewall is inactive',
      recommendation: 'Enable and configure UFW with restrictive rules',
      currentValue: 'inactive',
      expectedValue: 'active'
    },
    {
      id: ulid(),
      severity: 'HIGH',
      category: 'System Updates',
      description: 'Security updates are available',
      recommendation: 'Run apt update && apt upgrade to install security patches',
      currentValue: '23 updates available',
      expectedValue: '0 updates available'
    },
    {
      id: ulid(),
      severity: 'HIGH',
      category: 'Services',
      description: 'Unnecessary services running',
      recommendation: 'Disable unused services to reduce attack surface',
      currentValue: 'telnet, ftp enabled',
      expectedValue: 'disabled'
    },
    {
      id: ulid(),
      severity: 'MEDIUM',
      category: 'User Accounts',
      description: 'Unused system accounts detected',
      recommendation: 'Remove or lock unused accounts',
      currentValue: '3 unused accounts',
      expectedValue: '0 unused accounts'
    },
    {
      id: ulid(),
      severity: 'MEDIUM',
      category: 'File Permissions',
      description: 'World-writable files found',
      recommendation: 'Review and restrict permissions on sensitive files',
      currentValue: '12 world-writable files',
      expectedValue: '0 world-writable files'
    },
    {
      id: ulid(),
      severity: 'MEDIUM',
      category: 'Kernel Security',
      description: 'SELinux or AppArmor not enforcing',
      recommendation: 'Enable mandatory access control',
      currentValue: 'disabled',
      expectedValue: 'enforcing'
    },
    {
      id: ulid(),
      severity: 'LOW',
      category: 'Logging',
      description: 'Log rotation not configured optimally',
      recommendation: 'Configure logrotate to retain logs for 90 days',
      currentValue: '30 days retention',
      expectedValue: '90 days retention'
    },
    {
      id: ulid(),
      severity: 'LOW',
      category: 'Network',
      description: 'IPv6 is enabled but not configured',
      recommendation: 'Either configure IPv6 security or disable if not needed',
      currentValue: 'enabled, unconfigured',
      expectedValue: 'disabled or configured'
    }
  ]

  const count = Math.floor(Math.random() * 6) + 3
  return allFindings.slice(0, count)
}

function createDemoLogEntries(type: 'AUDIT' | 'HARDEN', baseTime: number): LogEntry[] {
  if (type === 'AUDIT') {
    return [
      { timestamp: baseTime, message: 'Connecting to server...', level: 'info' },
      { timestamp: baseTime + 1000, message: 'Running security audit checks', level: 'info' },
      { timestamp: baseTime + 2000, message: 'Analyzing SSH configuration', level: 'info' },
      { timestamp: baseTime + 3000, message: '  ⚠ Root login enabled', level: 'warning' },
      { timestamp: baseTime + 4000, message: '  ⚠ Password auth enabled', level: 'warning' },
      { timestamp: baseTime + 5000, message: 'Checking firewall status', level: 'info' },
      { timestamp: baseTime + 6000, message: '  ⚠ UFW inactive', level: 'warning' },
      { timestamp: baseTime + 7000, message: 'Scanning for updates', level: 'info' },
      { timestamp: baseTime + 8000, message: '  ⚠ Security updates available', level: 'warning' },
      { timestamp: baseTime + 9000, message: 'Audit complete', level: 'success' }
    ]
  } else {
    return [
      { timestamp: baseTime, message: 'Starting hardening process...', level: 'info' },
      { timestamp: baseTime + 1000, message: 'Backing up current configuration', level: 'info' },
      { timestamp: baseTime + 2000, message: 'Updating SSH configuration', level: 'info' },
      { timestamp: baseTime + 3000, message: '  ✓ Disabled root login', level: 'success' },
      { timestamp: baseTime + 4000, message: '  ✓ Disabled password authentication', level: 'success' },
      { timestamp: baseTime + 5000, message: 'Configuring firewall', level: 'info' },
      { timestamp: baseTime + 6000, message: '  ✓ UFW enabled', level: 'success' },
      { timestamp: baseTime + 7000, message: '  ✓ Default deny incoming', level: 'success' },
      { timestamp: baseTime + 8000, message: '  ✓ Allow SSH (port 22)', level: 'success' },
      { timestamp: baseTime + 9000, message: 'Installing security updates', level: 'info' },
      { timestamp: baseTime + 12000, message: '  ✓ Packages updated', level: 'success' },
      { timestamp: baseTime + 13000, message: 'Hardening complete!', level: 'success' }
    ]
  }
}

export function generateDemoServers(organizationId: string, count: number = 8): Server[] {
  const now = Date.now()
  const servers: Server[] = []

  for (let i = 0; i < Math.min(count, DEMO_HOSTNAMES.length); i++) {
    const statuses: ('SECURE' | 'VULNERABLE' | 'UNKNOWN')[] = ['SECURE', 'VULNERABLE', 'UNKNOWN']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    servers.push({
      id: ulid(),
      organizationId,
      hostname: DEMO_HOSTNAMES[i],
      ipAddress: DEMO_IPS[i],
      tags: TAG_SETS[i],
      status: randomStatus,
      createdAt: now - (86400000 * (10 - i)),
      updatedAt: now - (3600000 * Math.floor(Math.random() * 24))
    })
  }

  return servers
}

export function generateDemoJobs(
  organizationId: string,
  servers: Server[],
  count: number = 12
): Job[] {
  const now = Date.now()
  const jobs: Job[] = []
  const jobTypes: ('AUDIT' | 'HARDEN')[] = ['AUDIT', 'HARDEN']
  const jobStatuses: ('COMPLETED' | 'FAILED' | 'RUNNING')[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'RUNNING']

  for (let i = 0; i < count; i++) {
    const server = servers[Math.floor(Math.random() * servers.length)]
    const type = jobTypes[Math.floor(Math.random() * jobTypes.length)]
    const status = i === 0 ? 'RUNNING' : jobStatuses[Math.floor(Math.random() * jobStatuses.length)]
    
    const createdAt = now - (86400000 * (count - i)) - Math.floor(Math.random() * 3600000)
    const startedAt = createdAt + Math.floor(Math.random() * 5000) + 2000
    const completedAt = status === 'RUNNING' ? undefined : startedAt + Math.floor(Math.random() * 60000) + 10000

    let logs: LogEntry[] = []
    let result: AuditResult | undefined
    let error: string | undefined

    if (status === 'RUNNING') {
      logs = createDemoLogEntries(type, startedAt).slice(0, 5)
    } else if (status === 'COMPLETED') {
      logs = createDemoLogEntries(type, startedAt)
      
      if (type === 'AUDIT') {
        const findings = generateRealisticAuditFindings(server.hostname)
        result = {
          totalFindings: findings.length,
          criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
          highCount: findings.filter(f => f.severity === 'HIGH').length,
          mediumCount: findings.filter(f => f.severity === 'MEDIUM').length,
          lowCount: findings.filter(f => f.severity === 'LOW').length,
          findings,
          scanDate: completedAt || now
        }
      }
    } else if (status === 'FAILED') {
      const errorMessages = [
        'Connection timeout: Unable to reach server',
        'SSH authentication failed: Permission denied',
        'Insufficient privileges: sudo required',
        'Network unreachable: Host is down'
      ]
      error = errorMessages[Math.floor(Math.random() * errorMessages.length)]
      logs = createDemoLogEntries(type, startedAt).slice(0, 3)
      logs.push({
        timestamp: startedAt + 4000,
        message: error,
        level: 'error'
      })
    }

    jobs.push({
      id: ulid(),
      organizationId,
      serverId: server.id,
      type,
      status,
      logs,
      result,
      error,
      createdAt,
      updatedAt: completedAt || now,
      completedAt,
      startedAt
    })
  }

  return jobs.sort((a, b) => b.createdAt - a.createdAt)
}
