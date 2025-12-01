import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ServerCard } from '@/components/ServerCard'
import { ServerFormDialog } from '@/components/ServerFormDialog'
import { ServerDetailsDialog } from '@/components/ServerDetailsDialog'
import { JobDetailsDialog } from '@/components/JobDetailsDialog'
import { toast } from 'sonner'
import { Plus, MagnifyingGlass, ShieldWarning } from '@phosphor-icons/react'
import type { Server, Job, JobType, ServerStatus } from '@/lib/types'
import { simulateWorkerExecution } from '@/lib/mock-worker'
import { getCurrentOrganizationId, getJobStatus } from '@/lib/auth'
import { ulid } from 'ulid'

function App() {
  const [servers, setServers] = useKV<Server[]>('servers', [])
  const [jobs, setJobs] = useKV<Job[]>('jobs', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [isServerDetailsOpen, setIsServerDetailsOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentOrganizationId().then(setOrganizationId).catch(err => {
      console.error('Failed to get organization ID:', err)
      toast.error('Authentication failed', {
        description: 'Unable to determine your organization'
      })
    })
  }, [])

  useEffect(() => {
    if (!jobs) return
    const activeJobs = jobs.filter(j => ['PENDING', 'PICKED_UP', 'RUNNING'].includes(j.status))
    
    if (activeJobs.length === 0) return

    const interval = setInterval(() => {
      setJobs(currentJobs => [...(currentJobs || [])])
    }, 3000)

    return () => clearInterval(interval)
  }, [jobs, setJobs])

  const handleAddServer = async (serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>) => {
    if (!organizationId) {
      toast.error('Not authenticated', {
        description: 'Please refresh the page'
      })
      return
    }

    const newServer: Server = {
      ...serverData,
      id: ulid(),
      organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setServers(current => [...(current || []), newServer])
    setIsAddDialogOpen(false)
    toast.success('Server added successfully', {
      description: `${newServer.hostname} is now being monitored`
    })
  }

  const handleDeleteServer = (serverId: string) => {
    if (!servers || !organizationId) return
    
    const server = servers.find(s => s.id === serverId && s.organizationId === organizationId)
    if (!server) return

    if (confirm(`Are you sure you want to remove ${server.hostname}?`)) {
      setServers(current => (current || []).filter(s => s.id !== serverId))
      setJobs(current => (current || []).filter(j => j.serverId !== serverId))
      toast.success('Server removed', {
        description: `${server.hostname} has been removed from monitoring`
      })
    }
  }

  const createJob = (serverId: string, type: JobType) => {
    if (!servers || !organizationId) return
    const server = servers.find(s => s.id === serverId && s.organizationId === organizationId)
    if (!server) return

    const newJob: Job = {
      id: ulid(),
      organizationId,
      serverId,
      type,
      status: 'PENDING',
      logs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setJobs(current => [...(current || []), newJob])
    
    toast.success('Job queued', {
      description: `${type === 'AUDIT' ? 'Security audit' : 'Hardening'} job created for ${server.hostname}`
    })

    simulateWorkerExecution(newJob, (updates) => {
      setJobs(currentJobs => {
        const updatedJobs = (currentJobs || []).map(j => 
          j.id === newJob.id ? { ...j, ...updates } : j
        )
        
        const updatedJob = updatedJobs.find(j => j.id === newJob.id)
        
        if (updatedJob?.status === 'COMPLETED') {
          if (updatedJob.type === 'AUDIT' && updatedJob.result) {
            const severity: ServerStatus = 
              updatedJob.result.criticalCount > 0 ? 'VULNERABLE' :
              updatedJob.result.highCount > 0 ? 'VULNERABLE' : 'SECURE'
            
            setServers(currentServers => 
              (currentServers || []).map(s => 
                s.id === serverId && s.organizationId === organizationId ? { ...s, status: severity } : s
              )
            )
          } else if (updatedJob.type === 'HARDEN') {
            setServers(currentServers => 
              (currentServers || []).map(s => 
                s.id === serverId && s.organizationId === organizationId ? { ...s, status: 'SECURE' } : s
              )
            )
          }
          
          toast.success('Job completed', {
            description: `${type === 'AUDIT' ? 'Security audit' : 'Hardening'} finished for ${server.hostname}`
          })
        } else if (updatedJob?.status === 'FAILED') {
          toast.error('Job failed', {
            description: updatedJob.error || 'Unknown error occurred'
          })
        }
        
        return updatedJobs
      })
    })
  }

  const handleRunAudit = (serverId: string) => {
    createJob(serverId, 'AUDIT')
  }

  const handleRunHarden = (serverId: string) => {
    createJob(serverId, 'HARDEN')
  }

  const userServers = (servers || []).filter(s => s.organizationId === organizationId)
  const userJobs = (jobs || []).filter(j => j.organizationId === organizationId)

  const filteredServers = userServers.filter(server => {
    const query = searchQuery.toLowerCase()
    return (
      server.hostname.toLowerCase().includes(query) ||
      server.ipAddress.includes(query) ||
      server.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  const recentJobs = userJobs
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const activeJobsCount = userJobs.filter(j => {
    const status = getJobStatus(j)
    return ['PENDING', 'PICKED_UP', 'RUNNING'].includes(status)
  }).length
  
  const vulnerableCount = userServers.filter(s => s.status === 'VULNERABLE').length
  const secureCount = userServers.filter(s => s.status === 'SECURE').length

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldWarning size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Authenticating your session</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ShieldWarning size={28} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Linux Hardening Console
                </h1>
                <p className="text-xs text-muted-foreground">
                  Control Plane • Security Operations
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus size={20} weight="bold" />
              Add Server
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Servers</div>
            <div className="text-3xl font-bold">{userServers.length}</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Vulnerable</div>
            <div className="text-3xl font-bold text-destructive">{vulnerableCount}</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Active Jobs</div>
            <div className="text-3xl font-bold text-accent">{activeJobsCount}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              size={20} 
            />
            <Input
              placeholder="Search servers by hostname, IP, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredServers.length === 0 && userServers.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
            <ShieldWarning size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Servers Yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first server to start monitoring its security posture
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus size={20} weight="bold" />
              Add Your First Server
            </Button>
          </div>
        )}

        {filteredServers.length === 0 && userServers.length > 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No servers match your search</p>
          </div>
        )}

        {filteredServers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServers.map(server => (
              <ServerCard
                key={server.id}
                server={server}
                onView={() => {
                  setSelectedServer(server)
                  setIsServerDetailsOpen(true)
                }}
                onDelete={() => handleDeleteServer(server.id)}
              />
            ))}
          </div>
        )}
      </main>

      <ServerFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddServer}
      />

      <ServerDetailsDialog
        open={isServerDetailsOpen}
        onOpenChange={setIsServerDetailsOpen}
        server={selectedServer}
        jobs={userJobs}
        onRunAudit={() => selectedServer && handleRunAudit(selectedServer.id)}
        onRunHarden={() => selectedServer && handleRunHarden(selectedServer.id)}
        onViewJob={(job) => {
          setSelectedJob(job)
          setIsJobDetailsOpen(true)
        }}
      />

      <JobDetailsDialog
        open={isJobDetailsOpen}
        onOpenChange={setIsJobDetailsOpen}
        job={selectedJob}
        server={selectedServer || userServers.find(s => s.id === selectedJob?.serverId) || null}
      />
    </div>
  )
}

export default App