import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, MoreHorizontal, Plus, ChevronRight } from "lucide-react"; // Added ChevronDown
// Assuming shadcn/ui components are correctly set up in '@/components/ui/'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel, // Added for clarity
  DropdownMenuSeparator, // Added for visual separation
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Placeholder for a notification system (e.g., shadcn/ui Sonner or react-toastify)
// import { useToast } from "@/components/ui/use-toast"; // Example import
import { useAuth } from "@/context/AuthContext";
import { assignPIORole, revertPIORole } from "@/lib/api/userApi";
import { useToast } from "@/hooks/use-toast";

// --- Mock Data and API Functions ---
// Replace these with actual API calls and data fetching logic

// Available programs
const programsData = [
  { id: "bsis", name: "Bachelor of Science in Information Systems", years: 4 },
  { id: "act", name: "Associate in Computer Technology", years: 2 },
];

// Example student data (represents students already in the selected class/year)
const initialStudentsData = [
  {
    id: "21-00001CJ",
    _id: "60d0fe4f5311236168a109ca", // Added MongoDB-style _id
    name: "John Chen",
    email: "johnchen@student.lxverdad",
    gender: "male",
    role: null,
    programId: "bsis",
    year: 1,
  },
  {
    id: "21-00002DB",
    _id: "60d0fe4f5311236168a109cb", // Added MongoDB-style _id
    name: "Barbie Dela Cruz",
    email: "barbiedelacruz@student.lxverdad",
    gender: "female",
    role: "pio",
    programId: "bsis",
    year: 1,
  },
  {
    id: "21-00003FL",
    _id: "60d0fe4f5311236168a109cc", // Added MongoDB-style _id
    name: "Luca Ferrari",
    email: "lucaferrari@student.lxverdad",
    gender: "male",
    role: null,
    programId: "bsis",
    year: 1,
  },
  {
    id: "21-00004KA",
    _id: "60d0fe4f5311236168a109cd", // Added MongoDB-style _id
    name: "Aisha Khan",
    email: "aishakhan@student.lxverdad",
    gender: "female",
    role: null,
    programId: "bsis",
    year: 1,
  },
  {
    id: "21-00005MS",
    _id: "60d0fe4f5311236168a109ce", // Added MongoDB-style _id
    name: "Sofia Martinez",
    email: "sofiamartinez@student.lxverdad",
    gender: "female",
    role: null,
    programId: "bsis",
    year: 1,
  },
  {
    id: "21-00006ML",
    _id: "60d0fe4f5311236168a109cf", // Added MongoDB-style _id
    name: "Liam Muller",
    email: "liammuller@student.lxverdad",
    gender: "male",
    role: null,
    programId: "bsis",
    year: 1,
  },
  // Add more students for different programs/years if needed for testing
  {
    id: "22-10001AB",
    _id: "60d0fe4f5311236168a109d0", // Added MongoDB-style _id
    name: "Anna Bell",
    email: "annabell@student.lxverdad",
    gender: "female",
    role: null,
    programId: "act",
    year: 1,
  },
  {
    id: "22-10002CD",
    _id: "60d0fe4f5311236168a109d1", // Added MongoDB-style _id
    name: "Carl Davis",
    email: "carldavis@student.lxverdad",
    gender: "male",
    role: null,
    programId: "act",
    year: 1,
  },
];

