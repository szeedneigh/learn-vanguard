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
    if (savedTasks) {
        try {
            const parsedTasks = JSON.parse(savedTasks);
            // Ensure IDs are numbers if they were stringified from numbers originally
            // Date.now() produces numbers, so ensure they are parsed back as such if needed
            // However, for comparison with draggableId, string IDs are fine internally in the hook
            setTasks(parsedTasks.map(task => ({...task, id: task.id}))); // Keep as is if IDs are stored consistently
        } catch (error) {
            console.error("Failed to parse tasks from localStorage", error);
            setTasks([]); // Fallback to empty array on error
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskSubmit = useCallback((taskData) => {
    if (taskData.id) {
      setTasks(prev => prev.map(task =>
        // Ensure consistent ID comparison here as well if taskData.id might be string
        String(task.id) === String(taskData.id) ? { ...taskData } : task
      ));
      toast({ title: "Task Updated", description: "Task updated successfully!" });
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(), // Generates a number
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      toast({ title: "Task Created", description: "New task added successfully!" });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [toast]); // Added toast to dependency array

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => 
        String(task.id) !== String(taskId) // Consistent comparison
    ));
    toast({ title: "Task Deleted", description: "Task removed successfully!" });
  }, [toast]); // Added toast to dependency array

  const handleStatusChange = useCallback((taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        // *** THE FIX IS HERE ***
        // Compare task.id (number or string) with taskId (string from draggableId)
        String(task.id) === String(taskId)
          ? { ...task, status: newStatus }
          : task
      )
    );
    // Optional: Add toast notification for status change
    toast({ 
        title: "Task Status Updated", 
        description: `Task moved successfully.` // You can make this more specific if needed
    });
  }, [toast]); // Added toast to dependency array

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const searchMatch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())); // Added check for task.description
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return searchMatch && statusMatch && priorityMatch;
  }), [tasks, searchQuery, statusFilter, priorityFilter]);

  // Updated stats to handle potential undefined dueDate and ensure overdue calculation is correct
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length, // If you need this stat
      notStarted: tasks.filter(t => t.status === 'not-started').length, // If you need this
      onHold: tasks.filter(t => t.status === 'on-hold').length, // If you need this
      // Ensure dueDate exists and is valid before comparing
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') {
          return false;
        }
        try {
          return new Date(t.dueDate) < now;
        } catch (e) {
          return false; // Invalid date format
        }
      }).length,
      highPriority: tasks.filter(t => t.priority === 'High' && t.status !== 'completed').length, // Example for high priority
    };
  }, [tasks]);

  return {
    tasks, // Expose tasks if needed directly, though filteredTasks is primary
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