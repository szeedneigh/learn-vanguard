import * as programApi from "@/lib/api/programApi";

// Default setting for mock data - usually false in production
// Change this to true only for development when backend is unavailable
const USE_MOCK_DATA = false;

// --- Mock Data (Fallback only) ---
const MOCK_PROGRAMS = [
  {
    id: "act",
    name: "Associates in Computer Technology",
    years: [
      { year: 1, semesters: ["1st Semester", "2nd Semester"] },
      { year: 2, semesters: ["1st Semester", "2nd Semester"] },
    ],
  },
  {
    id: "bsis",
    name: "Bachelor of Science in Information Systems",
    years: [
      { year: 1, semesters: ["1st Semester", "2nd Semester"] },
      { year: 2, semesters: ["1st Semester", "2nd Semester"] },
      { year: 3, semesters: ["1st Semester", "2nd Semester"] },
      { year: 4, semesters: ["1st Semester", "2nd Semester"] },
    ],
  },
];

const MOCK_SUBJECTS = {
  // ACT Subjects
  act_year1_semester_1: [
    {
      id: "act111",
      name: "Introduction to Computing",
      description: "Fundamentals of IT and basic computer concepts.",
      programId: "act",
      year: 1,
      semester: "1st Semester",
    },
    {
      id: "act112",
      name: "Computer Programming 1",
      description: "Basic programming principles using Python.",
      programId: "act",
      year: 1,
      semester: "1st Semester",
    },
  ],
  act_year1_semester_2: [
    {
      id: "act121",
      name: "Data Structures and Algorithms",
      description: "Fundamental data structures.",
      programId: "act",
      year: 1,
      semester: "2nd Semester",
    },
  ],
  act_year2_semester_1: [
    {
      id: "act211",
      name: "Database Management Systems 1",
      description: "Introduction to databases.",
      programId: "act",
      year: 2,
      semester: "1st Semester",
    },
  ],
  // BSIS Subjects - Add more as needed
  bsis_year1_semester_1: [
    {
      id: "bsis111",
      name: "IT Fundamentals",
      description: "Overview of Information Technology.",
      programId: "bsis",
      year: 1,
      semester: "1st Semester",
    },
    {
      id: "bsis112",
      name: "Programming Fundamentals (Flowcharting & Pseudocode)",
      description: "Logic formulation and problem-solving techniques.",
      programId: "bsis",
      year: 1,
      semester: "1st Semester",
    },
  ],
  bsis_year1_semester_2: [
    {
      id: "bsis121",
      name: "Object-Oriented Programming",
      description: "OOP concepts using Java or C#.",
      programId: "bsis",
      year: 1,
      semester: "2nd Semester",
    },
  ],
};

// Mock data helper functions
const getMockSubjects = (programId, year, semester) => {
  const key = `${programId}_year${year}_${
    semester === "1st Semester" ? "semester_1" : "semester_2"
  }`;
  return MOCK_SUBJECTS[key] || [];
};

// Convert semester name to slug for mock data
const getSemesterSlug = (semesterName) => {
  return semesterName === "1st Semester" ? "semester_1" : "semester_2";
};

// --- Service Functions ---

/**
 * Fetches all available programs.
 * Uses backend API with fallback to mock data if API fails.
 */
export const getPrograms = async () => {
  console.log(
    "programService.js: getPrograms called. USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  if (USE_MOCK_DATA) {
    console.log("programService.js: getPrograms - returning MOCK_PROGRAMS");
    return Promise.resolve(MOCK_PROGRAMS);
  }

  try {
    console.log(
      "programService.js: getPrograms - attempting to fetch from API"
    );
    const result = await programApi.getPrograms();

    if (result.success) {
      console.log("programService.js: getPrograms - API success:", result.data);
      return result.data;
    } else {
      console.warn(
        "programService.js: getPrograms - API returned error, using fallback:",
        result.error
      );
      return MOCK_PROGRAMS;
    }
  } catch (error) {
    console.error(
      "programService.js: getPrograms - API call failed, using fallback:",
      error
    );
    return MOCK_PROGRAMS;
  }
};

/**
 * Fetches subjects for a given program, year, and semester.
 * Uses backend API with fallback to mock data if API fails.
 */
