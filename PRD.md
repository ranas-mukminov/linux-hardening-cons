# Linux Hardening Console - Control Plane Application

A professional SaaS control plane for managing Linux server hardening operations through a secure "mailbox pattern" architecture where the web application queues security jobs and external isolated workers execute them.

**Experience Qualities**:
1. **Secure** - Every interaction reinforces trust through clear status indicators, audit trails, and separation of concerns
2. **Professional** - A no-nonsense DevSecOps interface that prioritizes clarity and efficiency over decoration
3. **Responsive** - Immediate feedback for all actions with real-time job status updates

**Complexity Level**: Light Application (multiple features with basic state)
The application manages CRUD operations for servers, orchestrates job queuing, and provides status monitoring. It deliberately does NOT execute commands, maintaining a clean separation between control plane and execution layer.

## Essential Features

### Server Management Dashboard
- **Functionality**: Complete CRUD operations for server inventory with metadata (hostname, IP, tags, security status)
- **Purpose**: Provides centralized visibility into the infrastructure fleet with at-a-glance security posture
- **Trigger**: User navigates to dashboard on app load
- **Progression**: Dashboard loads → Server list displays with status badges → User can filter/search → Click server for details → Add/Edit/Delete operations available
- **Success criteria**: Users can manage their server inventory, see current security status (Secure/Vulnerable/Unknown), and filter by tags (Production/Staging)

### Job Creation & Queuing
- **Functionality**: Creates job records in persistent storage without executing any commands
- **Purpose**: Establishes the "mailbox" pattern where UI requests work and workers consume it asynchronously
- **Trigger**: User clicks "Run Audit" or "Apply Hardening" button on server detail view
- **Progression**: User selects action → Confirmation dialog appears → Job record created with PENDING status → Toast notification confirms → UI updates with pending indicator → Job card appears in activity feed
- **Success criteria**: Job appears immediately in pending state, no shell commands execute in browser, external worker can poll for pending jobs

### Worker API Simulation
- **Functionality**: Mock API endpoints that simulate worker polling and status updates
- **Purpose**: Demonstrates the integration pattern and allows testing the complete flow without actual workers
- **Trigger**: Simulated worker automatically picks up pending jobs after 3-5 seconds
- **Progression**: Job created → Worker "polls" via timeout → Status changes to RUNNING → Progress logs stream in → Completes with success/failure → Final report available
- **Success criteria**: Jobs transition through states (PENDING → RUNNING → COMPLETED/FAILED) with realistic timing and log output

### Real-time Job Monitoring
- **Functionality**: Live updates of job status and streaming logs without page refresh
- **Purpose**: Provides immediate feedback on security operations, critical for DevOps workflows
- **Trigger**: User views dashboard or server detail page with active jobs
- **Progression**: Job state changes → UI polls every 3 seconds → Status badges update → New log entries append → Completion triggers notification
- **Success criteria**: Users see job progress without manual refresh, can view streaming logs, receive toast notification on completion

### Security Audit Reports
- **Functionality**: Structured display of completed audit results with severity categorization
- **Purpose**: Presents actionable security findings in an organized, scannable format
- **Trigger**: User clicks "View Report" on completed audit job
- **Progression**: Click report → Dialog opens → JSON data renders as formatted cards → Findings grouped by severity (Critical/High/Medium/Low) → Each finding shows description and remediation
- **Success criteria**: Reports are readable, findings are prioritized by severity, users can quickly identify critical issues

## Edge Case Handling

- **Empty States**: Welcoming empty state for new organizations with clear "Add Server" CTA
- **Job Failures**: Failed jobs show error details in red with retry button and clear error messages
- **Concurrent Jobs**: Multiple jobs on same server show queued state, preventing confusion about execution order
- **Network Issues**: Polling gracefully handles failures, shows connection status indicator
- **No Pending Jobs**: Worker polling returns empty array, doesn't error
- **Orphaned Jobs**: Jobs stuck in RUNNING for >10 minutes show warning indicator
- **Invalid Data**: Form validation prevents invalid IPs, blank hostnames, or duplicate servers

## Design Direction

The interface should evoke the feeling of a professional NOC (Network Operations Center) - dark, focused, and information-dense without clutter. Think of terminal aesthetics meeting modern web design: high contrast, monospace fonts for technical data, but with smooth animations and clear hierarchy. The design should feel serious and capable, reinforcing that this is a tool for security professionals, not a consumer application.

## Color Selection

**Complementary palette** - Using cyan/blue (trust, technology) against amber/orange (alerts, warmth) to create a high-contrast security operations aesthetic.

