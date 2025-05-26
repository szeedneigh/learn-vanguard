import apiClient from '@/lib/api/client';

// --- Utilities ---
/**
 * Converts a semester display name to a stable slug
 * @param {string} semester - The semester display name (e.g. "1st Semester")
 * @returns {string} The semester slug (e.g. "semester_1")
 */
const getSemesterSlug = (semester) => {
  const semesterNumber = semester.match(/(\d+)/)?.[1] || '1';
  return `semester_${semesterNumber}`;
};

// --- Mock Data ---
const MOCK_PROGRAMS = [
  {
    id: 'act',
    name: 'Associates of Computer Technology',
    years: [
      { year: 1, semesters: ['1st Semester', '2nd Semester'] },
      { year: 2, semesters: ['1st Semester', '2nd Semester'] },
    ],
  },
  {
    id: 'bsis',
    name: 'Bachelor of Science in Information Systems',
    years: [
      { year: 1, semesters: ['1st Semester', '2nd Semester'] },
      { year: 2, semesters: ['1st Semester', '2nd Semester'] },
      { year: 3, semesters: ['1st Semester', '2nd Semester'] },
      { year: 4, semesters: ['1st Semester', '2nd Semester'] },
    ],
  },
];

const MOCK_SUBJECTS = {
  // ACT Subjects
  'act_year1_semester_1': [
    { id: 'act111', name: 'Introduction to Computing', description: 'Fundamentals of IT and basic computer concepts.', programId: 'act', year: 1, semester: '1st Semester' },
    { id: 'act112', name: 'Computer Programming 1', description: 'Basic programming principles using Python.', programId: 'act', year: 1, semester: '1st Semester' },
  ],
  'act_year1_semester_2': [
    { id: 'act121', name: 'Data Structures and Algorithms', description: 'Fundamental data structures.', programId: 'act', year: 1, semester: '2nd Semester' },
  ],
  'act_year2_semester_1': [
    { id: 'act211', name: 'Database Management Systems 1', description: 'Introduction to databases.', programId: 'act', year: 2, semester: '1st Semester' },
  ],
   // BSIS Subjects - Add more as needed
  'bsis_year1_semester_1': [
    { id: 'bsis111', name: 'IT Fundamentals', description: 'Overview of Information Technology.', programId: 'bsis', year: 1, semester: '1st Semester' },
    { id: 'bsis112', name: 'Programming Fundamentals (Flowcharting & Pseudocode)', description: 'Logic formulation and problem-solving techniques.', programId: 'bsis', year: 1, semester: '1st Semester' },
  ],
  'bsis_year1_semester_2': [
    { id: 'bsis121', name: 'Object-Oriented Programming', description: 'OOP concepts using Java or C#.', programId: 'bsis', year: 1, semester: '2nd Semester' },
  ],
};

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// --- Service Functions ---

/**
 * Fetches all programs.
 * Returns mock data if USE_MOCK_DATA is true.
 * @throws {Error} When not using mock data (implementation pending)
 */
export const getPrograms = async () => {
  console.log("programService.js: getPrograms called. USE_MOCK_DATA:", USE_MOCK_DATA);
  if (USE_MOCK_DATA) {
    console.log("programService.js: getPrograms - returning MOCK_PROGRAMS");
    return Promise.resolve(MOCK_PROGRAMS);
  }
  console.log("programService.js: getPrograms - API implementation pending");
  throw new Error("getPrograms API implementation not yet available");
};

/**
 * Fetches subjects for a given program, year, and semester.
 * Returns mock data if USE_MOCK_DATA is true.
 * @param {{ programId: string, year: number, semester: string }} params
 */
