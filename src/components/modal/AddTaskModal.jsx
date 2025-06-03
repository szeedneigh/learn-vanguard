import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, AlertCircle } from "lucide-react";
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
import {
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
import { parseISO, startOfDay } from 'date-fns';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const TaskModal = ({ isOpen, onClose, onSubmit, editTask = null }) => {
  const { toast } = useToast();
  const [errors, setErrors] = useState({});
  
  const initialFormState = useMemo(() => ({
    id: editTask?.id || null,
    name: editTask?.name || "",
    description: editTask?.description || "",
    dueDate: editTask?.dueDate || "",
    priority: editTask?.priority || "Medium",
    status: editTask?.status || "not-started",
    lastUpdated: editTask?.lastUpdated || new Date().toISOString()
  }), [editTask]);

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData(initialFormState);
    setErrors({});
  }, [isOpen, initialFormState]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    } else if (formData.name.length > MAX_TITLE_LENGTH) {
      newErrors.name = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const today = startOfDay(new Date());
      const selectedDate = startOfDay(parseISO(formData.dueDate));
      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check all required fields.",
      });
      return;
    }

    onSubmit({
      ...formData,
      lastUpdated: new Date().toISOString()
    });

    toast({
      title: editTask ? "Task Updated" : "Task Created",
      description: editTask 
        ? "Your task has been successfully updated."
        : "New task has been added to your list.",
    });

    onClose();
  }, [formData, validateForm, onSubmit, onClose, editTask, toast]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-red-100 text-red-800"
    };
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
            {editTask ? "Update your task details below" : "Fill in the details to create a new task"}
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

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`min-h-[120px] ${errors.description ? "ring-destructive" : ""}`}
                  />
                  <div className="flex justify-between text-sm">
                    {errors.description && (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                </div>

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
                        className={`pl-10 ${errors.dueDate ? "ring-destructive" : ""}`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {errors.dueDate && (
                      <span className="text-destructive text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Medium", "High"].map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={getPriorityBadgeColor(priority)}>
                                {priority}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                {editTask ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;