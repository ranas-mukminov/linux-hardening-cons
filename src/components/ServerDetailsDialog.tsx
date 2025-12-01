import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from './StatusBadge'
import { JobCard } from './JobCard'
import { ShieldCheck, LockKey, Desktop } from '@phosphor-icons/react'
import type { Server, Job } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface ServerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server: Server | null
  jobs: Job[]
  onRunAudit: () => void
  onRunHarden: () => void
  onViewJob: (job: Job) => void
}

export function ServerDetailsDialog({
  open,
  onOpenChange,
  server,
  jobs,
  onRunAudit,
  onRunHarden,
  onViewJob
}: ServerDetailsDialogProps) {
  if (!server) return null

  const serverJobs = jobs.filter(j => j.serverId === server.id)
  const activeJobs = serverJobs.filter(j => ['PENDING', 'PICKED_UP', 'RUNNING'].includes(j.status))
  const completedJobs = serverJobs.filter(j => ['COMPLETED', 'FAILED'].includes(j.status))

  const lastAudit = serverJobs
    .filter(j => j.type === 'AUDIT' && j.status === 'COMPLETED')
    .sort((a, b) => b.createdAt - a.createdAt)[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Desktop size={28} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{server.hostname}</DialogTitle>
                <DialogDescription className="font-mono text-sm mt-1">
                  {server.ipAddress}
                </DialogDescription>
              </div>
            </div>
            <StatusBadge status={server.status} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">
              Jobs
              {activeJobs.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeJobs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Server Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <StatusBadge status={server.status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {server.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Added:</span>
                    <div className="mt-1 font-mono text-xs">
                      {formatDistanceToNow(server.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  {lastAudit && (
                    <div>
                      <span className="text-muted-foreground">Last Audit:</span>
                      <div className="mt-1 font-mono text-xs">
                        {formatDistanceToNow(lastAudit.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-2"
                  onClick={onRunAudit}
                  disabled={activeJobs.length > 0}
                >
                  <ShieldCheck size={20} weight="duotone" />
                  Run Security Audit
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="secondary"
                  onClick={onRunHarden}
                  disabled={activeJobs.length > 0}
                >
                  <LockKey size={20} weight="duotone" />
                  Apply Hardening Configuration
                </Button>
                {activeJobs.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Actions disabled while jobs are running
                  </p>
                )}
              </CardContent>
            </Card>

            {lastAudit?.result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Latest Audit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-center">
                      <div className="text-xl font-bold text-destructive">
                        {lastAudit.result.criticalCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Critical</div>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/50 text-center">
                      <div className="text-xl font-bold text-accent">
                        {lastAudit.result.highCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">High</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/50 text-center">
                      <div className="text-xl font-bold text-primary">
                        {lastAudit.result.mediumCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Medium</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border text-center">
                      <div className="text-xl font-bold">{lastAudit.result.lowCount}</div>
                      <div className="text-xs text-muted-foreground mt-1">Low</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => onViewJob(lastAudit)}
                  >
                    View Full Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {activeJobs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      Active Jobs
                    </h4>
                    <div className="space-y-2">
                      {activeJobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          serverHostname={server.hostname}
                          onClick={() => onViewJob(job)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {completedJobs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      Completed Jobs
                    </h4>
                    <div className="space-y-2">
                      {completedJobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          serverHostname={server.hostname}
                          onClick={() => onViewJob(job)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {serverJobs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldCheck size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No jobs have been run on this server yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
