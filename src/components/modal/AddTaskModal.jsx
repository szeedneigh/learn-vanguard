import logger from "@/utils/logger";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseISO, startOfDay } from "date-fns";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const TaskModal = ({ isOpen, onClose, onSubmit, editTask = null }) => {
  const { toast } = useToast();
  const [errors, setErrors] = useState({});
  // Normalize task data to handle both frontend and backend formats
  const normalizeTaskData = useCallback((task) => {
    if (!task) return null;
    logger.log("Normalizing task data:", task);
    // Format date to YYYY-MM-DD for input[type="date"] and time to HH:MM for input[type="time"]
    let formattedDueDate = "";
    let formattedDueTime = "23:59"; // Default to end of day
    if (task.dueDate || task.taskDeadline) {
      const dateStr = task.dueDate || task.taskDeadline;
      try {
        // Parse the date and format it as YYYY-MM-DD and HH:MM
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          formattedDueDate = date.toISOString().split("T")[0];
          // Extract time in HH:MM format
          formattedDueTime = date.toTimeString().slice(0, 5);
        }
      } catch (error) {
        logger.error("Error formatting date:", error);
      }
    }
    // Convert backend format to frontend format
    return {
      id: task.id || task._id,
      name: task.name || task.taskName || "",
      description: task.description || task.taskDescription || "",
      dueDate: formattedDueDate,
      dueTime: formattedDueTime,
      // Normalize the priority format
      priority:
        task.priority ||
        (task.taskPriority === "High Priority"
          ? "High"
          : task.taskPriority === "Medium Priority"
          ? "Medium"
          : task.taskPriority === "Low Priority"
          ? "Low"
          : "Medium"),
      // Normalize the status format
      status:
        task.status ||
        (task.taskStatus === "Not yet started"
          ? "not-started"
          : task.taskStatus === "In progress"
          ? "in-progress"
          : task.taskStatus === "On-hold"
          ? "on-hold"
          : task.taskStatus === "Completed"
          ? "completed"
          : "not-started"),
      onHoldRemark: task.onHoldRemark || "",
      lastUpdated:
        task.lastUpdated || task.updatedAt || new Date().toISOString(),
    };
  }, []);
  const initialFormState = useMemo(() => {
    const normalizedTask = normalizeTaskData(editTask);
    return (
      normalizedTask || {
        id: null,
        name: "",
        description: "",
        dueDate: "",
        dueTime: "23:59", // Default to end of day
        priority: "Medium",
        status: "not-started",
        onHoldRemark: "",
        lastUpdated: new Date().toISOString(),
    );
  }, [editTask, normalizeTaskData]);
  const [formData, setFormData] = useState(initialFormState);
  useEffect(() => {
    logger.log("Setting form data:", { initialFormState, editTask });
    setFormData(initialFormState);
    setErrors({});
  }, [isOpen, initialFormState, editTask]);
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    } else if (formData.name.length > MAX_TITLE_LENGTH) {
      newErrors.name = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    if (!formData.dueTime) {
      newErrors.dueTime = "Due time is required";
    // Validate that the combined date and time is not in the past
    if (formData.dueDate && formData.dueTime) {
        const now = new Date();
        const selectedDateTime = new Date(
          `${formData.dueDate}T${formData.dueTime}:00`
        );
        if (selectedDateTime <= now) {
          // If it's today, check if the time has passed
          const today = new Date().toISOString().split("T")[0];
          if (formData.dueDate === today) {
            newErrors.dueTime = "Due time cannot be in the past";
          } else if (selectedDateTime < startOfDay(now)) {
            newErrors.dueDate = "Due date cannot be in the past";
          }
        logger.error("Error validating datetime:", error);
        newErrors.dueDate = "Invalid date or time format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateForm()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please check all required fields.",
        });
        return;
      // Combine date and time into a proper datetime for the backend
      const taskDeadline = new Date(
        `${formData.dueDate}T${formData.dueTime}:00`
      ).toISOString();
      onSubmit({
        ...formData,
        taskDeadline, // Send combined datetime to backend
      });
      toast({
        title: editTask ? "Task Updated" : "Task Created",
        description: editTask
          ? "Your task has been successfully updated."
          : "New task has been added to your list.",
      onClose();
    },
    [formData, validateForm, onSubmit, onClose, editTask, toast]
  );
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  const getPriorityBadgeColor = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-red-100 text-red-800",
    return colors[priority] || colors.Medium;
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-primary">
            {editTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {editTask
              ? "Update your task details below"
              : "Fill in the details to create a new task"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Card>
              <CardContent className="p-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="taskName" className="text-sm font-medium">
                    Task Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taskName"
                    name="name"
                    placeholder="Enter task name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "ring-destructive" : ""}
                  />
                  <div className="flex justify-between text-sm">
                    {errors.name && (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {formData.name.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
                </div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    className={`min-h-[120px] ${
                      errors.description ? "ring-destructive" : ""
                    }`}
                    {errors.description && (
                        {errors.description}
                      {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">
                      Due Date <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className={`pl-10 ${
                          errors.dueDate ? "ring-destructive" : ""
                        }`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {errors.dueDate && (
                      <span className="text-destructive text-sm flex items-center gap-1">
                        {errors.dueDate}
                    <Label htmlFor="dueTime" className="text-sm font-medium">
                      Due Time <span className="text-destructive">*</span>
                        id="dueTime"
                        name="dueTime"
                        type="time"
                        value={formData.dueTime}
                          errors.dueTime ? "ring-destructive" : ""
                      <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    {errors.dueTime && (
                        {errors.dueTime}
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Medium", "High"].map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={getPriorityBadgeColor(priority)}
                              >
                                {priority}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              </CardContent>
            </Card>
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors above before submitting.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editTask ? "Save Changes" : "Create Task"}
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
};
export default TaskModal;
