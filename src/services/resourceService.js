import apiClient, { createCancelableRequest } from '@/lib/api/client';

/**
 * Environment configuration
 */
const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

/**
 * Mock resources data for development
 */
const MOCK_RESOURCES = [
  {
    id: 'resource-001',
    name: 'Introduction to JavaScript',
    description: 'Learn the fundamentals of JavaScript programming',
    type: 'PDF',
    url: 'https://example.com/resources/intro-js.pdf',
    subjectId: 'subject-001',
    subjectName: 'Web Development Fundamentals',
    uploadedBy: 'mock-pio-001',
    uploadedByName: 'PIO User',
    createdAt: '2023-09-15',
    updatedAt: '2023-09-15',
    downloads: 25,
    size: 1240000, // size in bytes
    tags: ['javascript', 'beginners', 'programming']
  },
  {
    id: 'resource-002',
    name: 'React Component Lifecycle',
    description: 'Understanding React component lifecycle methods',
    type: 'PDF',
    url: 'https://example.com/resources/react-lifecycle.pdf',
    subjectId: 'subject-002',
    subjectName: 'React Fundamentals',
    uploadedBy: 'mock-pio-001',
    uploadedByName: 'PIO User',
    createdAt: '2023-09-20',
    updatedAt: '2023-09-20',
    downloads: 18,
    size: 980000,
    tags: ['react', 'components', 'lifecycle']
  },
  {
    id: 'resource-003',
    name: 'CSS Grid Tutorial',
    description: 'Learn how to use CSS Grid for modern layouts',
    type: 'VIDEO',
    url: 'https://example.com/resources/css-grid.mp4',
    subjectId: 'subject-001',
    subjectName: 'Web Development Fundamentals',
    uploadedBy: 'mock-pio-001',
    uploadedByName: 'PIO User',
    createdAt: '2023-10-05',
    updatedAt: '2023-10-05',
    downloads: 42,
    size: 68500000,
    tags: ['css', 'grid', 'layout']
  },
  {
    id: 'resource-004',
    name: 'JavaScript Event Loop',
    description: 'Deep dive into the JavaScript event loop and asynchronous programming',
    type: 'PDF',
    url: 'https://example.com/resources/js-event-loop.pdf',
    subjectId: 'subject-003',
    subjectName: 'Advanced JavaScript',
    uploadedBy: 'mock-admin-001',
    uploadedByName: 'Admin User',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    downloads: 16,
    size: 1560000,
    tags: ['javascript', 'event-loop', 'async']
  },
  {
    id: 'resource-005',
    name: 'Responsive Design Workshop',
    description: 'Practical workshop on building responsive websites',
    type: 'VIDEO',
    url: 'https://example.com/resources/responsive-design.mp4',
    subjectId: 'subject-001',
    subjectName: 'Web Development Fundamentals',
    uploadedBy: 'mock-pio-001',
    uploadedByName: 'PIO User',
    createdAt: '2023-10-28',
    updatedAt: '2023-10-28',
    downloads: 31,
    size: 125000000,
    tags: ['responsive', 'css', 'design']
  }
];

/**
 * Fetches a list of resources (lectures) for a specific subject.
 * @param {object} params - Query parameters, MUST include subjectId. E.g., { subjectId: 'XYZ', type: 'pdf' }.
 * @returns {Promise<Object>} A promise that resolves to an array of resource objects.
 */
export const getResources = async (params = {}) => {
  if (!params?.subjectId) {
    throw new Error("subjectId is required to fetch resources.");
  }

  if (config.useMockData) {
    return mockGetResources(params);
  }

  try {
    const { data } = await apiClient.get('/resources', { params });
    return { data, success: true, error: null };
  } catch (error) {
    console.error("Error fetching resources:", error.response?.data || error.message);
    return { 
      data: [], 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch resources' 
    };
  }
};

/**
 * Mock implementation of getResources
 * @param {object} params - Filter parameters
 * @returns {Promise<Object>} Mock resource list
 */
