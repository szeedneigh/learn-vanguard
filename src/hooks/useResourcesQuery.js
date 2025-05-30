import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { 
  getResources, 
  getResource, 
  createResource, 
  updateResource, 
  deleteResource, 
  searchResources,
  uploadResource,
  getResourceDownloadUrl
} from '@/lib/api/resourceApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for fetching resources with filters
 * @param {Object} filters - Query filters (subjectId, type, search, tags)
 * @param {Object} options - React Query options
 */
export const useResources = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.resources.concat([filters]),
    queryFn: () => getResources(filters),
    select: (data) => data?.data || [],
    enabled: !!filters.subjectId, // Require subjectId to fetch resources
    ...options,
  });
};

/**
 * Hook for fetching resources by subject
 * @param {string} subjectId - Subject ID
 * @param {Object} options - React Query options
 */
export const useResourcesBySubject = (subjectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.resourcesBySubject(subjectId),
    queryFn: () => getResources({ subjectId }),
    select: (data) => data?.data || [],
    enabled: !!subjectId,
    ...options,
  });
};

/**
 * Hook for fetching a single resource by ID
 * @param {string} resourceId - Resource ID
 * @param {Object} options - React Query options
 */
export const useResource = (resourceId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.resource(resourceId),
    queryFn: () => getResource(resourceId),
    select: (data) => data?.data || null,
    enabled: !!resourceId,
    ...options,
  });
};

/**
 * Hook for creating a new resource
 */
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resourceData) => createResource(resourceData),
    onSuccess: (data) => {
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      
      toast({
        title: 'Success',
        description: data.message || 'Resource created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to create resource',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for updating an existing resource
 */
export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ resourceId, resourceData }) => updateResource(resourceId, resourceData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource(variables.resourceId) });
      
      toast({
        title: 'Success',
        description: data.message || 'Resource updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to update resource',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for deleting a resource
 */
export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resourceId) => deleteResource(resourceId),
    onSuccess: (data) => {
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      
      toast({
        title: 'Success',
        description: data.message || 'Resource deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to delete resource',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for downloading a resource
 */
export const useDownloadResource = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resourceId) => getResourceDownloadUrl(resourceId),
    onSuccess: (data, resourceId) => {
      if (data?.url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = `resource-${resourceId}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Success',
          description: 'Download started successfully',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to download resource',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for file upload with progress tracking
 */
export const useFileUpload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, resourceData, onProgress }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Append other resource data
      Object.keys(resourceData).forEach(key => {
        if (resourceData[key] !== undefined && resourceData[key] !== null) {
          formData.append(key, resourceData[key]);
        }
      });

      return uploadResource(formData, onProgress);
    },
    onSuccess: (data) => {
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Comprehensive hook that combines all resource-related functionality
 * for the Resources page component
 */
export const useResourcesPage = (subjectId, filters = {}) => {
  // Main queries
  const resourcesQuery = useResources({ subjectId, ...filters });

  // Mutations
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();
  const downloadResourceMutation = useDownloadResource();
  const fileUploadMutation = useFileUpload();

  // Computed values
  const resources = resourcesQuery.data || [];

  // Filter resources by type
  const resourcesByType = {
    all: resources,
    pdf: resources.filter(r => r.type?.toLowerCase() === 'pdf'),
    video: resources.filter(r => r.type?.toLowerCase() === 'video'),
    document: resources.filter(r => r.type?.toLowerCase() === 'document'),
    link: resources.filter(r => r.type?.toLowerCase() === 'link'),
  };

  return {
    // Data
    resources,
    resourcesByType,
    
    // Loading states
    isLoading: resourcesQuery.isLoading,
    isError: resourcesQuery.isError,
    error: resourcesQuery.error,
    
    // Refetch functions
    refetch: resourcesQuery.refetch,
    
    // Mutations
    createResource: createResourceMutation.mutate,
    updateResource: updateResourceMutation.mutate,
    deleteResource: deleteResourceMutation.mutate,
    downloadResource: downloadResourceMutation.mutate,
    uploadFile: fileUploadMutation.mutate,
    
    // Mutation loading states
    isCreating: createResourceMutation.isPending,
    isUpdating: updateResourceMutation.isPending,
    isDeleting: deleteResourceMutation.isPending,
    isDownloading: downloadResourceMutation.isPending,
    isUploading: fileUploadMutation.isPending,
    
    // Any mutation loading
    isMutating: createResourceMutation.isPending || 
                updateResourceMutation.isPending || 
                deleteResourceMutation.isPending || 
                downloadResourceMutation.isPending || 
                fileUploadMutation.isPending,
  };
}; 