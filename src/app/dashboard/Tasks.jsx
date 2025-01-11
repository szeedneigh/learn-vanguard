import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Calendar, Edit2, Check, X, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Improve system implementation",
      description: "Implement the new design system across all major components",
      dueDate: "2025-01-15",
      status: "in-progress"
    },
    {
      id: 2,
      name: "User research and interviews",
      description: "Conduct user interviews for the new feature set",
      dueDate: "2024-12-4",
      status: "completed"
    },
    {
      id: 3,
      name: "Design new UI components",
      description: "Design new UI components for the new feature set",
      dueDate: "2025-01-13",
      status: "in-progress"
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: ''
  });

  const addTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: tasks.length + 1,
      name: formData.name,
      description: formData.description,
      dueDate: formData.deadline,
      status: 'not-started'
    };
    setTasks([...tasks, newTask]);
    setFormData({ name: '', description: '', deadline: '' });
    setIsModalOpen(false);
  };

  const startEditing = (task) => {
    setEditingTask({
      ...task,
      isEditingDescription: false,
      isEditingDate: false
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  const saveEdit = () => {
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTaskStatus = (id, status) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not-started': return 'bg-red-50 text-red-700 ring-1 ring-red-700/10';
      case 'in-progress': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-700/10';
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'not-started': return '🔴';
      case 'in-progress': return '🟡';
      case 'completed': return '🟢';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold ">
              Tasks
            </h1>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            // className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:translate-y-[-2px]"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="group bg-white backdrop-blur-lg bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] rounded-xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(task.status)}</span>
                      <h3 className="font-semibold text-lg text-slate-900">{task.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {editingTask?.id === task.id ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={saveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                          onClick={() => startEditing(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {editingTask?.id === task.id ? (
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className="mb-4 shadow-sm"
                  />
                ) : (
                  <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="space-y-4">
                  <div className="flex items-center text-slate-500 gap-2">
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      {editingTask?.id === task.id ? (
                        <Input
                          type="date"
                          value={editingTask.dueDate}
                          onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                          className="shadow-sm w-40"
                        />
                      ) : (
                        <span className="text-sm">{formatDate(task.dueDate)}</span>
                      )}
                    </div>
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-sm">
                        {getDaysUntilDue(task.dueDate)} days left
                      </span>
                    </div>
                  </div>

                  <Select 
                    value={editingTask?.id === task.id ? editingTask.status : task.status}
                    onValueChange={(value) => {
                      if (editingTask?.id === task.id) {
                        setEditingTask({...editingTask, status: value});
                      } else {
                        updateTaskStatus(task.id, value);
                      }
                    }}
                  >
                    <SelectTrigger className={`w-full ${getStatusColor(task.status)}`}>
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
          ))}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] shadow-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Task
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Add a new task to your project board.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Task Name</label>
                <Input
                  placeholder="Enter task name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px] shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  // className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tasks;