import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { JobStatusBadge } from './JobStatusBadge'
import { Badge } from '@/components/ui/badge'
import type { Job, JobType } from '@/lib/types'
import { ShieldCheck, LockKey, ArrowCounterClockwise } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface JobCardProps {
  job: Job
  serverHostname: string
  onClick: () => void
}

export function JobCard({ job, serverHostname, onClick }: JobCardProps) {
  const jobTypeConfig: Record<JobType, { label: string; icon: any; color: string }> = {
    AUDIT: {
      label: 'Security Audit',
      icon: ShieldCheck,
      color: 'text-primary'
    },
    HARDEN: {
      label: 'Apply Hardening',
      icon: LockKey,
      color: 'text-accent'
    },
    ROLLBACK: {
      label: 'Rollback',
      icon: ArrowCounterClockwise,
      color: 'text-muted-foreground'
    }
  }

  const config = jobTypeConfig[job.type]
  const Icon = config.icon

  return (
    <Card 
      className="hover:shadow-lg hover:shadow-primary/10 transition-all hover:-translate-y-0.5 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10 ${config.color}`}>
              <Icon size={20} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {config.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {serverHostname}
              </p>
            </div>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(job.createdAt, { addSuffix: true })}
          </span>
          {job.status === 'COMPLETED' && job.result && (
            <Badge variant="outline" className="text-xs">
              {job.result.totalFindings} findings
            </Badge>
          )}
          {job.status === 'FAILED' && (
            <Badge variant="outline" className="border-destructive/50 text-destructive text-xs">
              Error
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
