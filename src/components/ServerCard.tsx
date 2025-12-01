import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import type { Server } from '@/lib/types'
import { Desktop, Trash } from '@phosphor-icons/react'

interface ServerCardProps {
  server: Server
  onView: () => void
  onDelete: () => void
}

export function ServerCard({ server, onView, onDelete }: ServerCardProps) {
  const statusColors = {
    SECURE: 'border-l-success',
    VULNERABLE: 'border-l-destructive',
    UNKNOWN: 'border-l-muted-foreground'
  }

  return (
    <Card 
      className={`border-l-4 ${statusColors[server.status]} hover:shadow-lg hover:shadow-primary/10 transition-all hover:-translate-y-0.5 cursor-pointer group`}
      onClick={onView}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Desktop size={24} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {server.hostname}
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                {server.ipAddress}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={server.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {server.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
