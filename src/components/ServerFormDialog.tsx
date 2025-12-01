import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Server } from '@/lib/types'
import { validateServerForm } from '@/lib/validation'

interface ServerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Server, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>) => void
  server?: Server
}

export function ServerFormDialog({ open, onOpenChange, onSubmit, server }: ServerFormDialogProps) {
  const [hostname, setHostname] = useState(server?.hostname || '')
  const [ipAddress, setIpAddress] = useState(server?.ipAddress || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(server?.tags || [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = {
      hostname: hostname.trim(),
      ipAddress: ipAddress.trim(),
      tags
    }

    const result = validateServerForm(formData)
    
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        const field = err.path[0] as string
        newErrors[field] = err.message
      })
      setErrors(newErrors)
      toast.error('Validation failed', {
        description: 'Please correct the errors in the form'
      })
      return
    }

    setErrors({})
    onSubmit({
      hostname: result.data.hostname,
      ipAddress: result.data.ipAddress,
      tags: result.data.tags,
      status: server?.status || 'UNKNOWN'
    })

    setHostname('')
    setIpAddress('')
    setTags([])
    setTagInput('')
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return
    
    if (tags.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }

    if (trimmedTag.length > 50) {
      toast.error('Tag is too long (max 50 characters)')
      return
    }

    if (/[;&|`$()<>\\'"{}[\]]/.test(trimmedTag)) {
      toast.error('Tag contains invalid characters')
      return
    }

    setTags([...tags, trimmedTag])
    setTagInput('')
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
                onChange={(e) => {
                  setHostname(e.target.value)
                  if (errors.hostname) {
                    setErrors(prev => ({ ...prev, hostname: '' }))
                  }
                }}
                className={errors.hostname ? 'border-destructive' : ''}
              />
              {errors.hostname && (
                <p className="text-xs text-destructive">{errors.hostname}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.100"
                className={`font-mono ${errors.ipAddress ? 'border-destructive' : ''}`}
                value={ipAddress}
                onChange={(e) => {
                  setIpAddress(e.target.value)
                  if (errors.ipAddress) {
                    setErrors(prev => ({ ...prev, ipAddress: '' }))
                  }
                }}
              />
              {errors.ipAddress && (
                <p className="text-xs text-destructive">{errors.ipAddress}</p>
              )}
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
