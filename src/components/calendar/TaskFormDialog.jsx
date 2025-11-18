import logger from "@/utils/logger";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
  statusClasses,
  capitalize,
  toLocaleDateStringISO,
} from "@/lib/calendarHelpers";

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSave,
  onCancel,
  isLoading,
}) {
  const [formData, setFormData] = useState(task || {});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (open) {
      setFormData(
        task || {
          title: "",
          date: toLocaleDateStringISO(new Date()),
          time: "23:59", // Default to end of day
          status: "not-started",
          priority: "medium",
          course: "",
          description: "",
        }
      );
      setErrors({});
    }
  }, [task, open]);
  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    else if (isNaN(new Date(formData.date).getTime()))
      newErrors.date = "Invalid date format.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.course?.trim()) newErrors.course = "Course is required.";
    // Validate that the combined date and time is not in the past
    if (formData.date && formData.time) {
      try {
        const now = new Date();
        const selectedDateTime = new Date(
          `${formData.date}T${formData.time}:00`
        );
        if (selectedDateTime <= now) {
          // If it's today, check if the time has passed
          const today = new Date().toISOString().split("T")[0];
          if (formData.date === today) {
            newErrors.time = "Due time cannot be in the past";
          } else if (
            selectedDateTime <
            new Date(now.getFullYear(), now.getMonth(), now.getDate())
          ) {
            newErrors.date = "Due date cannot be in the past";
          }
      } catch (error) {
        logger.error("Error validating datetime:", error);
        newErrors.date = "Invalid date or time format";
      }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSelectChange = (name, value) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Combine date and time into a proper datetime for the backend
    const taskDeadline = new Date(
      `${formData.date}T${formData.time}:00`
    ).toISOString();
    onSave({
      ...formData,
      taskDeadline, // Send combined datetime to backend
    });
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details of your task."
              : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              error={errors.title}
              required
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                error={errors.date}
                required
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
                htmlFor="time"
                Time
                id="time"
                type="time"
                name="time"
                value={formData.time || "23:59"}
                error={errors.time}
              {errors.time && (
                <p className="text-xs text-red-500 mt-1">{errors.time}</p>
                htmlFor="course"
                Course/Subject
                id="course"
                name="course"
                value={formData.course || ""}
                error={errors.course}
              {errors.course && (
                <p className="text-xs text-red-500 mt-1">{errors.course}</p>
                htmlFor="status"
                Status
              <Select
                name="status"
                value={formData.status || "not-started"}
                onValueChange={(value) => handleSelectChange("status", value)}
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusClasses).map(([key]) => (
                    <SelectItem key={key} value={key}>
                      {capitalize(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                htmlFor="priority"
                Priority
                name="priority"
                value={formData.priority || "medium"}
                onValueChange={(value) => handleSelectChange("priority", value)}
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
              htmlFor="description"
              Description
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              rows={3}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {task ? "Save Changes" : "Add Task"}
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
