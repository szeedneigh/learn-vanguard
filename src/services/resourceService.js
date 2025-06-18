import * as resourceApi from "@/lib/api/resourceApi";

const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === "true",
};

// --- Mock Data (Fallback only) ---
const MOCK_RESOURCES = [
  {
    id: "mock-resource-1",
    name: "Database Design Guide",
    description:
      "Comprehensive guide to database design principles and best practices.",
    type: "document",
    url: null,
    fileSize: 2048000,
    mimeType: "application/pdf",
    uploadedBy: "System",
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: "act111",
    downloadCount: 15,
  },
  {
    id: "mock-resource-2",
    name: "Programming Examples",
    description: "Collection of programming examples and exercises.",
    type: "archive",
    url: null,
    fileSize: 5120000,
    mimeType: "application/zip",
    uploadedBy: "System",
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: "act112",
    downloadCount: 8,
  },
];

/**
 * Mock implementation of getResources
 */
const mockGetResources = async (filters = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  let filteredResources = [...MOCK_RESOURCES];

  // Apply filters
  if (filters.subjectId) {
    filteredResources = filteredResources.filter(
      (resource) => resource.subjectId === filters.subjectId
    );
  }
  if (filters.type) {
    filteredResources = filteredResources.filter(
      (resource) => resource.type === filters.type
    );
  }

  return {
    data: filteredResources,
    pagination: {
      page: 1,
      limit: 10,
      total: filteredResources.length,
      totalPages: 1,
    },
  };
};

/**
 * Mock implementation of uploadResource
 */
const mockUploadResource = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload delay

  return {
    id: `mock-resource-${Date.now()}`,
    name: "Uploaded File",
    description: "Mock uploaded file",
    type: "document",
    uploadedBy: "Current User",
    uploadedAt: new Date().toISOString(),
    fileSize: 1024000,
    mimeType: "application/pdf",
  };
};

/**
 * Mock implementation of updateResource
 */
const mockUpdateResource = async (resourceId, updates) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  const existingResource = MOCK_RESOURCES.find(
    (resource) => resource.id === resourceId
  );
  return {
    ...existingResource,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Mock implementation of deleteResource
 */
const mockDeleteResource = async (resourceId) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return { message: `Mock resource ${resourceId} deleted successfully` };
};

/**
 * Get resources with optional filters.
 * Uses backend API with fallback to mock data if API fails.
 * @param {Object} filters - Optional filters (subjectId, type, search, etc.)
 * @returns {Promise<Object>} Resources data with pagination
 */
