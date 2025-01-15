import React from "react";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const AddTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    deadline: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: "not-started",
      dueDate: formData.deadline,
    });
    setFormData({ name: "", description: "", deadline: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] p-6 rounded-xl shadow-lg bg-white dark:bg-gray-900">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              Task Name
            </Label>
            <Input
              id="taskName"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 dark:ring-gray-700 dark:focus:ring-blue-400 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[120px] w-full px-4 py-2 rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 dark:ring-gray-700 dark:focus:ring-blue-400 dark:bg-gray-800 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium">
              Deadline
            </Label>
            <div className="relative">
              <Input
                id="deadline"
                type="date"
                placeholder="Select deadline"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 dark:ring-gray-700 dark:focus:ring-blue-400 dark:bg-gray-800"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;