export const getSubjects = async ({ programId, year, semester }) => {
  console.log(
    `programService.js: getSubjects called with programId: ${programId}, year: ${year}, semester: ${semester}. USE_MOCK_DATA: ${USE_MOCK_DATA}`
  );

  if (USE_MOCK_DATA) {
    const subjects = getMockSubjects(programId, year, semester);
    console.log(
      "programService.js: getSubjects - returning MOCK_SUBJECTS:",
      subjects
    );
    return Promise.resolve(subjects);
  }

  try {
    console.log(
      "programService.js: getSubjects - attempting to fetch from API"
    );
    const result = await programApi.getSubjects({ programId, year, semester });

    if (result.success) {
      console.log("programService.js: getSubjects - API success:", result.data);
      return result.data;
    } else {
      console.warn(
        "programService.js: getSubjects - API returned error, using fallback:",
        result.error
      );
      return getMockSubjects(programId, year, semester);
    }
  } catch (error) {
    console.error(
      "programService.js: getSubjects - API call failed, using fallback:",
      error
    );
    return getMockSubjects(programId, year, semester);
  }
};

/**
 * Creates a new subject.
 * Uses backend API with fallback to mock behavior if API fails.
 */
export const createSubject = async (subjectData) => {
  console.log(
    "programService.js: createSubject called with:",
    subjectData,
    "USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  if (USE_MOCK_DATA) {
    console.log(
      "programService.js: createSubject - MOCK - creating:",
      subjectData
    );
    const mockId = `mock_subject_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newMockSubject = {
      ...subjectData,
      id: mockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve(newMockSubject);
  }

  try {
    console.log(
      "programService.js: createSubject - attempting to create via API"
    );
    const result = await programApi.createSubject(subjectData);

    if (result.success) {
      console.log(
        "programService.js: createSubject - API success:",
        result.data
      );
      return result.data;
    } else {
      console.error(
        "programService.js: createSubject - API returned error:",
        result.error
      );
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
  console.log(
    "programService.js: updateSubject called with:",
    subjectId,
    subjectData
  );

  if (USE_MOCK_DATA) {
    console.log(
      "programService.js: updateSubject - MOCK - pretending to update:",
      subjectId,
      subjectData
    );
    return Promise.resolve({ id: subjectId, ...subjectData });
  }

  try {
    const result = await programApi.updateSubject(subjectId, subjectData);

    if (result.success) {
      console.log(
        "programService.js: updateSubject - API success:",
        result.data
      );
      return result.data;
    } else {
      console.error(
        "programService.js: updateSubject - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("programService.js: updateSubject - API call failed:", error);
    throw error;
  }
};

/**
 * Deletes a subject by ID.
 * Uses backend API with fallback to mock behavior if API fails.
 */
export const deleteSubject = async ({
  subjectId,
  programId,
  yearName,
  semesterName,
}) => {
  console.log(
    "programService.js: deleteSubject called with:",
    { subjectId, programId, yearName, semesterName },
    "USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  // Extract the actual ID if subjectId is an object
  const actualSubjectId =
    subjectId && typeof subjectId === "object"
      ? subjectId.id || subjectId._id
      : subjectId;

  if (USE_MOCK_DATA) {
    console.log(
      "programService.js: deleteSubject - MOCK - deleting:",
      actualSubjectId
    );
    return Promise.resolve({
      success: true,
      message: "Subject deleted successfully",
    });
  }

  try {
    console.log(
      "programService.js: deleteSubject - attempting to delete via API"
    );
    const result = await programApi.deleteSubject(actualSubjectId);

    if (result.success) {
      console.log(
        "programService.js: deleteSubject - API success:",
        result.message
      );
      return { success: true, message: result.message };
    } else {
      console.error(
        "programService.js: deleteSubject - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("programService.js: deleteSubject - API call failed:", error);
    throw error;
  }
};

/**
 * Creates an announcement for a subject.
 * Takes subjectId and announcement content.
 */
export const createAnnouncement = async (subjectId, announcementData) => {
  console.log(
    "programService.js: createAnnouncement called with:",
    { subjectId, announcementData },
    "USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  if (USE_MOCK_DATA) {
    console.log(
      "programService.js: createAnnouncement - MOCK - creating announcement"
    );
    const mockId = `mock_announcement_${Date.now()}`;
    const mockAnnouncement = {
      id: mockId,
      ...announcementData,
      subjectId,
      createdAt: new Date().toISOString(),
    };

    return Promise.resolve(mockAnnouncement);
  }

  try {
    console.log(
      "programService.js: createAnnouncement - attempting to create via API"
    );
    const result = await programApi.createSubjectAnnouncement(
      subjectId,
      announcementData
    );

    if (result.success) {
      console.log(
        "programService.js: createAnnouncement - API success:",
        result.data
      );
      return result.data;
    } else {
      console.error(
        "programService.js: createAnnouncement - API returned error:",
        result.error
      );
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(
      "programService.js: createAnnouncement - API call failed:",
      error
    );
    throw error;
  }
};
