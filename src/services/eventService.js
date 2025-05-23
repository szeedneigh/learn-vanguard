import apiClient, { createCancelableRequest } from '@/lib/api/client';

/**
 * Environment configuration
 */
const config = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

/**
 * Mock event data for development
 */
const MOCK_EVENTS = [
  {
    id: 'event-001',
    title: 'JavaScript Workshop',
    description: 'Introduction to modern JavaScript features and best practices',
    location: 'Online - Zoom Meeting',
    startDate: '2023-12-10T10:00:00',
    endDate: '2023-12-10T12:00:00',
    allDay: false,
    organizerId: 'mock-pio-001',
    organizerName: 'PIO User',
    attendees: [
      { id: 'mock-student-001', name: 'Student User', role: 'STUDENT', status: 'CONFIRMED' }
    ],
    createdAt: '2023-11-01',
    updatedAt: '2023-11-01',
    isPublic: true,
    category: 'WORKSHOP'
  },
  {
    id: 'event-002',
    title: 'React Fundamentals Course',
    description: 'Five-day intensive course covering React fundamentals',
    location: 'Room 101, Main Building',
    startDate: '2023-12-15T09:00:00',
    endDate: '2023-12-19T16:00:00',
    allDay: false,
    organizerId: 'mock-pio-001',
    organizerName: 'PIO User',
    attendees: [
      { id: 'mock-student-001', name: 'Student User', role: 'STUDENT', status: 'CONFIRMED' }
    ],
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05',
    isPublic: true,
    category: 'COURSE'
  },
  {
    id: 'event-003',
    title: 'End of Year Celebration',
    description: 'Celebrating the achievements of the year',
    location: 'Main Hall',
    startDate: '2023-12-23T18:00:00',
    endDate: '2023-12-23T22:00:00',
    allDay: false,
    organizerId: 'mock-admin-001',
    organizerName: 'Admin User',
    attendees: [
      { id: 'mock-pio-001', name: 'PIO User', role: 'PIO', status: 'CONFIRMED' },
      { id: 'mock-student-001', name: 'Student User', role: 'STUDENT', status: 'CONFIRMED' }
    ],
    createdAt: '2023-11-10',
    updatedAt: '2023-11-10',
    isPublic: true,
    category: 'SOCIAL'
  },
  {
    id: 'event-004',
    title: 'Staff Planning Meeting',
    description: 'Q1 planning and strategy session',
    location: 'Conference Room A',
    startDate: '2024-01-05T09:00:00',
    endDate: '2024-01-05T16:00:00',
    allDay: true,
    organizerId: 'mock-admin-001',
    organizerName: 'Admin User',
    attendees: [
      { id: 'mock-pio-001', name: 'PIO User', role: 'PIO', status: 'PENDING' }
    ],
    createdAt: '2023-11-15',
    updatedAt: '2023-11-15',
    isPublic: false,
    category: 'MEETING'
  },
  {
    id: 'event-005',
    title: 'Student Projects Showcase',
    description: 'Students present their final projects',
    location: 'Exhibition Hall',
    startDate: '2024-01-20T10:00:00',
    endDate: '2024-01-20T15:00:00',
    allDay: false,
    organizerId: 'mock-pio-001',
    organizerName: 'PIO User',
    attendees: [
      { id: 'mock-admin-001', name: 'Admin User', role: 'ADMIN', status: 'CONFIRMED' },
      { id: 'mock-student-001', name: 'Student User', role: 'STUDENT', status: 'CONFIRMED' }
    ],
    createdAt: '2023-11-20',
    updatedAt: '2023-11-20',
    isPublic: true,
    category: 'SHOWCASE'
  }
];

/**
 * Get events based on provided filters and date range
 * @param {Object} params - Query parameters for filtering events
 * @returns {Promise<Object>} List of events
 */
export const getEvents = async (params = {}) => {
  if (config.useMockData) {
    return mockGetEvents(params);
  }

  try {
    const { data } = await apiClient.get('/events', { params });
    return { data, success: true };
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message);
    return { 
      data: [], 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch events' 
    };
  }
};

/**
 * Mock implementation of getEvents
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Mock event list
 */
const mockGetEvents = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let filteredEvents = [...MOCK_EVENTS];
  
  // Apply date range filters if provided
  if (params.startDate && params.endDate) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    
    filteredEvents = filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Event starts before filter end and ends after filter start
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }
  
  // Filter by organizer
  if (params.organizerId) {
    filteredEvents = filteredEvents.filter(event => 
      event.organizerId === params.organizerId
    );
  }
  
  // Filter by category
  if (params.category) {
    filteredEvents = filteredEvents.filter(event => 
      event.category === params.category
    );
  }
  
  // Filter by visibility
  if (params.isPublic !== undefined) {
    filteredEvents = filteredEvents.filter(event => 
      event.isPublic === params.isPublic
    );
  }
  
  // Search by title or description
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredEvents = filteredEvents.filter(event => 
      event.title.toLowerCase().includes(searchLower) || 
      (event.description && event.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Sort by start date
  filteredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  return { data: filteredEvents, success: true };
};

/**
 * Get a specific event by ID
 * @param {string} eventId - ID of the event to retrieve
 * @returns {Promise<Object>} Event data
 */
export const getEventById = async (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  
  if (config.useMockData) {
    return mockGetEventById(eventId);
  }

  try {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return { data, success: true };
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch event' 
    };
  }
};

