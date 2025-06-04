import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AddEditAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  announcement, // announcement object if editing, else null
  subjectName,
  subjectId,
}) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('general');

  useEffect(() => {
    if (isOpen) { // Only update content if modal is open
      if (announcement) {
        setContent(announcement.content || '');
        setTitle(announcement.title || '');
        setPriority(announcement.priority || 'medium');
        setType(announcement.type || 'general');
      } else {
        setContent(''); // Reset for new announcement
        setTitle('');
        setPriority('medium');
        setType('general');
      }
    }
  }, [announcement, isOpen]); // Reset when modal opens or announcement changes

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && title.trim()) {
      onSubmit({
        content: content.trim(),
        title: title.trim(),
        priority,
        type,
        subjectId
      });
      // The modal should be closed by the parent component after successful submission
    }
  };

  const handleModalClose = (open) => {
    // Only call onClose when the dialog is closing
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Add New Announcement'}
          </DialogTitle>
          {subjectName && (
            <DialogDescription>
              For subject: <strong>{subjectName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="announcementTitle">Title</Label>
              <Input
                id="announcementTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="announcementType">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="announcementType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="announcementPriority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="announcementPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcementContent">Content</Label>
              <Textarea
                id="announcementContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your announcement here..."
                rows={6}
                required
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !content.trim() || !title.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {announcement ? 'Save Changes' : 'Post Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AddEditAnnouncementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired, // Receives { content: string, title: string, priority: string, type: string }
  isLoading: PropTypes.bool,
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content: PropTypes.string,
    title: PropTypes.string,
    priority: PropTypes.string,
    type: PropTypes.string,
  }),
  subjectName: PropTypes.string,
  subjectId: PropTypes.string,
}; 