import { useState } from 'react';
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListFilter, RefreshCcw } from "lucide-react";

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

const TaskList = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Tasks</h2>
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

        <div className="text-sm text-slate-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className="transform hover:-translate-y-1 transition-all duration-200">
              <TaskCard task={task} />
            </div>
          ))
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