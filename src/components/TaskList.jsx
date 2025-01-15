import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ListFilter, RefreshCcw, Calendar, CheckCircle, Circle, Clock,
  BarChart2, AlertCircle, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const TaskStats = ({ tasks }) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <BarChart2 className="h-8 w-8 text-blue-500" />
        </div>
      </Card>
      <Card className="p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </Card>
      <Card className="p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
          </div>
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
      </Card>
      <Card className="p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Not Started</p>
            <p className="text-2xl font-semibold">{stats.notStarted}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-slate-500" />
        </div>
      </Card>
    </div>
  );
};

const TaskPreviewCard = ({ task }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-amber-100 text-amber-800',
      'not-started': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || colors['not-started'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <h3 className="font-medium text-slate-900">{task.name}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{task.date}</span>
            </div>
            <Badge className={`${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskList = () => {
  const [filter, setFilter] = useState('all');
  
  const tasks = [
    {
      id: 1,
      name: 'Code',
      description: 'Activity for appdev',
      date: 'Jan 5, 2025',
      status: 'in-progress',
    },
    {
      id: 2,
      name: 'Review',
      description: 'All subjects',
      date: 'Feb 28, 2025',
      status: 'not-started',
    },
    {
      id: 3,
      name: 'Project',
      description: 'Student resource hub',
      date: 'Jan 20, 2025',
      status: 'completed',
    },
  ];

  const filteredTasks = filter === 'all' 
    ? tasks.slice(0, 3) // Show only first 3 tasks
    : tasks.filter(task => task.status === filter).slice(0, 3);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <TaskStats tasks={tasks} />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] shadow-sm hover:shadow-md transition-all">
                <ListFilter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              className="shadow-sm hover:shadow-md transition-all"
              onClick={() => setFilter('all')}
            >
              <RefreshCcw className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <>
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="transform hover:-translate-y-1 transition-all duration-200"
              >
                <TaskPreviewCard task={task} />
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline"
                className="shadow-sm hover:shadow-md transition-all">
                <Link to="/dashboard/events" className="flex items-center gap-2">
                  View All Tasks
                </Link>
                <ArrowRight className="ml-2 h-4 w-4" />
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