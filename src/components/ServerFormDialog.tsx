import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { Server } from '@/lib/types'

interface ServerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>) => void
  server?: Server
}

export function ServerFormDialog({ open, onOpenChange, onSubmit, server }: ServerFormDialogProps) {
  const [hostname, setHostname] = useState(server?.hostname || '')
  const [ipAddress, setIpAddress] = useState(server?.ipAddress || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(server?.tags || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hostname.trim() || !ipAddress.trim()) return

    onSubmit({
      hostname: hostname.trim(),
      ipAddress: ipAddress.trim(),
      tags,
      status: server?.status || 'UNKNOWN'
    })

    setHostname('')
    setIpAddress('')
    setTags([])
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{server ? 'Edit Server' : 'Add New Server'}</DialogTitle>
            <DialogDescription>
              {server ? 'Update server information' : 'Add a new server to your infrastructure'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                placeholder="web-server-01"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.100"
                className="font-mono"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Production, Staging, etc."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {server ? 'Save Changes' : 'Add Server'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
