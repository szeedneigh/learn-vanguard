import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getUsers,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateUserRole,
  updateUserStatus,
  assignPIORole,
  revertPIORole,
} from "@/lib/api/userApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for assigning PIO role
 */
export const useAssignPIORole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, assignedClass }) => {
      if (!userId) {
        throw new Error("User ID is required to assign PIO role");
      }

      console.log(
        `Assigning PIO role to user ${userId} with class ${assignedClass}`
      );
      return await assignPIORole(userId, assignedClass);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast({
        title: "Success",
        description: "PIO role assigned successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useAssignPIORole:", error);

      // Check if the error is due to an existing PIO
      const errorMessage =
        error.error || error.message || "Failed to assign PIO role";
      const isPIOExistsError = errorMessage.includes("already a PIO assigned");

      toast({
        title: isPIOExistsError ? "PIO Already Exists" : "Error",
        description: errorMessage,
        variant: "destructive",
        duration: isPIOExistsError ? 5000 : 3000, // Show longer for important errors
      });

      // Even on error, we should refresh the user list to ensure UI is up-to-date
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

/**
 * Hook for reverting PIO role
 */
export const useRevertPIORole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId) => {
      if (!userId) {
        throw new Error("User ID is required to revert PIO role");
      }
      console.log(`Reverting PIO role for user ${userId}`);
      return await revertPIORole(userId);
    },
    onSuccess: () => {
      // Invalidate all user-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast({
        title: "Success",
        description: "PIO role reverted successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useRevertPIORole:", error);
      const errorMessage =
        error.error || error.message || "Failed to revert PIO role";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Even on error, we should refresh the user list to ensure UI is up-to-date
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

/**
 * Hook for fetching users with filters
 * @param {Object} filters - Query filters (course, yearLevel, role, etc.)
 * @param {Object} options - React Query options
 */
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.concat([filters]),
    queryFn: () => getUsers(filters),
    select: (data) => data?.data || [],
    ...options,
  });
};

/**
 * Hook for fetching class students (simulated with filtered users)
 * @param {Object} classInfo - Class information (course, yearLevel)
 * @param {Object} options - React Query options
 */
export const useClassStudents = (classInfo, options = {}) => {
  return useQuery({
    queryKey: queryKeys.usersByProgram(classInfo?.course, classInfo?.yearLevel),
    queryFn: async () => {
      try {
        // Get all users (both students and PIOs) for this class
        const response = await getUsers({
          course: classInfo?.course,
          yearLevel: classInfo?.yearLevel,
        });

        // Ensure consistent ID field naming
        const data = response?.data || [];
        return {
          ...response,
          data: data.map((user) => ({
            ...user,
            // Ensure both _id and id are available for compatibility
            _id: user._id || user.id,
            id: user.id || user._id,
          })),
        };
      } catch (error) {
        console.error("Error fetching class students:", error);
        throw error;
      }
    },
    select: (data) => data?.data || [],
    enabled: !!(classInfo?.course && classInfo?.yearLevel),
    ...options,
  });
};

/**
 * Hook for fetching current user profile
 * @param {Object} options - React Query options
 */
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => getCurrentUserProfile(),
    select: (data) => data?.data || null,
    ...options,
  });
};

/**
 * Hook for updating user role (admin function)
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update user role",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating user status (admin function)
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });

      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update user status",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for removing a user (admin function)
 */
export const useRemoveUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId) => {
      if (!userId) {
        throw new Error("User ID is required to remove a user");
      }
      return await deleteUser(userId);
    },
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });

      toast({
        title: "Success",
        description: "User removed successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useRemoveUser:", error);
      const errorMessage =
        error.error || error.message || "Failed to remove user";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profileData) => updateCurrentUserProfile(profileData),
    onSuccess: (data) => {
      // Update the user profile cache
      queryClient.setQueryData(queryKeys.auth, data);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for searching users (for add student modal)
 * @param {string} searchQuery - Search term
 * @param {Object} options - React Query options
 */
export const useSearchUsers = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.concat(["search", searchQuery]),
    queryFn: async () => {
      const response = await getUsers({ search: searchQuery, role: "student" });

      // Ensure consistent ID field naming
      const data = response?.data || [];
      return {
        ...response,
        data: data.map((user) => ({
          ...user,
          // Ensure both _id and id are available for compatibility
          _id: user._id || user.id,
          id: user.id || user._id,
        })),
      };
    },
    select: (data) => data?.data || [],
    enabled: !!(searchQuery && searchQuery.trim().length > 2),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
};

/**
 * Utility hook that combines multiple user-related queries and mutations
 * for the Users page component
 */
export const useUsersPage = (selectedProgram, selectedYear) => {
  // Map program ID to full course name
  const getProgramName = (programId) => {
    switch (programId) {
      case "bsis":
        return "Bachelor of Science in Information Systems";
      case "act":
        return "Associate in Computer Technology";
      default:
        return programId;
    }
  };

  // Map numeric year to year level string
  const getYearLevel = (year) => {
    switch (year) {
      case "1":
        return "First Year";
      case "2":
        return "Second Year";
      case "3":
        return "Third Year";
      case "4":
        return "Fourth Year";
      default:
        return year;
    }
  };

  const classInfo = {
    course: getProgramName(selectedProgram),
    yearLevel: getYearLevel(selectedYear),
  };

  // Main queries
  const classStudentsQuery = useClassStudents(classInfo);
  // Keep this commented out for now as it might be needed in the future
  // const allUsersQuery = useUsers({ role: "student" }, { enabled: false });

  // Mutations
  const assignPIOMutation = useAssignPIORole();
  const revertPIOMutation = useRevertPIORole();
  const removeUserMutation = useRemoveUser();

  // Process students data to ensure consistent ID fields
  const processStudentsData = (students = []) => {
    return students.map((student) => ({
      ...student,
      _id: student._id || student.id,
      id: student.id || student._id,
    }));
  };

  return {
    // Queries
    students: processStudentsData(classStudentsQuery.data || []),
    isLoading: classStudentsQuery.isLoading,
    error: classStudentsQuery.error,
    refetch: classStudentsQuery.refetch,

    // Search functionality
    searchUsers: useSearchUsers,

    // Mutations
    assignPIO: assignPIOMutation.mutate,
    revertPIO: revertPIOMutation.mutate,
    removeUser: removeUserMutation.mutate,

    // Loading states
    isAssigningPIO: assignPIOMutation.isPending,
    isRevertingPIO: revertPIOMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,

    // Any mutation loading
    isMutating:
      assignPIOMutation.isPending ||
      revertPIOMutation.isPending ||
      removeUserMutation.isPending,

    // Error states
    assignPIOError: assignPIOMutation.error,
    revertPIOError: revertPIOMutation.error,
    removeUserError: removeUserMutation.error,
  };
};
