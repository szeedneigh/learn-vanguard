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
  moveStudent,
} from "@/lib/api/userApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Helper function to get program name from ID
 */
const getProgramNameFromId = (programId) => {
  const programs = {
    bsis: "Bachelor of Science in Information Systems",
    act: "Associate in Computer Technology",
  };
  return programs[programId] || programId;
};

/**
 * Helper function to get year level name
 */
const getYearLevelName = (year) => {
  const yearLevels = {
    1: "First Year",
    2: "Second Year",
    3: "Third Year",
    4: "Fourth Year",
  };
  return yearLevels[year] || year;
};

/**
 * Hook for assigning PIO role
 */
export const useAssignPIORole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params) => {
      // Handle both object and direct parameters
      let userId, course, yearLevel;

      if (typeof params === "object") {
        userId = params.studentId;

        if (params.program && params.yearLevel) {
          // New format with program and yearLevel
          course = getProgramNameFromId(params.program);
          yearLevel = getYearLevelName(params.yearLevel);
        } else if (typeof params.assignedClass === "string") {
          // Legacy format with combined string - split it
          const parts = params.assignedClass.split(" - ");
          if (parts.length !== 2) {
            throw new Error(
              "Invalid assigned class format. Expected 'Course - Year Level'"
            );
          }
          [course, yearLevel] = parts;
        } else {
          throw new Error(
            "Invalid parameters. Need either program/yearLevel or assignedClass"
          );
        }
      } else {
        // Direct parameters (legacy format)
        userId = params;
        const assignedClass = arguments[1];
        if (typeof assignedClass !== "string") {
          throw new Error("Invalid assigned class format");
        }
        const parts = assignedClass.split(" - ");
        if (parts.length !== 2) {
          throw new Error(
            "Invalid assigned class format. Expected 'Course - Year Level'"
          );
        }
        [course, yearLevel] = parts;
      }

      if (!userId || !course || !yearLevel) {
        throw new Error(
          "User ID, course, and year level are all required to assign PIO role"
        );
      }

      console.log(`Assigning PIO role to user ${userId}`, {
        course,
        yearLevel,
      });

      const result = await assignPIORole(userId, { course, yearLevel });

      if (!result.success) {
        throw new Error(result.error || "Failed to assign PIO role");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Use more specific query invalidation to prevent infinite loops
      // Extract class information from the assigned class string
      let assignedClass;

      if (
        typeof variables === "object" &&
        variables.program &&
        variables.yearLevel
      ) {
        // If we have program and yearLevel directly
        const programName = getProgramNameFromId(variables.program);
        const yearLevelName = getYearLevelName(variables.yearLevel);

        // Invalidate only the specific program/year query
        queryClient.invalidateQueries({
          queryKey: queryKeys.usersByProgram(programName, yearLevelName),
        });
      } else {
        // Legacy format - extract from assignedClass string
        assignedClass =
          typeof variables === "object" ? variables.assignedClass : variables;

        if (assignedClass) {
          const parts = assignedClass.split(" - ");
          if (parts.length === 2) {
            const course = parts[0];
            const yearLevel = parts[1];

            // Invalidate only the specific program/year query
            queryClient.invalidateQueries({
              queryKey: queryKeys.usersByProgram(course, yearLevel),
            });
          } else {
            // Fallback to more targeted invalidation
            queryClient.invalidateQueries({
              queryKey: queryKeys.users,
              exact: true,
            });
          }
        } else {
          // Fallback to more targeted invalidation
          queryClient.invalidateQueries({
            queryKey: queryKeys.users,
            exact: true,
          });
        }
      }

      toast({
        title: "Success",
        description: "PIO role assigned successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useAssignPIORole:", error);

      // Check if the error is due to an existing PIO
      const errorMessage = error.message || "Failed to assign PIO role";
      const isPIOExistsError = errorMessage.includes("already a PIO assigned");

      toast({
        title: isPIOExistsError ? "PIO Already Exists" : "Error",
        description: errorMessage,
        variant: "destructive",
        duration: isPIOExistsError ? 5000 : 3000, // Show longer for important errors
      });

      // Don't invalidate queries on error to prevent potential loops
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

      toast({
        title: "Success",
        description: "PIO role reverted successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useRevertPIORole:", error);
      const errorMessage = error.message || "Failed to revert PIO role";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't invalidate queries on error to prevent potential loops
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
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: "User removed successfully",
      });
    },
    onError: (error) => {
      console.error("Error in useRemoveUser:", error);
      const errorMessage = error.message || "Failed to remove user";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't invalidate queries on error to prevent potential loops
    },
  });
};

/**
 * Hook for moving a student to different class (admin function)
 */
export const useMoveStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, moveData }) => {
      const result = await moveStudent(userId, moveData);

      // If the API returned an error, throw it to trigger onError
      if (!result.success) {
        throw new Error(result.error || "Failed to move student");
      }

      return result;
    },
    onSuccess: (data) => {
      // Invalidate all user queries to force a refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.users,
      });

      // Also invalidate specific program queries if we have the data
      if (data?.data?.course && data?.data?.yearLevel) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.usersByProgram(
            data.data.course,
            data.data.yearLevel
          ),
        });
      }

      // Show success message with details
      const user = data.data;
      let message = `${user.firstName} ${user.lastName} moved successfully`;
      if (user.roleChanged) {
        message += " (converted from PIO to Student)";
      }

      toast({
        title: "Student Moved",
        description: message,
      });
    },
    onError: (error) => {
      console.error("Error in useMoveStudent:", error);
      const errorMessage = error.message || "Failed to move student";

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
  const classStudentsQuery = useClassStudents(classInfo, {
    // Refetch every 10 seconds to ensure data is fresh
    refetchInterval: 10000,
    // Also refetch when window regains focus
    refetchOnWindowFocus: true,
  });

  // Mutations
  const assignPIOMutation = useAssignPIORole();
  const revertPIOMutation = useRevertPIORole();
  const removeUserMutation = useRemoveUser();
  const moveStudentMutation = useMoveStudent();

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
    moveStudent: moveStudentMutation.mutate,

    // Loading states
    isAssigningPIO: assignPIOMutation.isPending,
    isRevertingPIO: revertPIOMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
    isMovingStudent: moveStudentMutation.isPending,

    // Any mutation loading
    isMutating:
      assignPIOMutation.isPending ||
      revertPIOMutation.isPending ||
      removeUserMutation.isPending ||
      moveStudentMutation.isPending,

    // Error states
    assignPIOError: assignPIOMutation.error,
    revertPIOError: revertPIOMutation.error,
    removeUserError: removeUserMutation.error,
    moveStudentError: moveStudentMutation.error,
  };
};
