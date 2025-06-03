import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Import API services
import taskApi from '@/lib/api/taskApi';
import subjectApi from '@/lib/api/subjectApi';
import eventApi from '@/lib/api/eventApi';
import userApi from '@/lib/api/userApi';

/**
 * Task Management Hooks
 */

// Get task summary
export const useTaskSummary = () => {
  return useQuery({
    queryKey: ['tasks', 'summary'],
    queryFn: async () => {
      const result = await taskApi.getTaskSummary();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get tasks with filters
export const useTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const result = await taskApi.getTasks(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { data: result.data, pagination: result.pagination };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Task created successfully');
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, taskData }) => taskApi.updateTask(taskId, taskData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Task updated successfully');
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Task deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
};

/**
 * Subject Management Hooks
 */

// Get subjects with filters
export const useSubjects = (filters = {}) => {
  return useQuery({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      const result = await subjectApi.getSubjects(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Create subject mutation
export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subjectApi.createSubject,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Subject created successfully');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create subject');
    },
  });
};

// Upload lecture mutation
export const useUploadLecture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subjectId, file, title, onProgress }) => 
      subjectApi.uploadLecture(subjectId, file, title, onProgress),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Lecture uploaded successfully');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload lecture');
    },
  });
};

// Delete lecture mutation
export const useDeleteLecture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subjectId, lectureId }) => 
      subjectApi.deleteLecture(subjectId, lectureId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Lecture deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lecture');
    },
  });
};

// Create announcement mutation
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subjectId, announcementData }) => 
      subjectApi.createAnnouncement(subjectId, announcementData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Announcement created successfully');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
};

/**
 * Event Management Hooks
 */

// Get events with filters
export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const result = await eventApi.getEvents(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get today's events
export const useTodayEvents = () => {
  return useQuery({
    queryKey: ['events', 'today'],
    queryFn: async () => {
      const result = await eventApi.getTodayEvents();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Event created successfully');
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, eventData }) => eventApi.updateEvent(eventId, eventData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Event updated successfully');
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
};

// Delete event mutation
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Event deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });
};

/**
 * User Management Hooks
 */

// Get users with filters
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const result = await userApi.getUsers(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get class students
export const useClassStudents = (classInfo) => {
  return useQuery({
    queryKey: ['users', 'class', classInfo],
    queryFn: async () => {
      const result = await userApi.getClassStudents(classInfo);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!(classInfo?.course && classInfo?.yearLevel),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Assign PIO role mutation
export const useAssignPIORole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, assignedClass }) => userApi.assignPIORole(userId, assignedClass),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'PIO role assigned successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign PIO role');
    },
  });
};

// Revert PIO role mutation
export const useRevertPIORole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.revertPIORole,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'PIO role reverted successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to revert PIO role');
    },
  });
};

// Remove user mutation
export const useRemoveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.removeUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'User removed successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove user');
    },
  });
}; 