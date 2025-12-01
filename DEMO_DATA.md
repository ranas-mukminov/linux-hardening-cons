# Demo Data Seeder

This feature allows you to populate the application with realistic test data without needing to connect to actual servers or Python workers.

## Overview

The Demo Data Seeder generates:
- **8 realistic servers** with varied configurations
- **12 mock jobs** showing different states and outcomes
- Realistic Ansible-style logs and audit findings

## Usage

### From the Header
Click the "⚡ Load Demo Data" button in the header to instantly populate your workspace with demo data.

### From Empty State
When you have no servers, you'll see the demo data button alongside "Add Your First Server" in the empty state.

## Generated Data

### Servers
- Hostnames: `prod-db-01`, `web-frontend-blue`, `stage-k8s-worker-01`, `legacy-bastion`, etc.
- IP Addresses: Realistic private IPs (10.0.1.x, 192.168.1.x, 172.16.0.x)
- Operating Systems: Mix of Ubuntu 20.04/22.04, Debian 11/12, CentOS 7, Rocky Linux 8, AlmaLinux 9
- Tags: Combinations like `["production", "database"]`, `["staging", "kubernetes"]`, etc.
- Status: Random distribution of SECURE, VULNERABLE, and UNKNOWN states

### Jobs
- **Types**: Mix of AUDIT and HARDEN jobs
- **States**: 
  - 1 RUNNING job (to test live progress UI)
  - Multiple COMPLETED jobs with full audit results
  - Some FAILED jobs with realistic error messages
- **Logs**: Structured log entries with timestamps and severity levels
- **Audit Results**: Realistic security findings categorized by severity (CRITICAL, HIGH, MEDIUM, LOW)

### Example Audit Findings
- SSH misconfigurations (root login enabled, password auth)
- Firewall status issues (UFW inactive)
- Security updates available
- File permission problems
- User account security issues

### Example Logs
Logs follow realistic operational patterns:
```
Connecting to server...
Running security audit checks
Analyzing SSH configuration
  ⚠ Root login enabled
Checking firewall status
  ⚠ UFW inactive
Audit complete
```

## Implementation Details

### Files
- **src/lib/demo-data.ts**: Core generation logic
- **src/App.tsx**: Integration with UI

### Functions
- `generateDemoServers(organizationId, count)`: Creates realistic server entries
- `generateDemoJobs(organizationId, servers, count)`: Creates job history with logs and results

### Data Persistence
Demo data is stored in the same `useKV` hooks as real data, ensuring:
- Data persists across sessions
- Demo data can be mixed with real data
- No special handling required for demo vs. real data

## Notes

- Demo data is scoped to your organization ID (GitHub login)
- Loading demo data multiple times will add more entries (doesn't clear existing data)
- All timestamps are realistic relative to the current time
- Job statuses and findings are randomized for varied test scenarios
- The running job will remain in RUNNING state (won't auto-complete like real simulated jobs)

## Future Enhancements

Potential improvements for this feature:
- Option to wipe all data before loading demo data
- Preset scenarios (e.g., "Vulnerable Fleet", "Secure Fleet", "Mixed State")
- Configurable count of servers/jobs to generate
- Custom tagging patterns
- Time-series data for trending charts
