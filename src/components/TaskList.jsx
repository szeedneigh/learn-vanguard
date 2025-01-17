import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, BarChart2, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  return colors[priority] || colors.low;
};

const getStatusColor = (status) => {
  const colors = {
    'not-started': "bg-slate-100 text-slate-800",
    'in-progress': "bg-amber-100 text-amber-800",
    'completed': "bg-green-100 text-green-800"
  };
  return colors[status] || colors['not-started'];
};

const TaskPreviewCard = ({ task }) => (
  <Card className="bg-white/70 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base text-slate-900 truncate">{task.name}</h3>
        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
          {task.priority}
        </Badge>
      </div>
      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        <Badge className={`${getStatusColor(task.status)}`}>
          {task.status.replace('-', ' ')}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

const TaskStats = ({ tasks }) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white/70 backdrop-blur-xl shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <BarChart2 className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>
      <Card className="bg-white/70 backdrop-blur-xl shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      <Card className="bg-white/70 backdrop-blur-xl shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
          </div>
          <Clock className="h-8 w-8 text-amber-500" />
        </CardContent>
      </Card>
      <Card className="bg-white/70 backdrop-blur-xl shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Not Started</p>
            <p className="text-2xl font-semibold">{stats.notStarted}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </CardContent>
      </Card>
    </div>
  );
};

const TaskList = () => {
  const [tasks] = useState([
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

  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .slice(0, 3);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <TaskStats tasks={tasks} />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <>
            {filteredTasks.map((task) => (
              <TaskPreviewCard key={task.id} task={task} />
            ))}
            <div className="flex justify-end pt-4">
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-all">
                <Link to="/dashboard/tasks" className="flex items-center gap-2">
                      View all Tasks
                      <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg shadow-sm">
            <p className="text-slate-500">No tasks found matching the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
