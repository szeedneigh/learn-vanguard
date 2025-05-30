import { useState, useEffect, useCallback, useMemo } from "react";

export const useTasks = (toast) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks.map(task => ({...task, id: task.id})));
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskSubmit = useCallback((taskData) => {
    if (taskData.id) {
      setTasks(prev => prev.map(task =>
        String(task.id) === String(taskData.id) ? { ...taskData } : task
      ));
      toast({ title: "Task Updated", description: "Task updated successfully!" });
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isArchived: false,
      };
      setTasks(prev => [...prev, newTask]);
      toast({ title: "Task Created", description: "New task added successfully!" });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [toast]);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => 
      String(task.id) !== String(taskId)
    ));
    toast({ title: "Task Deleted", description: "Task removed successfully!" });
  }, [toast]);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        String(task.id) === String(taskId)
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt
            }
          : task
      )
    );
    toast({ 
      title: "Task Status Updated", 
      description: `Task moved successfully.`
    });
  }, [toast]);

  const handleArchiveTask = useCallback((taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        String(task.id) === String(taskId)
          ? { 
              ...task, 
              isArchived: true,
              archivedAt: new Date().toISOString()
            }
          : task
      )
    );
  }, []);

  const handleRestoreTask = useCallback((taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        String(task.id) === String(taskId)
          ? { 
              ...task, 
              isArchived: false,
              archivedAt: null
            }
          : task
      )
    );
  }, []);

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const searchMatch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    const archiveMatch = showArchived ? task.isArchived : !task.isArchived;
    return searchMatch && statusMatch && priorityMatch && archiveMatch;
  }), [tasks, searchQuery, statusFilter, priorityFilter, showArchived]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      notStarted: tasks.filter(t => t.status === 'not-started').length,
      onHold: tasks.filter(t => t.status === 'on-hold').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') {
          return false;
        }
        try {
          return new Date(t.dueDate) < now;
        } catch (e) {
          return false;
        }
      }).length,
      archived: tasks.filter(t => t.isArchived).length,
      highPriority: tasks.filter(t => t.priority === 'High' && t.status !== 'completed').length,
    };
  }, [tasks]);

  return {
    tasks,
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
    handleArchiveTask,
    handleRestoreTask,
    showArchived,
    setShowArchived,
    filteredTasks,
    stats
  };
};