/**
 * Mock implementation of getEventById
 * @param {string} eventId - ID of the event to retrieve
 * @returns {Promise<Object>} Mock event data
 */
const mockGetEventById = async (eventId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const event = MOCK_EVENTS.find(event => event.id === eventId);
  
  if (event) {
    return { data: event, success: true };
  }
  
  return { 
    data: null, 
    success: false, 
    error: 'Event not found' 
  };
};

/**
 * Create a new event
 * @param {Object} eventData - New event details
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData) => {
  if (config.useMockData) {
    return mockCreateEvent(eventData);
  }

  try {
    const { data } = await apiClient.post('/events', eventData);
    return { data, success: true };
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to create event' 
    };
  }
};

/**
 * Mock implementation of createEvent
 * @param {Object} eventData - Event data to create
 * @returns {Promise<Object>} Created mock event
 */
const mockCreateEvent = async (eventData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validate required fields
  if (!eventData.title || !eventData.startDate || !eventData.endDate || !eventData.organizerId) {
    return {
      data: null,
      success: false,
      error: 'Title, start date, end date, and organizer are required fields'
    };
  }
  
  const newEvent = {
    id: `event-${Date.now()}`,
    ...eventData,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    attendees: eventData.attendees || []
  };
  
  // Add to mock data
  MOCK_EVENTS.push(newEvent);
  
  return { data: newEvent, success: true };
};

/**
 * Update an existing event
 * @param {string} eventId - ID of the event to update
 * @param {Object} eventData - Updated event fields
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventId, eventData) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  
  if (config.useMockData) {
    return mockUpdateEvent(eventId, eventData);
  }

  try {
    const { data } = await apiClient.put(`/events/${eventId}`, eventData);
    return { data, success: true };
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to update event' 
    };
  }
};

/**
 * Mock implementation of updateEvent
 * @param {string} eventId - ID of the event to update
 * @param {Object} eventData - Updated event fields
 * @returns {Promise<Object>} Updated mock event
 */
const mockUpdateEvent = async (eventId, eventData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Event not found'
    };
  }
  
  // Update the event
  const updatedEvent = {
    ...MOCK_EVENTS[eventIndex],
    ...eventData,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  MOCK_EVENTS[eventIndex] = updatedEvent;
  
  return { data: updatedEvent, success: true };
};

/**
 * Delete an event
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteEvent = async (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  
  if (config.useMockData) {
    return mockDeleteEvent(eventId);
  }

  try {
    await apiClient.delete(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete event' 
    };
  }
};

/**
 * Mock implementation of deleteEvent
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<Object>} Deletion result
 */
const mockDeleteEvent = async (eventId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    return {
      success: false,
      error: 'Event not found'
    };
  }
  
  // Remove the event
  MOCK_EVENTS.splice(eventIndex, 1);
  
  return { success: true };
};

/**
 * Manage event attendance (join, leave, change status)
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the user
 * @param {string} status - Attendance status (CONFIRMED, DECLINED, PENDING)
 * @returns {Promise<Object>} Updated event with attendance info
 */
export const updateAttendance = async (eventId, userId, status) => {
  if (!eventId || !userId || !status) {
    throw new Error('Event ID, user ID, and status are required');
  }
  
  if (config.useMockData) {
    return mockUpdateAttendance(eventId, userId, status);
  }

  try {
    const { data } = await apiClient.put(`/events/${eventId}/attendance`, {
      userId,
      status
    });
    return { data, success: true };
  } catch (error) {
    console.error(`Error updating attendance for event ${eventId}:`, error.response?.data || error.message);
    return { 
      data: null, 
      success: false, 
      error: error.response?.data?.message || 'Failed to update attendance' 
    };
  }
};

/**
 * Mock implementation of updateAttendance
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the user
 * @param {string} status - Attendance status
 * @returns {Promise<Object>} Updated mock event
 */
const mockUpdateAttendance = async (eventId, userId, status) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    return {
      data: null,
      success: false,
      error: 'Event not found'
    };
  }
  
  const event = {...MOCK_EVENTS[eventIndex]};
  const attendeeIndex = event.attendees.findIndex(a => a.id === userId);
  
  if (attendeeIndex !== -1) {
    // Update existing attendee
    event.attendees[attendeeIndex].status = status;
  } else {
    // Add new attendee (in a real app, would need to fetch user details)
    let userName = 'Unknown User';
    let userRole = 'STUDENT';
    
    if (userId === 'mock-admin-001') {
      userName = 'Admin User';
      userRole = 'ADMIN';
    } else if (userId === 'mock-pio-001') {
      userName = 'PIO User';
      userRole = 'PIO';
    } else if (userId === 'mock-student-001') {
      userName = 'Student User';
      userRole = 'STUDENT';
    }
    
    event.attendees.push({
      id: userId,
      name: userName,
      role: userRole,
      status
    });
  }
  
  event.updatedAt = new Date().toISOString().split('T')[0];
  MOCK_EVENTS[eventIndex] = event;
  
  return { data: event, success: true };
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateAttendance
}; 