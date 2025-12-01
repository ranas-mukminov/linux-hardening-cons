import { Badge } from '@/components/ui/badge'
import type { JobStatus } from '@/lib/types'
import { CheckCircle, Warning, XCircle, Clock, Play } from '@phosphor-icons/react'

interface JobStatusBadgeProps {
  status: JobStatus
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const configs = {
    PENDING: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-accent/20 text-accent border-accent/50 animate-pulse-glow'
    },
    PICKED_UP: {
      label: 'Picked Up',
      icon: Play,
      className: 'bg-primary/20 text-primary border-primary/50'
    },
    RUNNING: {
      label: 'Running',
      icon: Play,
      className: 'bg-primary/20 text-primary border-primary/50 animate-pulse-glow'
    },
    COMPLETED: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-success/20 text-success border-success/50'
    },
    FAILED: {
      label: 'Failed',
      icon: XCircle,
      className: 'bg-destructive/20 text-destructive border-destructive/50'
    }
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1" size={14} weight="bold" />
      {config.label}
    </Badge>
  )
}
