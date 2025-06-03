import { useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "@/context/AuthContext";
import { toLocaleDateStringISO } from "@/lib/calendarHelpers";

function EventFormDialog({ open, onOpenChange, onSave, onCancel, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toLocaleDateStringISO(new Date()));
  const [errors, setErrors] = useState({});
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setDate(toLocaleDateStringISO(new Date()));
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (title.length > 30) newErrors.title = "Title must be 30 characters or less.";
    if (!date) newErrors.date = "Date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Format data to match backend API
    const eventData = {
      title,
      description,
      scheduleDate: new Date(date + 'T00:00:00').toISOString(),
      label: {
        text: "General",
        color: "#3b82f6" // Default blue color
      },
      course: "General",
      yearLevel: user?.yearLevel || 'First Year',
      archived: false
    };
    
    onSave(eventData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title (max 30 characters)
            </label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
              placeholder="Enter event title"
              required 
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            <div className="text-xs text-right mt-1 text-muted-foreground">
              {title.length}/30
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="flex">
              <Calendar className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EventFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default EventFormDialog; 