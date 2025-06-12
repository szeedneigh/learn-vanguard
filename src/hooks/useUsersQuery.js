import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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


/**
 * Hook for assigning PIO role
 */
export const useAssignPIORole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      // Ensure params is an object with required properties
      if (!params || typeof params !== "object") {
        throw new Error("Parameters must be provided as an object with studentId and either (program + yearLevel) or assignedClass");
      }

      const userId = params.studentId;
      let assignedClass;

      // Create assignedClass from program and yearLevel if provided
      if (params.program && params.yearLevel) {
        const programName = getProgramNameFromId(params.program);
        const yearLevelName = getYearLevelName(params.yearLevel);
        assignedClass = `${programName} - ${yearLevelName}`;
      } else if (params.assignedClass) {
        assignedClass = params.assignedClass;
      } else {
        throw new Error("Either (program + yearLevel) or assignedClass must be provided");
      }

      if (!userId) {
        throw new Error("User ID is required to assign PIO role");
      }

      // Validate assignedClass before proceeding to API call
      if (!assignedClass || typeof assignedClass !== "string" || assignedClass.trim() === "") {
        throw new Error("Valid assigned class is required to assign PIO role");
      }

      // Additional validation for assignedClass format (should contain course and year level)
      if (!assignedClass.includes(" - ")) {
        throw new Error("Assigned class must be in format 'Course - Year Level'");
      }

      console.log(
        `Assigning PIO role to user ${userId} with class ${assignedClass}`
      );
      const result = await assignPIORole(userId, assignedClass);

      // If the API returned an error, throw it to trigger onError
      if (!result.success) {
        throw new Error(result.error || "Failed to assign PIO role");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Use targeted invalidation to prevent cascading refetches
      if (variables.program && variables.yearLevel) {
        const programName = getProgramNameFromId(variables.program);
        const yearLevelName = getYearLevelName(variables.yearLevel);

        // Invalidate only the specific query
        queryClient.invalidateQueries({
          queryKey: queryKeys.usersByProgram(programName, yearLevelName),
          exact: true,
        });
      }

      // Don't show toast here - let the component handle it
    },
    onError: (error) => {
      console.error("Error in useAssignPIORole:", error);

      // Don't show toast here - let the component handle it
      // Don't invalidate queries on error
    },
  });
};

// Helper functions for the hooks
const getProgramNameFromId = (programId) => {
  switch (programId) {
    case "bsis":
      return "Bachelor of Science in Information Systems";
    case "act":
      return "Associate in Computer Technology";
    default:
      return programId;
  }
};

const getYearLevelName = (year) => {
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

/**
 * Hook for reverting PIO role
 */
export const useRevertPIORole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      // Handle both string ID and object with studentId
      const userId =
        typeof params === "object" ? params.studentId || null : params;

      if (!userId) {
        throw new Error("User ID is required to revert PIO role");
      }

      console.log(`Reverting PIO role for user ${userId}`);
      const result = await revertPIORole(userId);

      // If the API returned an error, throw it to trigger onError
      if (!result.success) {
        throw new Error(result.error || "Failed to revert PIO role");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Extract program and year info from variables if available
      let course, yearLevel;

      if (
        typeof variables === "object" &&
        variables.program &&
        variables.yearLevel
      ) {
        course = getProgramNameFromId(variables.program);
        yearLevel = getYearLevelName(variables.yearLevel);
      } else {
        // Get the course and year level from the response if available
        course = data?.data?.course;
        yearLevel = data?.data?.yearLevel;
      }

      // Invalidate all user queries to force a refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
      });

      // Also specifically invalidate the program/year query
      if (course && yearLevel) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.usersByProgram(course, yearLevel),
        });
      }

      // Don't show toast here - let the component handle it
    },
    onError: (error) => {
      console.error("Error in useRevertPIORole:", error);
      
      // Don't show toast here - let the component handle it
      // Don't invalidate queries on error
    },
  });
};

/**
 * Hook for fetching users with filters
 * @param {Object} filters - Query filters (course, yearLevel, role, etc.)
 * @param {Object} options - React Query options
 */
export const useUsers = (filters = {}, options = {}) => {
  // Always include isEmailVerified=true in the filters
  const enhancedFilters = {
    ...filters,
    isEmailVerified: true,
  };

  return useQuery({
    queryKey: queryKeys.users.concat([enhancedFilters]),
    queryFn: () => getUsers(enhancedFilters),
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
        // Only fetch verified users
        const filters = {
          course: classInfo?.course,
          yearLevel: classInfo?.yearLevel,
          isEmailVerified: true, // Always get verified accounts only
        };

        const response = await getUsers(filters);

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
      // Use more targeted invalidation
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
        exact: true, // Only invalidate the exact query key, not all related queries
      });

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
      // Use more targeted invalidation
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
        exact: true, // Only invalidate the exact query key, not all related queries
      });

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

  return useMutation({
    mutationFn: async (params) => {
      // Handle both string ID and object with studentId
      const userId =
        typeof params === "object" ? params.studentId || null : params;

      if (!userId) {
        throw new Error("User ID is required to remove a user");
      }

      const result = await deleteUser(userId);

      // If the API returned an error, throw it to trigger onError
      if (!result.success) {
        throw new Error(result.error || "Failed to remove user");
      }

      return result;
    },
    onSuccess: () => {
      // Use more targeted invalidation
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
        exact: true, // Only invalidate the exact query key, not all related queries
      });

      // Don't show toast here - let the component handle it
    },
    onError: (error) => {
      console.error("Error in useRemoveUser:", error);

      // Don't show toast here - let the component handle it
      // Don't invalidate queries on error to prevent potential loops
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
  const queryClient = useQueryClient();
  
  // Map program ID to full course name
  const getProgramName = (programId) => {
    switch (programId) {
      case "bsis":
        return "Bachelor of Science in Information Systems";
      case "act":
        return "Associate of Computer Technology";
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
  const classStudentsQuery = useClassStudents(classInfo, {
    // Remove automatic refetching that causes freezing
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const assignPIOMutation = useAssignPIORole();
  const revertPIOMutation = useRevertPIORole();
  const removeUserMutation = useRemoveUser();
  
  // Add user mutation (missing function causing freezing)
  const addUserMutation = useMutation({
    mutationFn: async (params) => {
      if (!params.studentId) {
        throw new Error("Student ID is required to add user");
      }
      
      // Simulate adding user to class - this should call your actual add user API
      console.log(`Adding user ${params.studentId} to ${params.program} Year ${params.yearLevel}`);
      
      // For now, return success - replace with actual API call
      return { success: true, data: { id: params.studentId } };
    },
    onSuccess: () => {
      // Invalidate the specific class query
      queryClient.invalidateQueries({
        queryKey: queryKeys.usersByProgram(classInfo.course, classInfo.yearLevel),
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Error in addUser:", error);
    },
  });

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
    addUser: addUserMutation.mutate,

    // Loading states
    isAssigningPIO: assignPIOMutation.isPending,
    isRevertingPIO: revertPIOMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
    isAddingUser: addUserMutation.isPending,

    // Any mutation loading
    isMutating:
      assignPIOMutation.isPending ||
      revertPIOMutation.isPending ||
      removeUserMutation.isPending ||
      addUserMutation.isPending,

    // Error states
    assignPIOError: assignPIOMutation.error,
    revertPIOError: revertPIOMutation.error,
    removeUserError: removeUserMutation.error,
    addUserError: addUserMutation.error,
  };
};