export const getSubjects = async ({ programId, year, semester }) => {
  console.log(`programService.js: getSubjects called with programId: ${programId}, year: ${year}, semester: ${semester}. USE_MOCK_DATA: ${USE_MOCK_DATA}`);
  if (USE_MOCK_DATA) {
    const semesterSlug = getSemesterSlug(semester);
    const mockKey = `${programId}_year${year}_${semesterSlug}`;
    const subjects = MOCK_SUBJECTS[mockKey] || [];
    console.log("programService.js: getSubjects - returning MOCK_SUBJECTS for key:", mockKey, subjects);
    return Promise.resolve(subjects); // Simulate async behavior
  }
  console.log("programService.js: getSubjects - attempting to fetch from API");
  try {
    // API: GET /subjects?programId=X&year=Y&semester=Z
    const endpoint = `/subjects?programId=${programId}&year=${year}&semester=${semester}`;
    const { data } = await apiClient.get(endpoint);
    console.log("programService.js: getSubjects - raw data from API:", data);
    const result = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
    console.log("programService.js: getSubjects - processed result:", result);
    return result;
  } catch (error) {
    console.error("programService.js: Error fetching subjects:", error);
    if (error.response) {
      console.error("programService.js: Error response data:", error.response.data);
      console.error("programService.js: Error response status:", error.response.status);
    } else if (error.request) {
      console.error("programService.js: Error request data:", error.request);
    } else {
      console.error("programService.js: Error message:", error.message);
    }
    return []; // Return empty array on error
  }
};

/**
 * Creates a new subject.
 * Returns mock data if USE_MOCK_DATA is true.
 * @param {object} subjectData - The data for the subject to create.
 * @returns {Promise<object>} The created subject object.
 */
export const createSubject = async (subjectData) => {
  console.log("programService.js: createSubject called with:", subjectData, "USE_MOCK_DATA:", USE_MOCK_DATA);
  if (USE_MOCK_DATA) {
    console.log("programService.js: createSubject - MOCK - creating:", subjectData);
    const mockId = `mock_subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMockSubject = { 
      ...subjectData, 
      id: mockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock subjects if the semester exists
    const mockKey = `${subjectData.programId}_year${subjectData.year}_${subjectData.semester}`;
    if (MOCK_SUBJECTS[mockKey]) {
      MOCK_SUBJECTS[mockKey].push(newMockSubject);
    }
    
    return Promise.resolve(newMockSubject);
  }

  try {
    const { data } = await apiClient.post('/subjects', subjectData); // API: POST /subjects
    console.log("programService.js: createSubject - response data:", data);
    return data;
  } catch (error) {
    console.error("programService.js: Error creating subject:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing subject.
 * @param {string} subjectId - The ID of the subject to update.
 * @param {object} subjectData - The data to update.
 * @returns {Promise<object>} The updated subject object.
 */
export const updateSubject = async (subjectId, subjectData) => {
  // if (USE_MOCK_DATA) {
  //   console.log("programService.js: updateSubject - MOCK - pretending to update:", subjectId, subjectData);
  //   // Find and update in a mock list if maintaining state
  //   return Promise.resolve({ id: subjectId, ...subjectData });
  // }
  try {
    const { data } = await apiClient.put(`/subjects/${subjectId}`, subjectData); // API: PUT /subjects/:subjectId
    return data;
  } catch (error) {
    console.error(`Error updating subject ${subjectId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a subject by its ID.
 * Returns mock data if USE_MOCK_DATA is true.
 * @param {string} subjectId - The ID of the subject to delete.
 */
export const deleteSubject = async (subjectId) => {
  console.log("programService.js: deleteSubject called with subjectId:", subjectId, "USE_MOCK_DATA:", USE_MOCK_DATA);
  if (USE_MOCK_DATA) {
    console.log("programService.js: deleteSubject - MOCK - pretending to delete:", subjectId);
    // Simulate finding and "removing" the subject from a mock list if you had one
    // For now, just return a success message.
    return Promise.resolve({ message: `Mock subject ${subjectId} deleted successfully` });
  }
  // When not using mock data, proceed with API call
  try {
    const { data } = await apiClient.delete(`/subjects/${subjectId}`); // API: DELETE /subjects/:subjectId
    console.log("programService.js: deleteSubject - API response data:", data);
    return data;
  } catch (error) {
    console.error(`programService.js: Error deleting subject ${subjectId} from API:`, error.response?.data || error.message);
    throw error;
  }
}; 