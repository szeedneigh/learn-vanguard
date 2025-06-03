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

export function AddEditAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  announcement, // announcement object if editing, else null
  subjectName,
}) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) { // Only update content if modal is open
      if (announcement) {
        setContent(announcement.content || '');
      } else {
        setContent(''); // Reset for new announcement
      }
    }
  }, [announcement, isOpen]); // Reset when modal opens or announcement changes

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim() });
      // Content is reset by useEffect when modal closes or `announcement` prop changes if isOpen is included
      // or if onClose is called which then changes isOpen.
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
            <Button type="submit" disabled={isLoading || !content.trim()}>
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
  onSubmit: PropTypes.func.isRequired, // Receives { content: string }
  isLoading: PropTypes.bool,
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content: PropTypes.string,
  }),
  subjectName: PropTypes.string,
}; 