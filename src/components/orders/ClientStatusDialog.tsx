import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Qualification, CreateClientStatusRequest } from '@/types/api'

interface ClientStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qualifications: Qualification[]
  onSubmit: (data: CreateClientStatusRequest) => void
  isLoading?: boolean
}

export function ClientStatusDialog({
  open,
  onOpenChange,
  qualifications,
  onSubmit,
  isLoading,
}: ClientStatusDialogProps) {
  const [qualificationId, setQualificationId] = useState<number | undefined>()
  const [subQualificationId, setSubQualificationId] = useState<number | undefined>()
  const [comment, setComment] = useState('')
  const [dateTime, setDateTime] = useState('')

  const selectedQualification = qualifications.find(
    (q) => q.id === qualificationId
  )

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setQualificationId(undefined)
      setSubQualificationId(undefined)
      setComment('')
      setDateTime('')
    }
  }, [open])

  useEffect(() => {
    // Reset sub-qualification when parent changes
    setSubQualificationId(undefined)
  }, [qualificationId])

  const handleSubmit = () => {
    if (!qualificationId) {
      return
    }

    onSubmit({
      qualification_id: qualificationId,
      sub_qualification_id: subQualificationId,
      comment,
      date_time: dateTime || undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client Status</DialogTitle>
          <DialogDescription>
            Record a status update for this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Qualification *</Label>
            <Select
              value={qualificationId?.toString() || ''}
              onValueChange={(value) =>
                setQualificationId(value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualifications
                  .filter((q) => !q.parent_id)
                  .map((qualification) => (
                    <SelectItem
                      key={qualification.id}
                      value={qualification.id.toString()}
                    >
                      {qualification.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedQualification &&
            selectedQualification.sub_qualifications &&
            selectedQualification.sub_qualifications.length > 0 && (
              <div>
                <Label>Sub Qualification</Label>
                <Select
                  value={subQualificationId?.toString() || ''}
                  onValueChange={(value) =>
                    setSubQualificationId(value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-qualification (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {selectedQualification.sub_qualifications.map((subQual) => (
                      <SelectItem
                        key={subQual.id}
                        value={subQual.id.toString()}
                      >
                        {subQual.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          <div>
            <Label>Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              rows={3}
            />
          </div>

          <div>
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to use current date/time
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!qualificationId || isLoading}>
              {isLoading ? 'Adding...' : 'Add Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

