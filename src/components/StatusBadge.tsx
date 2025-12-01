import { Badge } from '@/components/ui/badge'
import type { ServerStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: ServerStatus
  pulse?: boolean
}

export function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  const configs = {
    SECURE: {
      label: 'Secure',
      className: 'bg-success/20 text-success border-success/50'
    },
    VULNERABLE: {
      label: 'Vulnerable',
      className: 'bg-destructive/20 text-destructive border-destructive/50'
    },
    UNKNOWN: {
      label: 'Unknown',
      className: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/50'
    }
  }

  const config = configs[status]

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${pulse ? 'animate-pulse-glow' : ''}`}
    >
      {config.label}
    </Badge>
  )
}
