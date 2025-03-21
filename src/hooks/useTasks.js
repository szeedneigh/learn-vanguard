import { useState, useEffect, useCallback, useMemo } from "react";

export const useTasks = (toast) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskSubmit = useCallback((taskData) => {
    if (taskData.id) {
      setTasks(prev => prev.map(task => 
        task.id === taskData.id ? { ...taskData } : task
      ));
      toast({ title: "Task Updated", description: "Task updated successfully!" });
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      toast({ title: "Task Created", description: "New task added successfully!" });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [toast]);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({ title: "Task Deleted", description: "Task removed successfully!" });
  }, [toast]);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  }, []);

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const searchMatch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return searchMatch && statusMatch && priorityMatch;
  }), [tasks, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
  }), [tasks]);

  return {
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
    stats
  };
};