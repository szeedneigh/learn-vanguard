import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Import API services
import taskApi from "@/lib/api/taskApi";
import subjectApi from "@/lib/api/subjectApi";
import eventApi from "@/lib/api/eventApi";
import userApi from "@/lib/api/userApi";

/**
 * Task Management Hooks
 */

// Get task summary
export const useTaskSummary = () => {
  return useQuery({
    queryKey: ["tasks", "summary"],
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
    queryKey: ["tasks", filters],
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
        toast({
          title: "Success",
          description: result.message || "Task created successfully",
          variant: "default",
        });
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Task updated successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Task deleted successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });
};

/**
 * Subject Management Hooks
 */

// Get subjects with filters
export const useSubjects = (filters = {}) => {
  return useQuery({
    queryKey: ["subjects", filters],
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
        toast({
          title: "Success",
          description: result.message || "Subject created successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Lecture uploaded successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload lecture",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Lecture deleted successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lecture",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Announcement created successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });
};

/**
 * Event Management Hooks
 */

// Get events with filters
export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: ["events", filters],
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
    queryKey: ["events", "today"],
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
        toast({
          title: "Success",
          description: result.message || "Event created successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, eventData }) =>
      eventApi.updateEvent(eventId, eventData),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Event updated successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "Event deleted successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });
};

/**
 * User Management Hooks
 */

// Get users with filters
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ["users", filters],
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
    queryKey: ["users", "class", classInfo],
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
    mutationFn: ({ userId, assignedClass }) =>
      userApi.assignPIORole(userId, assignedClass),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "PIO role assigned successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign PIO role",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "PIO role reverted successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revert PIO role",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: result.message || "User removed successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive",
      });
    },
  });
};
