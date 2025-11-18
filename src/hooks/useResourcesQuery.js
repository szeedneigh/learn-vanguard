import logger from "@/utils/logger";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
  uploadResource,
  getResourceDownloadUrl,
} from "@/lib/api/resourceApi";
import { useToast } from "@/hooks/use-toast";

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
 * Hook for fetching resources by subject
 * @param {string} subjectId - Subject ID
export const useResourcesBySubject = (subjectId, options = {}) => {
    queryKey: queryKeys.resourcesBySubject(subjectId),
    queryFn: () => getResources({ subjectId }),
    enabled: !!subjectId,
 * Hook for fetching a single resource by ID
 * @param {string} resourceId - Resource ID
export const useResource = (resourceId, options = {}) => {
    queryKey: queryKeys.resource(resourceId),
    queryFn: () => getResource(resourceId),
    select: (data) => data?.data || null,
    enabled: !!resourceId,
 * Hook for creating a new resource
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (resourceData) => createResource(resourceData),
    onSuccess: (data) => {
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      toast({
        title: "Success",
        description: data.message || "Resource created successfully",
      });
    },
    onError: (error) => {
        title: "Error",
        description: error.error || "Failed to create resource",
        variant: "destructive",
 * Hook for updating an existing resource
export const useUpdateResource = () => {
    mutationFn: ({ resourceId, resourceData }) =>
      updateResource(resourceId, resourceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resource(variables.resourceId),
        description: data.message || "Resource updated successfully",
        description: error.error || "Failed to update resource",
 * Hook for deleting a resource
export const useDeleteResource = () => {
    mutationFn: (resourceId) => deleteResource(resourceId),
    onSuccess: (data, resourceId) => {
      // Get the resource details from cache if available to determine if it's a topic resource
      const resourceCache = queryClient.getQueryCache().findAll({
        predicate: (query) => {
          const data = query.state.data;
          if (!data) return false;
          // Check if this is a resources array that contains our resource
          if (Array.isArray(data)) {
            return data.some(
              (r) => r.id === resourceId || r._id === resourceId
            );
          }
          // Check if this is a single resource
          return data.id === resourceId || data._id === resourceId;
        },
      // If we found the resource in cache, check if it has a topicId
      resourceCache.forEach((query) => {
        const data = query.state.data;
        if (!data) return;
        let resource;
        if (Array.isArray(data)) {
          resource = data.find(
            (r) => r.id === resourceId || r._id === resourceId
          );
        } else {
          resource = data;
        }
        if (resource && resource.topicId) {
          // If it's a topic resource, invalidate topic-specific queries
          const topicId =
            typeof resource.topicId === "object"
              ? resource.topicId.id || resource.topicId._id
              : resource.topicId;
          const subjectId =
            typeof resource.subjectId === "object"
              ? resource.subjectId.id || resource.subjectId._id
              : resource.subjectId;
          if (topicId) {
            logger.log(`Invalidating resources for topic ${topicId}`);
            queryClient.invalidateQueries({
              queryKey: ["resources", { topicId }],
            });
          if (subjectId) {
            logger.log(`Invalidating topics for subject ${subjectId}`);
              queryKey: ["topics", subjectId],
        description: data.message || "Resource deleted successfully",
        description: error.error || "Failed to delete resource",
 * Hook for downloading a resource
export const useDownloadResource = () => {
    mutationFn: (resourceId) => getResourceDownloadUrl(resourceId),
      if (data?.url) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `resource-${resourceId}`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Success",
          description: "Download started successfully",
        });
      }
        description: error.error || "Failed to download resource",
 * Hook for file upload with progress tracking
export const useFileUpload = () => {
    mutationFn: async ({
      file,
      resourceData,
      onSuccess,
      onError,
      onProgress,
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      // Append other resource data
      Object.keys(resourceData).forEach((key) => {
        if (resourceData[key] !== undefined && resourceData[key] !== null) {
          formData.append(key, resourceData[key]);
      // Ensure files are publicly accessible
      formData.append("isPublic", "true");
      try {
        const result = await uploadResource(formData, onProgress);
        // Call the success callback if provided
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(result);
        return result;
      } catch (error) {
        // Call the error callback if provided
        if (onError && typeof onError === "function") {
          onError(error);
        throw error;
    onSuccess: (data, { resourceData }) => {
      logger.log("useFileUpload: Upload successful, invalidating queries...");
      // If this is a topic upload, invalidate topics queries too
      if (resourceData.topicId) {
        logger.log(
          `useFileUpload: Invalidating topics for subject: ${resourceData.subjectId}`
        );
        queryClient.invalidateQueries({
          queryKey: ["topics", resourceData.subjectId],
        // Also invalidate specific topic resources
          queryKey: ["resources", { topicId: resourceData.topicId }],
        // Force refetch after a small delay to ensure backend has processed the upload
        setTimeout(() => {
          logger.log(
            `useFileUpload: Forced refetch for topic ${resourceData.topicId}`
          queryClient.refetchQueries({
            queryKey: ["resources", { topicId: resourceData.topicId }],
          });
            queryKey: ["topics", resourceData.subjectId],
        }, 1000);
      // Also refetch all resources for the subject to ensure the new file appears
      if (resourceData.subjectId) {
          `useFileUpload: Refetching resources for subject ${resourceData.subjectId}`
        queryClient.refetchQueries({
          queryKey: ["resources", { subjectId: resourceData.subjectId }],
        // Add more aggressive refetching with delays
        [1500, 3000].forEach((delay) => {
          setTimeout(() => {
            logger.log(
              `useFileUpload: Delayed refetch (${delay}ms) for subject ${resourceData.subjectId}`
            queryClient.refetchQueries({
              queryKey: ["resources", { subjectId: resourceData.subjectId }],
            // Also refetch with no filters to ensure all resources are updated
              queryKey: ["resources"],
          }, delay);
    onError: (error, { onError }) => {
      // The component's onError callback is already called in the mutationFn,
      // so we don't need to call it again here
        description: error.error || "Failed to upload file",
 * Comprehensive hook that combines all resource-related functionality
 * for the Resources page component
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
    pdf: resources.filter((r) => r.type?.toLowerCase() === "pdf"),
    video: resources.filter((r) => r.type?.toLowerCase() === "video"),
    document: resources.filter((r) => r.type?.toLowerCase() === "document"),
    link: resources.filter((r) => r.type?.toLowerCase() === "link"),
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
    isMutating:
      createResourceMutation.isPending ||
      updateResourceMutation.isPending ||
      deleteResourceMutation.isPending ||
      downloadResourceMutation.isPending ||
      fileUploadMutation.isPending,
