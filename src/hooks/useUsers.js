import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is in the root hooks dir
import {
  getUsers,
  createUser,
  assignUserRole,
  deleteUser,
} from "@/services/users";

const programsData = [
  { id: "bsis", name: "Bachelor of Science in Information Systems", years: 4 },
  { id: "act", name: "Associate in Computer Technology", years: 2 },
];

export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState(""); // For filtering the main student list
  const [filterOption, setFilterOption] = useState("all"); // 'all', 'pio', 'student'
  const [programs, setPrograms] = useState(programsData); // Could be fetched from API
  const [selectedProgramId, setSelectedProgramId] = useState(
    programsData[0].id
  ); // Default to first program
  const [selectedYear, setSelectedYear] = useState("1"); // Default to year 1

  const [students, setStudents] = useState([]); // Students currently displayed for the selected program/year
  const [isLoading, setIsLoading] = useState(false); // For loading indicators (main page data)
  const [isActionLoading, setIsActionLoading] = useState(false); // Separate loading state for modal actions (add, assign, remove)
  const [error, setError] = useState(null); // For displaying errors

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

  const { toast } = useToast(); // Uncomment and use if you have a toast system

  // --- Derived State ---
  const currentProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) || programs[0],
    [programs, selectedProgramId]
  );

  // --- Effects ---

  // Fetch students when program or year changes
  useEffect(() => {
    let isStale = false;
    const abortController = new AbortController();

    const fetchStudents = async () => {
      setIsLoading(true); // Use main loading state for fetching list data
      setError(null); // Clear previous errors
      try {
        const data = await getUsers({
          programId: selectedProgramId,
          year: selectedYear,
          role: "STUDENT",
          signal: abortController.signal,
        });

        if (!isStale) {
          setStudents(data);
        }
      } catch (err) {
        if (!isStale && err.name !== "AbortError") {
          console.error("Error fetching students:", err);
          setError("Failed to load students. Please try again.");
          toast({
            title: "Error",
            description: "Failed to load students.",
            variant: "destructive",
          });
          setStudents([]); // Clear students on error
        }
      } finally {
        if (!isStale) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isStale = true;
      abortController.abort();
    };
  }, [selectedProgramId, selectedYear, toast, getUsers]); // Added getUsers to deps

  // Debounced search for the "Add Student" modal
  useEffect(() => {
    let isStale = false;
    const abortController = new AbortController();

    // Don't search if the query is empty or a student is already selected
    if (!addStudentSearchQuery.trim() || studentToAdd) {
      setAddStudentSearchResults([]);
      setIsSearchingStudents(false); // Ensure loading state is off
      return;
    }

    setIsSearchingStudents(true);
    const currentQuery = addStudentSearchQuery; // Capture current query value

    const debounceTimeout = setTimeout(async () => {
      try {
        const results = await getUsers({
          search: currentQuery,
          role: "STUDENT",
          signal: abortController.signal,
        });

        // Only update if the query hasn't changed and component is still mounted
        if (!isStale && currentQuery === addStudentSearchQuery) {
          setAddStudentSearchResults(results);
        }
      } catch (err) {
        if (!isStale && err.name !== "AbortError") {
          console.error("Error searching students:", err);
          setAddStudentSearchResults([]); // Clear results on error
        }
      } finally {
        if (!isStale && currentQuery === addStudentSearchQuery) {
          setIsSearchingStudents(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      isStale = true;
      clearTimeout(debounceTimeout);
      abortController.abort();
    };
  }, [addStudentSearchQuery, studentToAdd, getUsers]); // Added getUsers to deps

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
    // Ensure students is an array before filtering
    const safeStudents = Array.isArray(students) ? students : [];

    // Filter by search query (main list)
    const queryFiltered = safeStudents.filter((student) => {
      // Normalize search fields to strings
      const name = typeof student.name === "string" ? student.name : "";
      const id = student.id != null ? String(student.id) : "";
      const email = typeof student.email === "string" ? student.email : "";
      const searchTerm = searchQuery.toLowerCase();

      return (
        name.toLowerCase().includes(searchTerm) ||
        id.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm)
      );
    });

    // Filter by role
    let roleFiltered;
    if (filterOption === "pio") {
      roleFiltered = queryFiltered.filter((student) => student.role === "PIO");
    } else if (filterOption === "student") {
      roleFiltered = queryFiltered.filter(
        (student) => !student.role || student.role !== "PIO"
      );
    } else {
      roleFiltered = queryFiltered;
    }

    // Sort alphabetically by name
    return [...roleFiltered].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery, filterOption]); // Dependencies for memoization

  const sortedAndFilteredStudents = useMemo(
    () => getFilteredAndSortedStudents(),
    [getFilteredAndSortedStudents]
  );

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
      toast({ title: "Error", description: "Please select a student to add." });
      return;
    }

    // Check for existing student with same id in this program/year
    const isDuplicate = students.some(
      (student) =>
        student.id === studentToAdd.id &&
        student.programId === selectedProgramId &&
        student.year === parseInt(selectedYear)
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "This student is already in this program and year.",
        variant: "destructive",
      });
      return;
    }

    setIsActionLoading(true); // Use dedicated loading state for actions
    setError(null);
    try {
      // API call to add student to the *currently viewed* program/year
      await createUser(studentToAdd.id, selectedProgramId, selectedYear);

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
      toast({
        title: "Student Added",
        description: `${studentToAdd.name} added.`,
      });
      closeAddModal(); // Close modal on success
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student. Please try again.");
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
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
      await assignUserRole(studentToAssignRole.id, "PIO");

      // Update the role in the local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentToAssignRole.id
            ? { ...student, role: "PIO" }
            : student
        )
      );

      console.log(`${studentToAssignRole.name} has been assigned as PIO.`);
      toast({
        title: "Role Assigned",
        description: `${studentToAssignRole.name} is now a PIO.`,
      }); // Example toast
      closeAssignRoleModal();
    } catch (err) {
      console.error("Error assigning role:", err);
      setError("Failed to assign role. Please try again.");
      toast({
        title: "Error",
        description: "Failed to assign role.",
        variant: "destructive",
      }); // Example toast
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
      await deleteUser(studentToRemove.id, selectedProgramId, selectedYear);

      // Remove the student from the local state
      setStudents((prev) =>
        prev.filter((student) => student.id !== studentToRemove.id)
      );

      console.log(`${studentToRemove.name} has been removed from the class.`);
      toast({
        title: "Student Removed",
        description: `${studentToRemove.name} removed.`,
      }); // Example toast
      closeRemoveModal();
    } catch (err) {
      console.error("Error removing student:", err);
      setError("Failed to remove student. Please try again.");
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      }); // Example toast
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    filterOption,
    setFilterOption,
    programs,
    setPrograms,
    selectedProgramId,
    setSelectedProgramId,
    selectedYear,
    setSelectedYear,
    students,
    setStudents,
    isLoading,
    setIsLoading,
    isActionLoading,
    setIsActionLoading,
    error,
    setError,
    showAddModal,
    setShowAddModal,
    addStudentSearchQuery,
    setAddStudentSearchQuery,
    addStudentSearchResults,
    setAddStudentSearchResults,
    studentToAdd,
    setStudentToAdd,
    isSearchingStudents,
    setIsSearchingStudents,
    showAssignRoleModal,
    setShowAssignRoleModal,
    studentToAssignRole,
    setStudentToAssignRole,
    showRemoveModal,
    setShowRemoveModal,
    studentToRemove,
    setStudentToRemove,
    currentProgram,
    handleProgramChange,
    handleYearChange,
    getFilteredAndSortedStudents,
    sortedAndFilteredStudents,
    openAssignRoleModal,
    openRemoveModal,
    openAddStudentModal,
    closeAddModal,
    closeAssignRoleModal,
    closeRemoveModal,
    handleSelectSearchResult,
    handleAddStudent,
    handleAssignRole,
    handleRemoveStudent,
  };
};
