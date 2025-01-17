import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Trash2,
  Calendar,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  BarChart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MAX_TASK_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TaskModal = ({ isOpen, onClose, onSubmit, editTask = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    priority: "medium",
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or editTask changes
  useEffect(() => {
    if (editTask) {
      setFormData({
        name: editTask.name || "",
        description: editTask.description || "",
        deadline: editTask.dueDate || "",
        priority: editTask.priority || "medium",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        deadline: "",
        priority: "medium",
      });
    }
    setErrors({});
  }, [editTask, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    } else if (formData.name.length > MAX_TASK_NAME_LENGTH) {
      newErrors.name = `Task name cannot exceed ${MAX_TASK_NAME_LENGTH} characters`;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else if (new Date(formData.deadline) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.deadline = "Deadline cannot be in the past";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...formData,
      id: editTask?.id,
      status: editTask?.status || "not-started",
      dueDate: formData.deadline,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {editTask
              ? "Update the details of your existing task"
              : "Fill in the details to create a new task"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`shadow-sm ${
                errors.name ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`min-h-[100px] shadow-sm ${
                errors.description ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className={`shadow-sm ${
                  errors.deadline ? "ring-2 ring-red-500" : ""
                }`}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.deadline && (
                <p className="text-red-500 text-sm">{errors.deadline}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="priority" className="shadow-sm">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="shadow-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              {editTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800 shadow-sm",
      medium: "bg-blue-100 text-blue-800 shadow-sm",
      low: "bg-green-100 text-green-800 shadow-sm",
    };
    return colors[priority] || "";
  };

  const getStatusColor = (status) => {
    const colors = {
      "not-started": "bg-red-100/80 text-red-700",
      "in-progress": "bg-amber-100/80 text-amber-700",
      completed: "bg-emerald-100/80 text-emerald-700",
    };
    return colors[status] || "";
  };

  return (
    <Card className="bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-900 mb-2">
              {task.name}
            </h3>
            <Badge className={`${getPriorityColor(task.priority)} shadow-sm`}>
              {task.priority} Priority
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:shadow-md transition-all"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task)}
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:shadow-md transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-slate-600 mb-4">{task.description}</p>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Calendar className="h-4 w-4" />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value)}
        >
          <SelectTrigger
            className={`w-full shadow-sm ${getStatusColor(task.status)}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Complete project documentation",
      description: "Write comprehensive documentation for the new feature set",
      dueDate: "2025-01-20",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 2,
      name: "Review pull requests",
      description: "Review and merge pending pull requests for the main branch",
      dueDate: "2025-01-15",
      status: "completed",
      priority: "medium",
    },
    {
      id: 3,
      name: "Enhance UI/UX",
      description: "Revision of design of the dashboard",
      dueDate: "2025-01-20",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 4,
      name: "Review",
      description: "Final exam review",
      dueDate: "2025-01-20",
      status: "not-started",
      priority: "high",
    },
    {
      id: 5,
      name: "System Testing",
      description: "Test system functionalities",
      dueDate: "2025-01-17",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 6,
      name: "Implementation",
      description: "System implementation",
      dueDate: "2025-01-16",
      status: "completed",
      priority: "high",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== "completed"
    ).length,
    highPriority: tasks.filter(
      (t) => t.priority === "high" && t.status !== "completed"
    ).length,
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDeleteTask = (taskToDelete) => {
    setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === taskData.id 
            ? {
                ...task,
                name: taskData.name,
                description: taskData.description,
                dueDate: taskData.dueDate,
                priority: taskData.priority
              }
            : task
        )
      );
    } else {
      setTasks([...tasks, { ...taskData, id: tasks.length + 1 }]);
    }
    setEditingTask(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const StatCard = ({ title, value, icon }) => {
    return (
      <Card className="bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-100 shadow-md flex items-center justify-center">
            {icon}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<CheckCircle2 className="h-6 w-6 text-blue-500" />}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<BarChart className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="h-6 w-6 text-red-500" />}
          />
          <StatCard
            title="High Priority"
            value={stats.highPriority}
            icon={<ArrowUp className="h-6 w-6 text-amber-500" />}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex-1 min-w-[300px] max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] shadow-sm">
              <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }} 
              className="shadow-sm bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleTaskSubmit}
          editTask={editingTask}
        />
      </div>
    </div>
  );
};

export default Tasks;