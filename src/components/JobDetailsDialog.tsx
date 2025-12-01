import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Job, Server } from '@/lib/types'
import { JobStatusBadge } from './JobStatusBadge'
import { formatDistanceToNow, format } from 'date-fns'
import { Info, Warning, XCircle, CheckCircle } from '@phosphor-icons/react'

interface JobDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
  server: Server | null
}

export function JobDetailsDialog({ open, onOpenChange, job, server }: JobDetailsDialogProps) {
  if (!job || !server) return null

  const logIcons = {
    info: Info,
    warning: Warning,
    error: XCircle,
    success: CheckCircle
  }

  const logColors = {
    info: 'text-primary',
    warning: 'text-accent',
    error: 'text-destructive',
    success: 'text-success'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Job Details</DialogTitle>
              <DialogDescription className="mt-2">
                <span className="font-mono">{server.hostname}</span>
                <span className="mx-2">•</span>
                <span>{format(job.createdAt, 'PPp')}</span>
              </DialogDescription>
            </div>
            <JobStatusBadge status={job.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {job.status === 'FAILED' && job.error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/50">
              <div className="flex items-start gap-2">
                <XCircle size={20} className="text-destructive mt-0.5" weight="bold" />
                <div>
                  <h4 className="font-semibold text-destructive">Job Failed</h4>
                  <p className="text-sm text-destructive/90 mt-1">{job.error}</p>
                </div>
              </div>
            </div>
          )}

          {job.status === 'COMPLETED' && job.result && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50">
                  <div className="text-2xl font-bold text-destructive">{job.result.criticalCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Critical</div>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/50">
                  <div className="text-2xl font-bold text-accent">{job.result.highCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">High</div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/50">
                  <div className="text-2xl font-bold text-primary">{job.result.mediumCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Medium</div>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <div className="text-2xl font-bold">{job.result.lowCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Low</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Findings</h4>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {job.result.findings.map((finding) => {
                      const severityColors = {
                        CRITICAL: 'border-destructive/50 bg-destructive/5',
                        HIGH: 'border-accent/50 bg-accent/5',
                        MEDIUM: 'border-primary/50 bg-primary/5',
                        LOW: 'border-border bg-muted/50'
                      }

                      return (
                        <div
                          key={finding.id}
                          className={`p-4 rounded-lg border ${severityColors[finding.severity]}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-sm">{finding.description}</h5>
                            <Badge variant="outline" className="text-xs">
                              {finding.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {finding.category}
                          </p>
                          <p className="text-sm mb-3">{finding.recommendation}</p>
                          {finding.currentValue && (
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div>
                                <span className="text-muted-foreground">Current: </span>
                                <span className="text-destructive">{finding.currentValue}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Expected: </span>
                                <span className="text-success">{finding.expectedValue}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {job.logs.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Execution Logs</h4>
                <ScrollArea className="h-[200px] rounded-lg bg-black/40 p-4 font-mono text-sm">
                  <div className="space-y-2">
                    {job.logs.map((log, idx) => {
                      const Icon = logIcons[log.level]
                      const color = logColors[log.level]
                      
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <Icon size={16} className={`${color} mt-0.5 flex-shrink-0`} />
                          <span className="text-muted-foreground text-xs">
                            {format(log.timestamp, 'HH:mm:ss')}
                          </span>
                          <span className="flex-1">{log.message}</span>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
