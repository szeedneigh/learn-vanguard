import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusClasses, capitalize, toLocaleDateStringISO } from "@/lib/calendarHelpers";

function TaskFormDialog({ open, onOpenChange, task, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState(task || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
        setFormData(task || {
            title: '',
            date: toLocaleDateStringISO(new Date()), 
            status: 'not-started',
            priority: 'medium',
            course: '', 
            description: '',
        });
        setErrors({});
    }
  }, [task, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    else if (isNaN(new Date(formData.date).getTime())) newErrors.date = "Invalid date format.";
    if (!formData.course?.trim()) newErrors.course = "Course is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
     setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} error={errors.title} required />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input id="date" type="date" name="date" value={formData.date || ''} onChange={handleInputChange} error={errors.date} required />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course/Subject</label>
              <Input id="course" name="course" value={formData.course || ''} onChange={handleInputChange} error={errors.course} required />
              {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
            </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select name="status" value={formData.status || 'not-started'} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusClasses).map(([key]) => (
                            <SelectItem key={key} value={key}>{capitalize(key)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select name="priority" value={formData.priority || 'medium'} onValueChange={(value) => handleSelectChange('priority', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {task ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

TaskFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    task: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default TaskFormDialog; 