export const getResources = async (filters = {}) => {
  console.log(
    "resourceService.js: getResources called with filters:",
    filters,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (config.useMockData) {
    console.log("resourceService.js: getResources - returning MOCK_RESOURCES");
    return mockGetResources(filters);
  }

  try {
    console.log(
      "resourceService.js: getResources - attempting to fetch from API"
    );
    const result = await resourceApi.getResources(filters);

    if (result.success) {
      console.log(
        "resourceService.js: getResources - API success:",
        result.data
      );
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } else {
      console.warn(
        "resourceService.js: getResources - API returned error, using fallback:",
        result.error
      );
      return mockGetResources(filters);
    }
  } catch (error) {
    console.error(
      "resourceService.js: getResources - API call failed, using fallback:",
      error
    );
    return mockGetResources(filters);
  }
};

/**
 * Upload a new resource file.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {FormData} formData - FormData containing file and metadata
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Object>} Upload result
 */
export const uploadResource = async (formData, onProgress = null) => {
  console.log(
    "resourceService.js: uploadResource called, USE_MOCK_DATA:",
    config.useMockData
  );

  if (config.useMockData) {
    console.log(
      "resourceService.js: uploadResource - MOCK - uploading resource"
    );
    return mockUploadResource();
  }

  try {
    console.log(
      "resourceService.js: uploadResource - attempting to upload via API"
    );
    const result = await resourceApi.uploadResource(formData, onProgress);

    if (result.success) {
      console.log(
        "resourceService.js: uploadResource - API success:",
        result.data
      );

      // Automatically refresh resources by triggering a new fetch
      // This will update any components that rely on resource data
      try {
        // Extract subject and topic IDs from the form data if available
        const subjectId = formData.get("subjectId");
        const topicId = formData.get("topicId");

        if (subjectId) {
          console.log(
            `resourceService.js: Refreshing resources for subject ${subjectId}`
          );
          // Fetch resources for this subject to update the cache
          await getResources({ subjectId });

          // If we have a topic ID, fetch resources for that specific topic too
          if (topicId) {
            console.log(
              `resourceService.js: Refreshing resources for topic ${topicId}`
            );
            await getResources({ topicId });
          }
        }
      } catch (refreshError) {
        // Don't fail the upload if refresh fails, just log it
        console.warn("Failed to refresh resources after upload:", refreshError);
      }

      return result.data;
    } else {
      console.error(
        "resourceService.js: uploadResource - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(
      "resourceService.js: uploadResource - API call failed:",
      error
    );
    throw error;
  }
};

/**
 * Creates a new resource with uploaded file.
 * @param {Object} resourceData - Basic resource data
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The created resource or error
 */
export const createResource = async (resourceData, file) => {
  console.log("resourceService.js: createResource called with:", resourceData);

  try {
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", resourceData.name);
    formData.append("description", resourceData.description || "");
    formData.append("type", resourceData.type);
    formData.append("programId", resourceData.programId);
    formData.append("yearLevel", resourceData.yearLevel);
    formData.append("semester", resourceData.semester);

    // Add subjectId if provided
    if (resourceData.subjectId) {
      formData.append("subjectId", resourceData.subjectId);
    }

    // Add tags if available
    if (resourceData.tags && resourceData.tags.length > 0) {
      formData.append("tags", JSON.stringify(resourceData.tags));
    }

    // Upload the resource
    const result = await resourceApi.uploadResource(formData);

    if (result.success) {
      console.log(
        "resourceService.js: Resource created successfully:",
        result.data
      );
      return { success: true, data: result.data };
    } else {
      console.error(
        "resourceService.js: Failed to create resource:",
        result.error
      );
      return {
        success: false,
        error: result.error,
        details: result.details || {},
      };
    }
  } catch (error) {
    console.error("resourceService.js: Error creating resource:", error);
    return {
      success: false,
      error:
        typeof error === "string"
          ? error
          : error.message || "Failed to create resource",
    };
  }
};

/**
 * Update an existing resource.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} resourceId - Resource ID
 * @param {Object} updates - Resource updates
 * @returns {Promise<Object>} Updated resource
 */
export const updateResource = async (resourceId, updates) => {
  console.log(
    "resourceService.js: updateResource called with:",
    resourceId,
    updates,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (config.useMockData) {
    console.log(
      "resourceService.js: updateResource - MOCK - updating resource"
    );
    return mockUpdateResource(resourceId, updates);
  }

  try {
    console.log(
      "resourceService.js: updateResource - attempting to update via API"
    );
    const result = await resourceApi.updateResource(resourceId, updates);

    if (result.success) {
      console.log(
        "resourceService.js: updateResource - API success:",
        result.data
      );
      return result.data;
    } else {
      console.error(
        "resourceService.js: updateResource - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(
      "resourceService.js: updateResource - API call failed:",
      error
    );
    throw error;
  }
};

/**
 * Delete a resource.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} resourceId - Resource ID
 * @returns {Promise<void>}
 */
export const deleteResource = async (resourceId) => {
  console.log(
    "resourceService.js: deleteResource called with resourceId:",
    resourceId,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (config.useMockData) {
    console.log(
      "resourceService.js: deleteResource - MOCK - deleting resource"
    );
    return mockDeleteResource(resourceId);
  }

  try {
    console.log(
      "resourceService.js: deleteResource - attempting to delete via API"
    );
    const result = await resourceApi.deleteResource(resourceId);

    if (result.success) {
      console.log(
        "resourceService.js: deleteResource - API success:",
        result.message
      );
      return { message: result.message };
    } else {
      console.error(
        "resourceService.js: deleteResource - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(
      "resourceService.js: deleteResource - API call failed:",
      error
    );
    throw error;
  }
};

/**
 * Search resources.
 * Uses backend API with fallback to mock behavior if API fails.
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchResources = async (query, filters = {}) => {
  console.log(
    "resourceService.js: searchResources called with query:",
    query,
    "filters:",
    filters,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (config.useMockData) {
    console.log(
      "resourceService.js: searchResources - MOCK - searching resources"
    );
    // Simple mock search - filter by name containing query
    const filteredResources = MOCK_RESOURCES.filter(
      (resource) =>
        resource.name.toLowerCase().includes(query.toLowerCase()) ||
        resource.description.toLowerCase().includes(query.toLowerCase())
    );
    return {
      data: filteredResources,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredResources.length,
        totalPages: 1,
      },
    };
  }

  try {
    console.log(
      "resourceService.js: searchResources - attempting to search via API"
    );
    const result = await resourceApi.searchResources(query, filters);

    if (result.success) {
      console.log(
        "resourceService.js: searchResources - API success:",
        result.data
      );
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } else {
      console.warn(
        "resourceService.js: searchResources - API returned error, using fallback:",
        result.error
      );
      // Fallback to simple mock search
      const filteredResources = MOCK_RESOURCES.filter((resource) =>
        resource.name.toLowerCase().includes(query.toLowerCase())
      );
      return {
        data: filteredResources,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredResources.length,
          totalPages: 1,
        },
      };
    }
  } catch (error) {
    console.error(
      "resourceService.js: searchResources - API call failed, using fallback:",
      error
    );
    const filteredResources = MOCK_RESOURCES.filter((resource) =>
      resource.name.toLowerCase().includes(query.toLowerCase())
    );
    return {
      data: filteredResources,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredResources.length,
        totalPages: 1,
      },
    };
  }
};

/**
 * Fetches a single resource by its ID
 * @param {string} resourceId - The ID of the resource to fetch
 * @returns {Promise<Object>} A promise that resolves to the resource object
 */
export const getResourceById = async (resourceId) => {
  console.log(
    "resourceService.js: getResourceById called with resourceId:",
    resourceId,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (!resourceId) {
    return {
      data: null,
      success: false,
      error: "Resource ID is required",
    };
  }

  if (config.useMockData) {
    console.log(
      "resourceService.js: getResourceById - MOCK - getting resource"
    );
    const mockResource = MOCK_RESOURCES.find(
      (resource) => resource.id === resourceId
    );
    return mockResource
      ? { data: mockResource, success: true }
      : { data: null, success: false, error: "Resource not found" };
  }

  try {
    console.log(
      "resourceService.js: getResourceById - attempting to fetch from API"
    );
    const result = await resourceApi.getResource(resourceId);

    if (result.success) {
      console.log(
        "resourceService.js: getResourceById - API success:",
        result.data
      );
      return { data: result.data, success: true };
    } else {
      console.error(
        "resourceService.js: getResourceById - API returned error:",
        result.error
      );
      return { data: null, success: false, error: result.error };
    }
  } catch (error) {
    console.error(
      `resourceService.js: getResourceById - API call failed for resource ${resourceId}:`,
      error
    );
    return {
      data: null,
      success: false,
      error: error.message || "Failed to fetch resource",
    };
  }
};

/**
 * Downloads a resource file
 * @param {string} resourceId - The ID of the resource to download
 * @returns {Promise<Object>} A promise that resolves to download data (URL)
 */
export const downloadResource = async (resourceId) => {
  console.log(
    "resourceService.js: downloadResource called with resourceId:",
    resourceId,
    "USE_MOCK_DATA:",
    config.useMockData
  );

  if (!resourceId) {
    return {
      data: null,
      success: false,
      error: "Resource ID is required",
    };
  }

  if (config.useMockData) {
    console.log(
      "resourceService.js: downloadResource - MOCK - generating download URL"
    );
    return {
      data: { url: `https://mock-download-url.com/resource/${resourceId}` },
      success: true,
    };
  }

  try {
    console.log(
      "resourceService.js: downloadResource - attempting to get download URL from API"
    );
    const result = await resourceApi.getResourceDownloadUrl(resourceId);

    if (result.success) {
      console.log(
        "resourceService.js: downloadResource - API success:",
        result.url
      );
      return { data: { url: result.url }, success: true };
    } else {
      console.error(
        "resourceService.js: downloadResource - API returned error:",
        result.error
      );
      return { data: null, success: false, error: result.error };
    }
  } catch (error) {
    console.error(
      `resourceService.js: downloadResource - API call failed for resource ${resourceId}:`,
      error
    );
    return {
      data: null,
      success: false,
      error: error.message || "Failed to download resource",
    };
  }
};

/**
 * Get resource statistics for a subject
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Resource statistics
 */
export const getResourceStats = async (subjectId) => {
  try {
    const response = await getResources({ subjectId });

    if (!response.success) {
      return response;
    }

    const resources = response.data;
    const stats = {
      total: resources.length,
      byType: {},
      totalSize: 0,
      totalDownloads: 0,
    };

    resources.forEach((resource) => {
      // Count by type
      const type = resource.type || "unknown";
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Sum file sizes and downloads
      stats.totalSize += resource.size || 0;
      stats.totalDownloads += resource.downloads || 0;
    });

    return {
      data: stats,
      success: true,
    };
  } catch (error) {
    console.error("Error getting resource stats:", error);
    return {
      data: null,
      success: false,
      error: error.message || "Failed to get resource statistics",
    };
  }
};

// Export all functions
export default {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
  searchResources,
  uploadResource,
  getResourceStats,
};
