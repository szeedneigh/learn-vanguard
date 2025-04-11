import {
  Calendar,
  PlusCircle,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TaskModal from "@/components/modal/AddTaskModal";
import { useTasks } from "@/hooks/useTasks";

const Tasks = () => {
  const { toast } = useToast();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    handleTaskSubmit,
    handleDeleteTask,
    handleStatusChange,
    filteredTasks,
    stats,
  } = useTasks(toast);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<CheckCircle2 />}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 />}
            variant="success"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<ArrowUp />}
            variant="info"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle />}
            variant="destructive"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDeleteTask(task.id)}
              onStatusChange={(newStatus) =>
                handleStatusChange(task.id, newStatus)
              }
            />
          ))}
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
          editTask={editingTask}
        />
      </div>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const statusColors = {
    "not-started": "bg-gray-100 text-gray-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "text-red-600",
    Medium: "text-amber-600",
    Low: "text-emerald-600",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{task.name}</h3>
              <Badge
                className={`${
                  priorityColors[task.priority]
                } border-2 bg-white hover:bg-gray-200`}
              >
                {task.priority} Priority
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          <Select value={task.status} onValueChange={onStatusChange}>
            <SelectTrigger className={`w-32 ${statusColors[task.status]}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value, icon, variant = "default" }) => {
  const variants = {
    default: "bg-white text-gray-900",
    success: "bg-green-50 text-green-800",
    info: "bg-blue-50 text-blue-800",
    destructive: "bg-red-50 text-red-800",
  };

  return (
    <Card className={variants[variant]}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full">{icon}</div>
      </CardContent>
    </Card>
  );
};

export default Tasks;
