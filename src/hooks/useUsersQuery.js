import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { 
  getUsers, 
  getUser,
  updateUser,
  deleteUser,
  searchUsers,
  getCurrentUserProfile, 
  updateCurrentUserProfile,
  updateUserRole,
  updateUserStatus,
  assignPIORole,
  revertPIORole
} from '@/lib/api/userApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for assigning PIO role
 */
export const useAssignPIORole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, assignedClass }) => assignPIORole(userId, assignedClass),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast({
        title: "Success",
        description: "PIO role assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to assign PIO role",
        variant: "destructive",
      });
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
    mutationFn: (userId) => revertPIORole(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast({
        title: "Success",
        description: "PIO role reverted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error || "Failed to revert PIO role",
        variant: "destructive",
      });
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
    queryFn: () => getUsers({ 
      role: 'STUDENT',
      programId: classInfo?.course,
      year: classInfo?.yearLevel 
    }),
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
    onSuccess: (data, variables) => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to update user role',
        variant: 'destructive',
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
    onSuccess: (data, variables) => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      toast({
        title: 'Success',
        description: 'User status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to update user status',
        variant: 'destructive',
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
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: (data) => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      toast({
        title: 'Success',
        description: 'User removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to remove user',
        variant: 'destructive',
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
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to update profile',
        variant: 'destructive',
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
    queryKey: queryKeys.users.concat(['search', searchQuery]),
    queryFn: () => getUsers({ search: searchQuery, role: 'STUDENT' }),
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
  const classInfo = {
    course: selectedProgram,
    yearLevel: selectedYear,
  };

  // Main queries
  const classStudentsQuery = useClassStudents(classInfo);
  const allUsersQuery = useUsers({ role: 'STUDENT' }, { enabled: false });

  // Mutations
  const assignPIOMutation = useAssignPIORole();
  const revertPIOMutation = useRevertPIORole();
  const removeUserMutation = useRemoveUser();

  return {
    // Queries
    students: classStudentsQuery.data || [],
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
    isMutating: assignPIOMutation.isPending || revertPIOMutation.isPending || removeUserMutation.isPending,
  };
};