const mockGetResources = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let filteredResources = [...MOCK_RESOURCES];
  
  // Filter by subject
  if (params.subjectId) {
    filteredResources = filteredResources.filter(resource => 
      resource.subjectId === params.subjectId
    );
  }
  
  // Filter by type
  if (params.type) {
    filteredResources = filteredResources.filter(resource => 
      resource.type.toLowerCase() === params.type.toLowerCase()
    );
  }
  
  // Filter by tags
  if (params.tags) {
    const requestedTags = Array.isArray(params.tags) ? params.tags : [params.tags];
    filteredResources = filteredResources.filter(resource => 
      requestedTags.some(tag => resource.tags.includes(tag))
    );
  }
  
  // Search by name or description
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredResources = filteredResources.filter(resource => 
      resource.name.toLowerCase().includes(searchLower) || 
      (resource.description && resource.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Sort by createdAt by default (newest first)
  filteredResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return { data: filteredResources, success: true };
};

/**
 * Fetches a single resource by its ID.
 * @param {string} resourceId - The ID of the resource to fetch.
 * @returns {Promise<Object>} A promise that resolves to the resource object.
 */
export const getResourceById = async (resourceId) => {
  if (!resourceId) {
    throw new Error('Resource ID is required');
  }
  
  if (config.useMockData) {
    return mockGetResourceById(resourceId);
  }

  try {
    const { data } = await apiClient.get(`/resources/${resourceId}`);
    return { data, success: true };
  } catch (error) {
    console.error(`Error fetching resource ${resourceId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch resource' 
    };
  }
};

/**
 * Mock implementation of getResourceById
 * @param {string} resourceId - ID of the resource to retrieve
 * @returns {Promise<Object>} Mock resource data
 */
const mockGetResourceById = async (resourceId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const resource = MOCK_RESOURCES.find(resource => resource.id === resourceId);
  
  if (resource) {
    return { data: resource, success: true };
  }
  
  return { 
    data: null, 
    success: false, 
    error: 'Resource not found' 
  };
};

/**
 * Creates a new resource (e.g., uploads a file and/or its metadata) for a specific subject.
 * @param {object} resourceDetails - Object containing details for the new resource.
 * @param {string} resourceDetails.subjectId - The ID of the subject to associate the resource with.
 * @param {File} resourceDetails.file - The file to be uploaded.
 * @param {string} [resourceDetails.name] - Optional name for the resource, defaults to file.name.
 * @param {string} [resourceDetails.type] - Optional type for the resource, defaults to file.type.
 * @returns {Promise<Object>} A promise that resolves to the created resource object.
 */
export const createResource = async (resourceDetails) => {
  const { subjectId, file, name, type, description, tags } = resourceDetails;

  if (!subjectId) {
    throw new Error("subjectId is required to create a resource.");
  }
  
  if (config.useMockData) {
    return mockCreateResource(resourceDetails);
  }

  if (!file) {
    throw new Error("File is required to create a resource.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name || file.name);
  formData.append('type', type || file.type);
  
  if (description) {
    formData.append('description', description);
  }
  
  if (tags && Array.isArray(tags)) {
    tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });
  }

  try {
    const { data } = await apiClient.post(`/resources?subjectId=${subjectId}`, formData, {
      headers: {
        // Axios typically sets 'Content-Type': 'multipart/form-data' automatically for FormData
      }
    });
    return { data, success: true };
  } catch (error) {
    console.error("Error creating resource:", error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to create resource' 
    };
  }
};

/**
 * Mock implementation of createResource
 * @param {object} resourceDetails - Resource data to create
 * @returns {Promise<Object>} Created mock resource
 */
const mockCreateResource = async (resourceDetails) => {
  const { subjectId, file, name, type, description, tags } = resourceDetails;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Validate required fields
  if (!subjectId) {
    return {
      data: null,
      success: false,
      error: 'Subject ID is required'
    };
  }
  
  // Find subject name (in a real app would fetch this)
  let subjectName = 'Unknown Subject';
  if (subjectId === 'subject-001') {
    subjectName = 'Web Development Fundamentals';
  } else if (subjectId === 'subject-002') {
    subjectName = 'React Fundamentals';
  } else if (subjectId === 'subject-003') {
    subjectName = 'Advanced JavaScript';
  }
  
  // Create mock resource data
  const resourceName = name || (file ? file.name : 'Untitled Resource');
  let resourceType = type || 'PDF';
  
  if (file) {
    // Try to determine type from file MIME type or extension
    if (file.type.includes('video')) {
      resourceType = 'VIDEO';
    } else if (file.type.includes('pdf')) {
      resourceType = 'PDF';
    } else if (file.type.includes('image')) {
      resourceType = 'IMAGE';
    }
  }
  
  // Create a mock resource with reasonable defaults
  const newResource = {
    id: `resource-${Date.now()}`,
    name: resourceName,
    description: description || `Resource for ${subjectName}`,
    type: resourceType,
    url: `https://example.com/resources/${encodeURIComponent(resourceName.replace(/\s+/g, '-').toLowerCase())}`,
    subjectId,
    subjectName,
    uploadedBy: 'mock-pio-001', // Would come from auth context in a real app
    uploadedByName: 'PIO User',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    downloads: 0,
    size: file ? file.size : 1000000, // Default to 1MB if no file provided
    tags: tags || []
  };
  
  // Add to mock data
  MOCK_RESOURCES.push(newResource);
  
  return { data: newResource, success: true };
};

/**
 * Updates an existing resource.
 * @param {string} resourceId - The ID of the resource to update.
 * @param {FormData | object} resourceData - The data to update for the resource.
 * @returns {Promise<Object>} A promise that resolves to the updated resource object.
 */
export const updateResource = async (resourceId, resourceData) => {
  if (!resourceId) {
    throw new Error('Resource ID is required');
  }
  
  if (config.useMockData) {
    return mockUpdateResource(resourceId, resourceData);
  }

  try {
    const { data } = await apiClient.put(`/resources/${resourceId}`, resourceData);
    return { data, success: true };
  } catch (error) {
    console.error(`Error updating resource ${resourceId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to update resource' 
    };
  }
};

/**
 * Mock implementation of updateResource
 * @param {string} resourceId - ID of the resource to update
 * @param {FormData | object} resourceData - Updated resource fields
 * @returns {Promise<Object>} Updated mock resource
 */
const mockUpdateResource = async (resourceId, resourceData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const resourceIndex = MOCK_RESOURCES.findIndex(resource => resource.id === resourceId);
  
  if (resourceIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Resource not found'
    };
  }
  
  // Convert FormData to a regular object if needed
  let updateData = resourceData;
  if (resourceData instanceof FormData) {
    updateData = {};
    for (const [key, value] of resourceData.entries()) {
      updateData[key] = value;
    }
  }
  
  // Update the resource
  const updatedResource = {
    ...MOCK_RESOURCES[resourceIndex],
    ...updateData,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  MOCK_RESOURCES[resourceIndex] = updatedResource;
  
  return { data: updatedResource, success: true };
};

/**
 * Deletes a resource.
 * @param {string} resourceId - The ID of the resource to delete.
 * @returns {Promise<Object>} A promise that resolves to the response data (or handles no content).
 */
export const deleteResource = async (resourceId) => {
  if (!resourceId) {
    throw new Error('Resource ID is required');
  }
  
  if (config.useMockData) {
    return mockDeleteResource(resourceId);
  }

  try {
    await apiClient.delete(`/resources/${resourceId}`);
    return { data: null, success: true, error: null };
  } catch (error) {
    console.error(`Error deleting resource ${resourceId}:`, error.response?.data || error.message);
    return { 
      data: null,
      success: false, 
      error: error.response?.data?.message || 'Failed to delete resource' 
    };
  }
};

/**
 * Mock implementation of deleteResource
 * @param {string} resourceId - ID of the resource to delete
 * @returns {Promise<Object>} Deletion result
 */
const mockDeleteResource = async (resourceId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const resourceIndex = MOCK_RESOURCES.findIndex(resource => resource.id === resourceId);
  
  if (resourceIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Resource not found'
    };
  }
  
  // Remove the resource
  MOCK_RESOURCES.splice(resourceIndex, 1);
  
  return { data: null, success: true, error: null };
};

/**
 * Download a resource and track the download
 * @param {string} resourceId - The ID of the resource to download
 * @returns {Promise<Object>} Download information including URL
 */
export const downloadResource = async (resourceId) => {
  if (!resourceId) {
    throw new Error('Resource ID is required');
  }
  
  if (config.useMockData) {
    return mockDownloadResource(resourceId);
  }

  try {
    const { data } = await apiClient.get(`/resources/${resourceId}/download`);
    
    // In a real app, the API might return a download URL or trigger a file download
    return { data, success: true };
  } catch (error) {
    console.error(`Error downloading resource ${resourceId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to download resource' 
    };
  }
};

/**
 * Mock implementation of downloadResource
 * @param {string} resourceId - ID of the resource to download
 * @returns {Promise<Object>} Mock download information
 */
const mockDownloadResource = async (resourceId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const resourceIndex = MOCK_RESOURCES.findIndex(resource => resource.id === resourceId);
  
  if (resourceIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Resource not found'
    };
  }
  
  // Update download count
  MOCK_RESOURCES[resourceIndex].downloads += 1;
  
  // Return download URL (would be a temporary signed URL in a real app)
  return { 
    data: {
      url: MOCK_RESOURCES[resourceIndex].url,
      filename: MOCK_RESOURCES[resourceIndex].name,
      contentType: MOCK_RESOURCES[resourceIndex].type === 'PDF' ? 'application/pdf' : 
                   MOCK_RESOURCES[resourceIndex].type === 'VIDEO' ? 'video/mp4' : 
                   'application/octet-stream'
    }, 
    success: true 
  };
};

export default {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
}; 