- **Primary Color**: Deep Cyan `oklch(0.55 0.15 210)` - Communicates technological precision and trustworthiness, used for primary actions and active states
- **Secondary Colors**: Dark Navy `oklch(0.20 0.05 240)` for backgrounds, Slate Gray `oklch(0.35 0.02 240)` for secondary UI elements
- **Accent Color**: Amber Alert `oklch(0.70 0.15 60)` - Draws attention to warnings, pending states, and important CTAs
- **Foreground/Background Pairings**:
  - Background (Dark Navy #1a1d29): Light Cyan text (#a8d5e2) - Ratio 8.2:1 ✓
  - Card (Charcoal #252932): White text (#ffffff) - Ratio 12.4:1 ✓
  - Primary (Deep Cyan #00a8cc): Dark Navy text (#1a1d29) - Ratio 5.8:1 ✓
  - Secondary (Slate #515663): White text (#ffffff) - Ratio 8.9:1 ✓
  - Accent (Amber #d4a520): Dark Navy text (#1a1d29) - Ratio 8.1:1 ✓
  - Destructive (Crimson #dc2626): White text (#ffffff) - Ratio 5.9:1 ✓
  - Muted (Dark Slate #2d3139): Muted Cyan text (#94a3b8) - Ratio 5.2:1 ✓

## Font Selection

Typography should balance technical precision with readability - monospace for data, sans-serif for UI. Use **JetBrains Mono** for IP addresses, logs, and technical identifiers to evoke terminal/IDE aesthetics. **Inter** for all UI text provides excellent readability at all sizes with a modern, neutral character.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter SemiBold/32px/tight tracking (-0.02em)
  - H2 (Section Header): Inter SemiBold/24px/tight tracking (-0.01em)
  - H3 (Card Title): Inter Medium/18px/normal tracking
  - Body (UI Text): Inter Regular/14px/relaxed leading (1.6)
  - Technical (IPs/Logs): JetBrains Mono Regular/13px/normal leading (1.5)
  - Labels: Inter Medium/12px/wide tracking (0.02em) uppercase
  - Code/Logs: JetBrains Mono Regular/12px/relaxed leading (1.7)

## Animations

Motion should be purposeful and subtle - reinforcing state changes and directing attention without feeling playful. Think smooth, mechanical precision rather than bouncy or organic. Animations communicate system status and guide attention to updates.

- **Purposeful Meaning**: Use motion to indicate "liveness" - pulse animations on pending jobs, smooth transitions when jobs complete, subtle shimmer on loading states
- **Hierarchy of Movement**: Job status changes get prominent animations (scale + fade), new log entries slide in, navigation is instant (no page transitions)

## Component Selection

- **Components**: 
  - **Card** (shadcn): Primary container for servers and jobs, using dark variant with subtle borders
  - **Badge** (shadcn): Status indicators with custom colors (green=secure, red=vulnerable, amber=pending, gray=unknown)
  - **Button** (shadcn): Primary actions use cyan, destructive uses red, secondary uses ghost variant
  - **Dialog** (shadcn): For job logs, reports, and confirmations - large size for logs with scrollable content
  - **Input** (shadcn): Server details forms, styled with monospace for IP/hostname fields
  - **Textarea** (shadcn): For viewing multi-line logs and JSON output
  - **Tabs** (shadcn): Organize server details (Overview / Jobs / Configuration)
  - **Table** (shadcn): Server list on dashboard with sortable columns
  - **ScrollArea** (shadcn): Job logs viewer with smooth scrolling
  - **Toast** (sonner): Success/error notifications with dark theme
  - **Skeleton** (shadcn): Loading states for server cards and job lists

- **Customizations**: 
  - Custom ServerCard component combining Card + Badge with status-based border colors
  - JobTimeline component showing job progression through states
  - LogViewer component with syntax highlighting for JSON reports
  - StatusIndicator component with animated pulse for active states

- **States**:
  - Buttons: Subtle glow on hover (cyan shadow), pressed state scales down slightly (0.98), disabled state at 40% opacity
  - Inputs: Border color shifts to cyan on focus with subtle glow, error state shows red border
  - Cards: Hover lift (2px translate + shadow increase), selected state has cyan left border

- **Icon Selection**: 
  - Server: `@phosphor-icons/react` Desktop/DesktopTower
  - Audit: Shield/ShieldCheck
  - Harden: LockKey/ShieldPlus  
  - Logs: Terminal/FileText
  - Status indicators: CheckCircle (success), Warning (pending), XCircle (failed)
  - Actions: Play (run), ArrowClockwise (retry), Trash (delete)

- **Spacing**: 
  - Card padding: `p-6` (24px)
  - Section gaps: `gap-6` (24px)  
  - Grid gaps: `gap-4` (16px)
  - Button padding: `px-4 py-2`
  - Consistent 8px spacing scale (4, 8, 16, 24, 32, 48)

- **Mobile**: 
  - Stack server cards vertically on mobile (<768px)
  - Table converts to stacked card list with key data visible
  - Side-by-side buttons become vertical button group
  - Reduce card padding to `p-4` on mobile
  - Job logs dialog becomes full-screen on mobile
  - Hide less critical columns in tables (Tags column optional)
  - Touch-friendly 44px minimum tap targets