// Mock function to fetch students for a specific program and year
const fetchStudentsAPI = async (programId, year) => {
  console.log(
    `API CALL: Fetching students for program ${programId}, year ${year}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, filter data based on programId and year from the API
  const filteredStudents = initialStudentsData.filter(
    (s) => s.programId === programId && s.year === parseInt(year)
  );
  // Simulate API success
  return filteredStudents;
  // Simulate API error:
  // throw new Error("Failed to fetch students");
};

// Mock function to search for students NOT YET in the current class/year (for adding)
const searchAvailableStudentsAPI = async (query) => {
  console.log(`API CALL: Searching available students with query: ${query}`);
  if (!query.trim()) {
    return [];
  }
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
  // This should search a broader database of students
  const mockResults = [
    {
      id: "22-00007RT",
      name: "Ryan Thompson",
      email: "ryanthompson@student.lxverdad",
      gender: "male",
    },
    {
      id: "22-00008EJ",
      name: "Emma Johnson",
      email: "emmajohnson@student.lxverdad",
      gender: "female",
    },
    {
      id: "22-00009AK",
      name: "Alex Kim",
      email: "alexkim@student.lxverdad",
      gender: "male",
    },
    {
      id: "23-00010BC",
      name: "Ben Carter",
      email: "bencarter@student.lxverdad",
      gender: "male",
    },
    // Ensure mock results don't include students already in the initial list for clarity
  ].filter(
    (s) =>
      // Filter out students already in the class
      (s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.id.toLowerCase().includes(query.toLowerCase())) &&
      !initialStudentsData.some((is) => is.id === s.id) &&
      // Filter out student IDs that start with "00-"
      !s.id.startsWith("00-")
  );
  // Simulate API success
  return mockResults;
  // Simulate API error:
  // throw new Error("Search failed");
};

// Mock function to add a student to a class/year
const addStudentAPI = async (studentId, programId, year) => {
  console.log(
    `API CALL: Adding student ${studentId} to program ${programId}, year ${year}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, the backend would handle this.
  // For the frontend simulation, we'll add the student to our local state upon success.
  // Simulate API success
  return { success: true };
  // Simulate API error:
  // throw new Error("Failed to add student");
};

// Mock function to assign PIO role - Replace with actual API call
const assignRoleAPI = async (studentId, role, assignedClass) => {
  try {
    console.log(
      `API CALL: Assigning role ${role} to student ${studentId} with class ${assignedClass}`
    );

    // Use the actual API function with proper ID handling
    // The backend expects MongoDB ObjectId, but our mock data might have custom IDs
    // In a real app, you'd use the _id property from the MongoDB document
    const userId = studentId._id || studentId;

    const result = await assignPIORole(userId, assignedClass);

    if (!result.success) {
      throw new Error(result.error || "Failed to assign role");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in assignRoleAPI:", error);
    throw error;
  }
};

// Mock function to revert PIO to student role - Replace with actual API call
const revertToStudentAPI = async (studentId) => {
  try {
    console.log(`API CALL: Reverting student ${studentId} to student role`);

    // Use the actual API function with proper ID handling
    // The backend expects MongoDB ObjectId, but our mock data might have custom IDs
    const userId = studentId._id || studentId;

    const result = await revertPIORole(userId);

    if (!result.success) {
      throw new Error(result.error || "Failed to revert role");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in revertToStudentAPI:", error);
    throw error;
  }
};

// Mock function to remove a student from a class/year
const removeStudentAPI = async (studentId, programId, year) => {
  console.log(
    `API CALL: Removing student ${studentId} from program ${programId}, year ${year}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  // Simulate API success
  return { success: true };
  // Simulate API error:
  // throw new Error("Failed to remove student");
};

// --- Component ---

const Users = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState(""); // For filtering the main student list
  const [filterOption, setFilterOption] = useState("all"); // 'all', 'pio', 'student'
  const [programs] = useState(programsData); // Could be fetched from API
  const [selectedProgramId, setSelectedProgramId] = useState(
    programsData[0].id
  ); // Default to first program
  const [selectedYear, setSelectedYear] = useState("1"); // Default to year 1

  const [students, setStudents] = useState([]); // Students currently displayed for the selected program/year
  const [isLoading, setIsLoading] = useState(false); // For loading indicators (main page data)
  const [isActionLoading, setIsActionLoading] = useState(false); // Separate loading state for modal actions (add, assign, remove)
  const [error, setError] = useState(null); // For displaying errors

  // Get current user role from auth context
  const { user, hasRole } = useAuth();

  // Direct check for admin role
  const userRole = user?.role?.toLowerCase();

  // Simplified isAdmin check - directly use hasRole function and check role string
  const isAdmin = useMemo(() => {
    return userRole === "admin" || hasRole("admin");
  }, [userRole, hasRole]);

  // Debug log to verify admin status
  useEffect(() => {
    console.log("Is admin:", isAdmin, "User:", user);
  }, [isAdmin, user]);

  // Debug log for user and students data
  useEffect(() => {
    console.log("Current user data:", user);
    console.log("Is admin:", isAdmin);
    console.log("Students data:", students);
    console.log("Filtered students:", sortedAndFilteredStudents);
  }, [user, isAdmin, students, sortedAndFilteredStudents]);

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState(""); // Search query inside the modal
  const [addStudentSearchResults, setAddStudentSearchResults] = useState([]); // Results for the modal search
  const [studentToAdd, setStudentToAdd] = useState(null); // Student selected from search results
  const [isSearchingStudents, setIsSearchingStudents] = useState(false); // Loading state for modal search

  // Assign Role Modal State
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [studentToAssignRole, setStudentToAssignRole] = useState(null);

  // Remove Student Modal State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Add toast
  const { toast } = useToast();

  // --- Derived State ---
  const currentProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];

  // --- Effects ---

  // Fetch students when program or year changes
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true); // Use main loading state for fetching list data
      setError(null); // Clear previous errors
      try {
        const data = await fetchStudentsAPI(selectedProgramId, selectedYear);
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
        // toast({ title: "Error", description: "Failed to load students.", variant: "destructive" }); // Example toast
        setStudents([]); // Clear students on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedProgramId, selectedYear]); // Dependencies: selectedProgramId, selectedYear

  // Debounced search for the "Add Student" modal
  useEffect(() => {
    // Don't search if the query is empty or a student is already selected
    if (!addStudentSearchQuery.trim() || studentToAdd) {
      setAddStudentSearchResults([]);
      setIsSearchingStudents(false); // Ensure loading state is off
      return;
    }

    setIsSearchingStudents(true);
    const debounceTimeout = setTimeout(async () => {
      try {
        const results = await searchAvailableStudentsAPI(addStudentSearchQuery);
        // Ensure we only update results if the query hasn't changed while fetching
        setAddStudentSearchResults(results);
      } catch (err) {
        console.error("Error searching students:", err);
        // Handle search error in UI if needed (e.g., show a message)
        setAddStudentSearchResults([]); // Clear results on error
      } finally {
        // Check if the query is still the same before setting loading to false
        // This prevents flickering if the user types quickly
        setIsSearchingStudents(false);
      }
    }, 300); // 300ms debounce

    // Cleanup function to clear timeout if query changes quickly or component unmounts
    return () => clearTimeout(debounceTimeout);
  }, [addStudentSearchQuery, studentToAdd]); // Dependencies: addStudentSearchQuery, studentToAdd

  // --- Event Handlers ---

  // Handles selecting a program (from breadcrumb dropdown)
  const handleProgramChange = (programId) => {
    if (programId !== selectedProgramId) {
      setSelectedProgramId(programId);
      setSelectedYear("1"); // Reset to year 1 when changing programs
      setSearchQuery(""); // Clear search when changing context
      setFilterOption("all"); // Reset filter
    }
  };

  // Handles selecting a year tab
  const handleYearChange = (year) => {
    if (year !== selectedYear) {
      setSelectedYear(year);
      setSearchQuery(""); // Clear search
      setFilterOption("all"); // Reset filter
    }
  };

  // Filter and sort students for display
  const getFilteredAndSortedStudents = useCallback(() => {
    // Filter by search query (main list) and exclude admin users
    const queryFiltered = students.filter((student) => {
      // First check if student is an admin (using role or normalizedRole)
      const studentRole = (student.role || "").toLowerCase();
      const isStudentAdmin =
        studentRole === "admin" ||
        (student.normalizedRole &&
          student.normalizedRole.toLowerCase() === "admin");

      // Check if student ID starts with "00-"
      const hasReservedId = student.id && student.id.startsWith("00-");

      // Exclude admins, reserved IDs, and apply search filter
      return (
        !isStudentAdmin &&
        !hasReservedId &&
        (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // Filter by role
    let roleFiltered;
    if (filterOption === "pio") {
      roleFiltered = queryFiltered.filter((student) => {
        const studentRole = (student.role || "").toLowerCase();
        return (
          studentRole === "pio" ||
          (student.normalizedRole &&
            student.normalizedRole.toLowerCase() === "pio")
        );
      });
    } else if (filterOption === "student") {
      roleFiltered = queryFiltered.filter((student) => {
        const studentRole = (student.role || "").toLowerCase();
        return (
          !student.role ||
          studentRole === "student" ||
          (student.normalizedRole &&
            student.normalizedRole.toLowerCase() === "student")
        );
      });
    } else {
      roleFiltered = queryFiltered;
    }

    // Sort alphabetically by name
    return [...roleFiltered].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery, filterOption]); // Dependencies for memoization

  const sortedAndFilteredStudents = getFilteredAndSortedStudents();

  // Open Modals
  const openAssignRoleModal = (student) => {
    setStudentToAssignRole(student);
    setShowAssignRoleModal(true);
  };

  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const openAddStudentModal = () => {
    setShowAddModal(true);
    // Reset modal state when opening
    setAddStudentSearchQuery("");
    setAddStudentSearchResults([]);
    setStudentToAdd(null);
  };

  // Close Modals and Reset State
  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset state on close
    setAddStudentSearchQuery("");
    setAddStudentSearchResults([]);
    setStudentToAdd(null);
  };

  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    setStudentToAssignRole(null); // Clear selected student on close
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setStudentToRemove(null); // Clear selected student on close
  };

  // --- Modal Actions ---

  // Handle selecting a student from the search results in the Add modal
  const handleSelectSearchResult = (student) => {
    setStudentToAdd(student);
    setAddStudentSearchQuery(student.name); // Put name in input
    setAddStudentSearchResults([]); // Hide results list
  };

  // Handle adding the selected student
  const handleAddStudent = async () => {
    if (!studentToAdd) {
      alert("Please select a student to add."); // Replace with better UI feedback (e.g., toast)
      return;
    }

    // Validate student ID format
    if (studentToAdd.id.startsWith("00-")) {
      setError(
        "Cannot add student with ID starting with '00-'. These IDs are reserved."
      );
      return;
    }

    setIsActionLoading(true); // Use dedicated loading state for actions
    setError(null);
    try {
      // API call to add student to the *currently viewed* program/year
      await addStudentAPI(studentToAdd.id, selectedProgramId, selectedYear);

      // On successful API call, update the local state
      // Create a new student object reflecting the current program/year context
      const newStudentEntry = {
        ...studentToAdd,
        role: null, // Default role
        programId: selectedProgramId,
        year: parseInt(selectedYear),
      };
      // Add to the list and re-sort
      setStudents((prev) =>
        [...prev, newStudentEntry].sort((a, b) => a.name.localeCompare(b.name))
      );

      console.log(
        `Added ${studentToAdd.name} to ${currentProgram.name} Year ${selectedYear}.`
      );
      // toast({ title: "Student Added", description: `${studentToAdd.name} added.` }); // Example toast
      closeAddModal(); // Close modal on success
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student. Please try again.");
      // toast({ title: "Error", description: "Failed to add student.", variant: "destructive" }); // Example toast
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle assigning PIO role
  const handleAssignRole = async () => {
    if (!studentToAssignRole) return;

    setIsActionLoading(true);
    setError(null);
    try {
      // Get the full program name and year level
      const programName =
        selectedProgramId === "bsis"
          ? "Bachelor of Science in Information Systems"
          : "Associate in Computer Technology";

      const yearLevel = {
        1: "First Year",
        2: "Second Year",
        3: "Third Year",
        4: "Fourth Year",
      }[selectedYear];

      const assignedClass = `${programName} - ${yearLevel}`;

      // Use the MongoDB-style _id if available, otherwise fall back to the display id
      const userId = studentToAssignRole._id || studentToAssignRole.id;

      console.log("Assigning PIO role with:", {
        student: studentToAssignRole,
        userId,
        assignedClass,
      });

      // Pass the MongoDB _id to the API
      await assignRoleAPI(userId, "pio", assignedClass);

      // Update the role in the local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentToAssignRole.id
            ? { ...student, role: "pio" }
            : student
        )
      );

      console.log(`${studentToAssignRole.name} has been assigned as PIO.`);
      toast({
        title: "Role Assigned",
        description: `${studentToAssignRole.name} is now a PIO.`,
      });
      closeAssignRoleModal();
    } catch (err) {
      console.error("Error assigning role:", err);
      setError(err.message || "Failed to assign role. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to assign role.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle reverting a PIO to student role
  const handleRevertToStudent = async () => {
    if (!studentToAssignRole) return;

    setIsActionLoading(true);
    setError(null);
    try {
      // Use the MongoDB-style _id if available, otherwise fall back to the display id
      const userId = studentToAssignRole._id || studentToAssignRole.id;

      console.log("Reverting PIO role with:", {
        student: studentToAssignRole,
        userId,
      });

      // Pass the MongoDB _id to the API
      await revertToStudentAPI(userId);

      // Update the role in the local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentToAssignRole.id
            ? { ...student, role: null }
            : student
        )
      );

      console.log(
        `${studentToAssignRole.name} has been reverted to student role.`
      );
      toast({
        title: "Role Reverted",
        description: `${studentToAssignRole.name} is now a student.`,
      });
      closeAssignRoleModal();
    } catch (err) {
      console.error("Error reverting role:", err);
      setError(err.message || "Failed to revert role. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to revert role.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle removing a student
  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    setIsActionLoading(true);
    setError(null);
    try {
      // Pass relevant info if backend needs it (e.g., program/year context)
      await removeStudentAPI(
        studentToRemove.id,
        selectedProgramId,
        selectedYear
      );

      // Remove the student from the local state
      setStudents((prev) =>
        prev.filter((student) => student.id !== studentToRemove.id)
      );

      console.log(`${studentToRemove.name} has been removed from the class.`);
      // toast({ title: "Student Removed", description: `${studentToRemove.name} removed.` }); // Example toast
      closeRemoveModal();
    } catch (err) {
      console.error("Error removing student:", err);
      setError("Failed to remove student. Please try again.");
      // toast({ title: "Error", description: "Failed to remove student.", variant: "destructive" }); // Example toast
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle breadcrumb navigation (placeholder for actual routing)
  const handleNavigate = (section) => {
    // In a real app, use react-router's navigate function or Link component
    console.log(`Simulating navigation to: ${section}`);
    if (section === "students_summary") {
      alert(
        "Navigate to Students Summary/Analytics Page (Implementation Needed)"
      );
      // Example: navigate('/students/summary');
    }
    // Navigation to program/year is handled by handleProgramChange/handleYearChange
  };

  // --- Render ---
  return (
    // Using padding utility for overall spacing
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* --- Breadcrumb Navigation --- */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm text-gray-500 mb-6 flex-wrap"
      >
        {/* "Students" Link (to Summary/Analytics) */}
        <button
          onClick={() => handleNavigate("students_summary")}
          className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1 py-0.5"
        >
          Students
        </button>

        <ChevronRight
          className="mx-1 h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />

        {/* Program Selector Dropdown within Breadcrumb */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button
              variant="ghost"
              className="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 px-1 py-0.5 h-auto focus:ring-2 focus:ring-blue-300 rounded disabled:opacity-50"
            >
              {currentProgram.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Select Program</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {programs.map((program) => (
              <DropdownMenuItem
                key={program.id}
                onSelect={() => handleProgramChange(program.id)} // Use onSelect for DropdownMenuItem
                disabled={program.id === selectedProgramId} // Disable selecting the current program
                className="cursor-pointer"
              >
                {program.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ChevronRight
          className="mx-1 h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />

        {/* Current Year Display */}
        <span className="text-gray-500 px-1 py-0.5" aria-current="page">
          Year {selectedYear}
        </span>
      </nav>
      {/* Page Header */}
      {/* Removed the separate program selector */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentProgram.name} - Year {selectedYear}
        </h1>
      </div>
      {/* Year Tabs */}
      <div className="mb-6 overflow-x-auto">
        <Tabs
          value={selectedYear}
          onValueChange={handleYearChange} // Use the specific handler
          className="w-max" // Ensure tabs don't force wrap unnecessarily
        >
          <TabsList
            className="grid border border-gray-200 rounded-md p-0 h-auto"
            // Inline style is sometimes necessary for dynamic grids based on props
            style={{
              gridTemplateColumns: `repeat(${currentProgram.years}, minmax(auto, 1fr))`,
            }}
          >
            {[...Array(currentProgram.years)].map((_, i) => {
              const yearValue = (i + 1).toString();
              return (
                <TabsTrigger
                  key={yearValue}
                  value={yearValue}
                  className="px-4 sm:px-6 py-2 text-sm rounded-none data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-inner focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none first:rounded-l-md last:rounded-r-md border-r border-gray-200 last:border-r-0"
                  disabled={isLoading} // Disable while loading main data
                >
                  Year {yearValue}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      {/* Action Bar: Search, Filter, Add Button */}
      {/* Using flex for responsive layout, wrapping items on smaller screens */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <Input
            id="student-search"
            placeholder="Search name, ID, email..."
            className="pl-9 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" // Added focus styles
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading} // Disable while loading main data
          />
        </div>

        {/* Filter and Add Button Group */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Filter Dropdown */}
          <Select
            value={filterOption}
            onValueChange={setFilterOption}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-36 border-gray-300 shadow-sm">
              <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="pio">Public Information Officer</SelectItem>
              <SelectItem value="student">Students Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Student Button - Only visible to admins */}
          {isAdmin ? (
            <Button
              onClick={openAddStudentModal} // Use specific handler
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-sm"
              disabled={isLoading || isActionLoading} // Disable if loading data OR performing an action
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Student
            </Button>
          ) : null}
        </div>
      </div>
      {/* Display Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            <span className="text-xl" aria-hidden="true">
              ×
            </span>
            <span className="sr-only">Close error message</span>
          </button>
        </div>
      )}
      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Use overflow-x-auto for responsiveness on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Adjusted padding for table headers */}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student Number
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                {/* Only show Actions column for admin users */}
                {isAdmin && user?.role?.toLowerCase() === "admin" && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {/* Optional: Add a spinner icon here */}
                    Loading students...
                  </td>
                </tr>
              ) : sortedAndFilteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {searchQuery || filterOption !== "all"
                      ? "No students match your current search/filter criteria."
                      : "No students found in this class/year."}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  >
                    {/* Adjusted padding for table cells */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.role?.toLowerCase() === "pio" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Public Information Officer
                        </span>
                      ) : (
                        <span className="text-gray-600">Student</span> // Use a dash for no role
                      )}
                    </td>
                    {/* Only show Actions cell for admin users */}
                    {isAdmin && user?.role?.toLowerCase() === "admin" && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 border border-gray-300 hover:bg-gray-100"
                              disabled={isActionLoading} // Disable actions trigger while another action is loading
                            >
                              <span className="hidden sm:inline">Actions</span>
                              <MoreHorizontal
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border border-gray-200 shadow-md"
                          >
                            {/* Show "Assign PIO" if not already PIO and there's no other PIO */}
                            {student.role !== "pio" &&
                              student.role !== "PIO" &&
                              !sortedAndFilteredStudents.some(
                                (s) => s.role === "pio" || s.role === "PIO"
                              ) && (
                                <DropdownMenuItem
                                  onClick={() => openAssignRoleModal(student)} // Use specific handler
                                  className="cursor-pointer hover:bg-gray-100 text-sm"
                                  disabled={isActionLoading} // Disable during any action loading state
                                >
                                  Assign Public Information Officer Role
                                </DropdownMenuItem>
                              )}

                            {/* Show "Revert to Student" option only for PIO users */}
                            {(student.role === "pio" ||
                              student.role === "PIO") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStudentToAssignRole(student);
                                  setShowAssignRoleModal(true);
                                }}
                                className="cursor-pointer hover:bg-gray-100 text-sm"
                                disabled={isActionLoading}
                              >
                                Revert to Student
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => openRemoveModal(student)} // Use specific handler
                              className="cursor-pointer hover:bg-red-50 text-red-600 text-sm"
                              disabled={isActionLoading} // Disable during any action loading state
                            >
                              Remove Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>{" "}
        {/* End overflow-x-auto */}
      </div>{" "}
      {/* End table container */}
      {/* --- Modals --- */}
      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="add-student-description"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking on the search results dropdown
            if (e.target.closest("[data-results-dropdown]")) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add Student to Class
            </DialogTitle>
            <DialogDescription id="add-student-description">
              Search for a student and add them to {currentProgram.name} - Year{" "}
              {selectedYear}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Search Input within Modal */}
            <div className="space-y-1">
              <label
                htmlFor="addStudentSearch"
                className="text-sm font-medium text-gray-700 block"
              >
                Student Name or ID Search
              </label>
              <div className="relative">
                <Input
                  id="addStudentSearch"
                  placeholder="Start typing name or ID..."
                  value={addStudentSearchQuery}
                  onChange={(e) => {
                    setAddStudentSearchQuery(e.target.value);
                    // Clear selection if user types again
                    if (studentToAdd) setStudentToAdd(null);
                  }}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={!!studentToAdd || isActionLoading} // Disable input once a student is selected or action is loading
                />
                {/* Loading indicator for search */}
                {isSearchingStudents && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    Searching...
                  </span>
                )}
                {/* Search Results Dropdown */}
                {!studentToAdd && addStudentSearchResults.length > 0 && (
                  // Added data attribute for the onPointerDownOutside check
                  <div
                    data-results-dropdown
                    className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
                  >
                    {addStudentSearchResults.map((student) => (
                      <div
                        key={student.id}
                        className="cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50"
                        onClick={() => handleSelectSearchResult(student)}
                        role="option" // Added role
                        aria-selected="false" // Indicate not selected
                      >
                        <p className="font-medium block truncate text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-gray-500 block text-sm">
                          {student.id}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {/* No results message */}
                {!studentToAdd &&
                  addStudentSearchQuery &&
                  !isSearchingStudents &&
                  addStudentSearchResults.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No matching students found.
                    </p>
                  )}
              </div>
            </div>

            {/* Display Selected Student */}
            {studentToAdd && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Selected: {studentToAdd.name}
                  </p>
                  <p className="text-xs text-blue-600">{studentToAdd.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStudentToAdd(null);
                    setAddStudentSearchQuery("");
                  }}
                  className="text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  disabled={isActionLoading} // Disable change button during action
                >
                  Change
                </Button>
              </div>
            )}

            {/* Note: Program/Year is determined by the main view context */}
            <p className="text-sm text-gray-600">
              This student will be added to:{" "}
              <span className="font-medium">
                {currentProgram.name} - Year {selectedYear}
              </span>
              .
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeAddModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isActionLoading} // Disable cancel during action
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isActionLoading || !studentToAdd} // Disable if action loading or no student selected
            >
              {isActionLoading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Assign Role Modal - Modified to handle both assigning PIO and reverting to student */}
      <Dialog open={showAssignRoleModal} onOpenChange={setShowAssignRoleModal}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="assign-role-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {studentToAssignRole?.role === "pio"
                ? "Revert to Student"
                : "Assign PIO Role"}
            </DialogTitle>
            <DialogDescription
              id="assign-role-description"
              className="py-4 text-gray-600"
            >
              {studentToAssignRole?.role === "pio" ? (
                <>
                  Are you sure you want to revert{" "}
                  <span className="font-medium">{studentToAssignRole?.name}</span>{" "}
                  ({studentToAssignRole?.id}) back to a regular student?
                </>
              ) : (
                <>
                  Are you sure you want to assign{" "}
                  <span className="font-medium">{studentToAssignRole?.name}</span>{" "}
                  ({studentToAssignRole?.id}) as a PIO (Public Information
                  Officer)?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeAssignRoleModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={
                studentToAssignRole?.role === "pio"
                  ? handleRevertToStudent
                  : handleAssignRole
              }
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading
                ? studentToAssignRole?.role === "pio"
                  ? "Reverting..."
                  : "Assigning..."
                : studentToAssignRole?.role === "pio"
                ? "Revert to Student"
                : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Remove Student Modal */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="remove-student-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Remove Student
            </DialogTitle>
            <DialogDescription
              id="remove-student-description"
              className="py-4 text-gray-600"
            >
              Are you sure you want to remove{" "}
              <span className="font-medium">{studentToRemove?.name}</span> (
              {studentToRemove?.id}) from {currentProgram.name} - Year{" "}
              {selectedYear}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeRemoveModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveStudent}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? "Removing..." : "Remove Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div> // End main container
  );
};

export default Users;
