import * as programApi from '@/lib/api/programApi';

// --- Mock Data (Fallback only) ---
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

// --- Helper Functions ---
const getSemesterSlug = (semester) => {
  if (!semester) return 'semester_unknown';
  return semester.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const getMockSubjects = (programId, year, semester) => {
  const semesterSlug = getSemesterSlug(semester);
  const mockKey = `${programId}_year${year}_${semesterSlug}`;
  return MOCK_SUBJECTS[mockKey] || [];
};

// --- Service Functions ---

/**
 * Fetches all programs.
 * Uses backend API with fallback to mock data if API fails.
 */
export const getPrograms = async () => {
  console.log("programService.js: getPrograms called. USE_MOCK_DATA:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    console.log("programService.js: getPrograms - returning MOCK_PROGRAMS");
    return Promise.resolve(MOCK_PROGRAMS);
  }

  try {
    console.log("programService.js: getPrograms - attempting to fetch from API");
    const result = await programApi.getPrograms();
    
    if (result.success) {
      console.log("programService.js: getPrograms - API success:", result.data);
      return result.data;
    } else {
      console.warn("programService.js: getPrograms - API returned error, using fallback:", result.error);
      return MOCK_PROGRAMS;
    }
  } catch (error) {
    console.error("programService.js: getPrograms - API call failed, using fallback:", error);
    return MOCK_PROGRAMS;
  }
};

/**
 * Fetches subjects for a given program, year, and semester.
 * Uses backend API with fallback to mock data if API fails.
 */
export const getSubjects = async ({ programId, year, semester }) => {
  console.log(`programService.js: getSubjects called with programId: ${programId}, year: ${year}, semester: ${semester}. USE_MOCK_DATA: ${USE_MOCK_DATA}`);
  
  if (USE_MOCK_DATA) {
    const subjects = getMockSubjects(programId, year, semester);
    console.log("programService.js: getSubjects - returning MOCK_SUBJECTS:", subjects);
    return Promise.resolve(subjects);
  }

  try {
    console.log("programService.js: getSubjects - attempting to fetch from API");
    const result = await programApi.getSubjects({ programId, year, semester });
    
    if (result.success) {
      console.log("programService.js: getSubjects - API success:", result.data);
      return result.data;
    } else {
      console.warn("programService.js: getSubjects - API returned error, using fallback:", result.error);
      return getMockSubjects(programId, year, semester);
    }
  } catch (error) {
    console.error("programService.js: getSubjects - API call failed, using fallback:", error);
    return getMockSubjects(programId, year, semester);
  }
};

/**
 * Creates a new subject.
 * Uses backend API with fallback to mock behavior if API fails.
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
    const mockKey = `${subjectData.programId}_year${subjectData.yearName}_${getSemesterSlug(subjectData.semesterName)}`;
    if (MOCK_SUBJECTS[mockKey]) {
      MOCK_SUBJECTS[mockKey].push(newMockSubject);
    }
    
    return Promise.resolve(newMockSubject);
  }

  try {
    console.log("programService.js: createSubject - attempting to create via API");
    const result = await programApi.createSubject(subjectData);
    
    if (result.success) {
      console.log("programService.js: createSubject - API success:", result.data);
      return result.data;
    } else {
      console.error("programService.js: createSubject - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("programService.js: createSubject - API call failed:", error);
    throw error;
  }
};

/**
 * Updates an existing subject.
 */
export const updateSubject = async (subjectId, subjectData) => {
  console.log("programService.js: updateSubject called with:", subjectId, subjectData);
  
  if (USE_MOCK_DATA) {
    console.log("programService.js: updateSubject - MOCK - pretending to update:", subjectId, subjectData);
    return Promise.resolve({ id: subjectId, ...subjectData });
  }

  try {
    const result = await programApi.updateSubject(subjectId, subjectData);
    
    if (result.success) {
      console.log("programService.js: updateSubject - API success:", result.data);
      return result.data;
    } else {
      console.error("programService.js: updateSubject - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("programService.js: updateSubject - API call failed:", error);
    throw error;
  }
};

/**
 * Deletes a subject by its ID.
 */
export const deleteSubject = async (subjectId) => {
  console.log("programService.js: deleteSubject called with subjectId:", subjectId, "USE_MOCK_DATA:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    console.log("programService.js: deleteSubject - MOCK - pretending to delete:", subjectId);
    return Promise.resolve({ message: `Mock subject ${subjectId} deleted successfully` });
  }

  try {
    console.log("programService.js: deleteSubject - attempting to delete via API");
    const result = await programApi.deleteSubject(subjectId);
    
    if (result.success) {
      console.log("programService.js: deleteSubject - API success:", result.message);
      return { message: result.message };
    } else {
      console.error("programService.js: deleteSubject - API returned error:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("programService.js: deleteSubject - API call failed:", error);
    throw error;
  }
}; 