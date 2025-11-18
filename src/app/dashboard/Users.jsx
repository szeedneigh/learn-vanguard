import logger from "@/utils/logger";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel, // Added for clarity
  DropdownMenuSeparator, // Added for visual separation
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    id: "21-00002DB",
    _id: "60d0fe4f5311236168a109cb", // Added MongoDB-style _id
    name: "Barbie Dela Cruz",
    email: "barbiedelacruz@student.lxverdad",
    gender: "female",
    role: "pio",
    id: "21-00003FL",
    _id: "60d0fe4f5311236168a109cc", // Added MongoDB-style _id
    name: "Luca Ferrari",
    email: "lucaferrari@student.lxverdad",
    id: "21-00004KA",
    _id: "60d0fe4f5311236168a109cd", // Added MongoDB-style _id
    name: "Aisha Khan",
    email: "aishakhan@student.lxverdad",
    id: "21-00005MS",
    _id: "60d0fe4f5311236168a109ce", // Added MongoDB-style _id
    name: "Sofia Martinez",
    email: "sofiamartinez@student.lxverdad",
    id: "21-00006ML",
    _id: "60d0fe4f5311236168a109cf", // Added MongoDB-style _id
    name: "Liam Muller",
    email: "liammuller@student.lxverdad",
  // Add more students for different programs/years if needed for testing
    id: "22-10001AB",
    _id: "60d0fe4f5311236168a109d0", // Added MongoDB-style _id
    name: "Anna Bell",
    email: "annabell@student.lxverdad",
    programId: "act",
    id: "22-10002CD",
    _id: "60d0fe4f5311236168a109d1", // Added MongoDB-style _id
    name: "Carl Davis",
    email: "carldavis@student.lxverdad",
// Mock function to fetch students for a specific program and year
const fetchStudentsAPI = async (programId, year) => {
  logger.log(
    `API CALL: Fetching students for program ${programId}, year ${year}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, filter data based on programId and year from the API
  const filteredStudents = initialStudentsData.filter(
    (s) => s.programId === programId && s.year === parseInt(year)
  // Simulate API success
  return filteredStudents;
  // Simulate API error:
  // throw new Error("Failed to fetch students");
};
// Mock function to search for students NOT YET in the current class/year (for adding)
const searchAvailableStudentsAPI = async (query) => {
  logger.log(`API CALL: Searching available students with query: ${query}`);
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
      id: "22-00008EJ",
      name: "Emma Johnson",
      email: "emmajohnson@student.lxverdad",
      gender: "female",
      id: "22-00009AK",
      name: "Alex Kim",
      email: "alexkim@student.lxverdad",
      id: "23-00010BC",
      name: "Ben Carter",
      email: "bencarter@student.lxverdad",
    // Ensure mock results don't include students already in the initial list for clarity
  ].filter(
    (s) =>
      // Filter out students already in the class
      (s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.id.toLowerCase().includes(query.toLowerCase())) &&
      !initialStudentsData.some((is) => is.id === s.id) &&
      // Filter out student IDs that start with "00-"
      !s.id.startsWith("00-")
  return mockResults;
  // throw new Error("Search failed");
// Mock function to add a student to a class/year
const addStudentAPI = async (studentId, programId, year) => {
    `API CALL: Adding student ${studentId} to program ${programId}, year ${year}`
  // In a real app, the backend would handle this.
  // For the frontend simulation, we'll add the student to our local state upon success.
  return { success: true };
  // throw new Error("Failed to add student");
// Mock function to assign PIO role - Replace with actual API call
const assignRoleAPI = async (studentId, role, classInfo) => {
  try {
    logger.log(
      `API CALL: Assigning role ${role} to student ${studentId}`,
      classInfo
    );
    // Use the actual API function with proper ID handling
    const userId = studentId._id || studentId;
    const result = await assignPIORole(userId, {
      course: classInfo.course,
      yearLevel: classInfo.yearLevel,
    });
    if (!result.success) {
      throw new Error(result.error || "Failed to assign role");
    }
    return { success: true, data: result.data };
  } catch (error) {
    logger.error("Error in assignRoleAPI:", error);
    throw error;
// Mock function to revert PIO to student role - Replace with actual API call
const revertToStudentAPI = async (studentId) => {
    logger.log(`API CALL: Reverting student ${studentId} to student role`);
    // The backend expects MongoDB ObjectId, but our mock data might have custom IDs
    const result = await revertPIORole(userId);
      throw new Error(result.error || "Failed to revert role");
    logger.error("Error in revertToStudentAPI:", error);
// Mock function to remove a student from a class/year
const removeStudentAPI = async (studentId, programId, year) => {
    `API CALL: Removing student ${studentId} from program ${programId}, year ${year}`
  // throw new Error("Failed to remove student");
// --- Component ---
const Users = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState(""); // For filtering the main student list
  const [filterOption, setFilterOption] = useState("all"); // 'all', 'pio', 'student'
  const [programs] = useState(programsData); // Could be fetched from API
  const [selectedProgramId, setSelectedProgramId] = useState("bsis"); // Default to first program
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
    logger.log("Is admin:", isAdmin, "User:", user);
  }, [isAdmin, user]);
  // Debug log for user and students data
    logger.log("Current user data:", user);
    logger.log("Is admin:", isAdmin);
    logger.log("Students data:", students);
    logger.log("Filtered students:", sortedAndFilteredStudents);
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
  const assignPIOMutation = useAssignPIORole();
  // --- Derived State ---
  const currentProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];
  // --- Effects ---
  // Fetch students when program or year changes
    const fetchStudents = async () => {
      setIsLoading(true); // Use main loading state for fetching list data
      setError(null); // Clear previous errors
      try {
        const data = await fetchStudentsAPI(selectedProgramId, selectedYear);
        setStudents(data);
      } catch (err) {
        logger.error("Error fetching students:", err);
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
    // Don't search if the query is empty or a student is already selected
    if (!addStudentSearchQuery.trim() || studentToAdd) {
      setAddStudentSearchResults([]);
      setIsSearchingStudents(false); // Ensure loading state is off
      return;
    setIsSearchingStudents(true);
    const debounceTimeout = setTimeout(async () => {
        const results = await searchAvailableStudentsAPI(addStudentSearchQuery);
        // Ensure we only update results if the query hasn't changed while fetching
        setAddStudentSearchResults(results);
        logger.error("Error searching students:", err);
        // Handle search error in UI if needed (e.g., show a message)
        setAddStudentSearchResults([]); // Clear results on error
        // Check if the query is still the same before setting loading to false
        // This prevents flickering if the user types quickly
        setIsSearchingStudents(false);
    }, 300); // 300ms debounce
    // Cleanup function to clear timeout if query changes quickly or component unmounts
    return () => clearTimeout(debounceTimeout);
  }, [addStudentSearchQuery, studentToAdd]); // Dependencies: addStudentSearchQuery, studentToAdd
  // --- Event Handlers ---
  // Handles selecting a program (from breadcrumb dropdown)
  const handleProgramChange = (programId) => {
    setSelectedProgramId(programId);
    // Reset year if switching from BSIS (4 years) to ACT (2 years)
    if (programId === "act" && selectedYear > 2) {
      setSelectedYear("1");
  };
  // Handles selecting a year tab
  const handleYearChange = (year) => {
    setSelectedYear(year);
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
          !student.role ||
          studentRole === "student" ||
            student.normalizedRole.toLowerCase() === "student")
    } else {
      roleFiltered = queryFiltered;
    // Sort alphabetically by name
    return [...roleFiltered].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery, filterOption]); // Dependencies for memoization
  const sortedAndFilteredStudents = getFilteredAndSortedStudents();
  // Open Modals
  const openAssignRoleModal = (student) => {
    setStudentToAssignRole(student);
    setShowAssignRoleModal(true);
  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  const openAddStudentModal = () => {
    setShowAddModal(true);
    // Reset modal state when opening
    setAddStudentSearchQuery("");
    setAddStudentSearchResults([]);
    setStudentToAdd(null);
  // Close Modals and Reset State
  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset state on close
  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    setStudentToAssignRole(null); // Clear selected student on close
  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setStudentToRemove(null); // Clear selected student on close
  // --- Modal Actions ---
  // Handle selecting a student from the search results in the Add modal
  const handleSelectSearchResult = (student) => {
    setStudentToAdd(student);
    setAddStudentSearchQuery(student.name); // Put name in input
    setAddStudentSearchResults([]); // Hide results list
  // Handle adding the selected student
  const handleAddStudent = async () => {
    if (!studentToAdd) {
      alert("Please select a student to add."); // Replace with better UI feedback (e.g., toast)
    // Validate student ID format
    if (studentToAdd.id.startsWith("00-")) {
      setError(
        "Cannot add student with ID starting with '00-'. These IDs are reserved."
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
      logger.log(
        `Added ${studentToAdd.name} to ${currentProgram.name} Year ${selectedYear}.`
      // toast({ title: "Student Added", description: `${studentToAdd.name} added.` }); // Example toast
      closeAddModal(); // Close modal on success
    } catch (err) {
      logger.error("Error adding student:", err);
      setError("Failed to add student. Please try again.");
      // toast({ title: "Error", description: "Failed to add student.", variant: "destructive" }); // Example toast
    } finally {
      setIsActionLoading(false);
  // Handle assigning PIO role
  const handleAssignRole = async () => {
    if (!studentToAssignRole) return;
    setIsActionLoading(true);
      // Use the MongoDB-style _id if available, otherwise fall back to the display id
      const userId = studentToAssignRole._id || studentToAssignRole.id;
      logger.log("Assigning PIO role with:", {
        student: studentToAssignRole,
        userId,
        program: selectedProgramId,
        yearLevel: selectedYear
      // Pass the parameters in the new format
      const result = await assignPIOMutation.mutateAsync({
        studentId: userId,
        yearLevel: selectedYear.toString()
      if (result.success) {
        toast({
          title: "Success",
          description: `${studentToAssignRole.name} has been assigned as PIO.`
        });
        // Update the local state with the response data
        setStudents((prev) =>
          prev.map((student) =>
            student.id === studentToAssignRole.id
              ? { ...student, ...result.data }
              : student
          )
      } else {
        throw new Error(result.error || "Failed to assign PIO role");
    } catch (error) {
      logger.error("Error assigning PIO role:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to assign PIO role",
        variant: "destructive"
      onCloseDialog();
  // Handle reverting a PIO to student role
  const handleRevertToStudent = async () => {
      logger.log("Reverting PIO role with:", {
      // Pass the MongoDB _id to the API
      await revertToStudentAPI(userId);
      // Update the role in the local state
        prev.map((student) =>
          student.id === studentToAssignRole.id
            ? { ...student, role: null }
            : student
        )
        `${studentToAssignRole.name} has been reverted to student role.`
        title: "Role Reverted",
        description: `${studentToAssignRole.name} is now a student.`,
      closeAssignRoleModal();
      logger.error("Error reverting role:", err);
      setError(err.message || "Failed to revert role. Please try again.");
        description: err.message || "Failed to revert role.",
        variant: "destructive",
  // Handle removing a student
  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
      // Pass relevant info if backend needs it (e.g., program/year context)
      await removeStudentAPI(
        studentToRemove.id,
        selectedProgramId,
        selectedYear
      // Remove the student from the local state
        prev.filter((student) => student.id !== studentToRemove.id)
      logger.log(`${studentToRemove.name} has been removed from the class.`);
      // toast({ title: "Student Removed", description: `${studentToRemove.name} removed.` }); // Example toast
      closeRemoveModal();
      logger.error("Error removing student:", err);
      setError("Failed to remove student. Please try again.");
      // toast({ title: "Error", description: "Failed to remove student.", variant: "destructive" }); // Example toast
  // Handle breadcrumb navigation (placeholder for actual routing)
  const handleNavigate = (section) => {
    // In a real app, use react-router's navigate function or Link component
    logger.log(`Simulating navigation to: ${section}`);
    if (section === "students_summary") {
      alert(
        "Navigate to Students Summary/Analytics Page (Implementation Needed)"
      // Example: navigate('/students/summary');
    // Navigation to program/year is handled by handleProgramChange/handleYearChange
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
        </div>
        {/* Filter and Add Button Group */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Filter Dropdown */}
          <Select
            value={filterOption}
            onValueChange={setFilterOption}
            disabled={isLoading}
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
              onClick={openAddStudentModal} // Use specific handler
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-sm"
              disabled={isLoading || isActionLoading} // Disable if loading data OR performing an action
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Student
          ) : null}
      {/* Display Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            <span className="text-xl" aria-hidden="true">
              ×
            </span>
            <span className="sr-only">Close error message</span>
          </button>
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
                  Student Number
                </th>
                  Name
                  Email
                  Role
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
                    {/* Optional: Add a spinner icon here */}
                    Loading students...
                  </td>
                </tr>
              ) : sortedAndFilteredStudents.length === 0 ? (
                    {searchQuery || filterOption !== "all"
                      ? "No students match your current search/filter criteria."
                      : "No students found in this class/year."}
              ) : (
                sortedAndFilteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    {/* Adjusted padding for table cells */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.name}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                      {student.role?.toLowerCase() === "pio" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Public Information Officer
                        </span>
                      ) : (
                        <span className="text-gray-600">Student</span> // Use a dash for no role
                      )}
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
                {/* Search Results Dropdown */}
                {!studentToAdd && addStudentSearchResults.length > 0 && (
                  // Added data attribute for the onPointerDownOutside check
                  <div
                    data-results-dropdown
                    className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
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
                      </div>
                    ))}
                  </div>
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
                  className="text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  disabled={isActionLoading} // Disable change button during action
                  Change
                </Button>
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
              variant="outline"
              onClick={closeAddModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isActionLoading} // Disable cancel during action
              Cancel
              onClick={handleAddStudent}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isActionLoading || !studentToAdd} // Disable if action loading or no student selected
              {isActionLoading ? "Adding..." : "Add Student"}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Assign Role Modal - Modified to handle both assigning PIO and reverting to student */}
      <Dialog open={showAssignRoleModal} onOpenChange={setShowAssignRoleModal}>
        <DialogContent className="max-w-xl">
            <DialogTitle>
              {studentToAssignRole?.role === "pio"
                ? "Revert to Student"
                : "Assign PIO Role"}
            <DialogDescription>
                ? "Are you sure you want to revert this PIO back to a student?"
                : "Select the class to assign this student as PIO."}
          {studentToAssignRole?.role !== "pio" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                  <label htmlFor="program" className="text-sm font-medium">
                    Program
                  </label>
                  <Select
                    value={selectedProgramId}
                    onValueChange={handleProgramChange}
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bsis">BS Information Systems</SelectItem>
                      <SelectItem value="act">Associate in Computer Technology</SelectItem>
                    </SelectContent>
                  </Select>
                
                  <label htmlFor="yearLevel" className="text-sm font-medium">
                    Year Level
                    value={selectedYear.toString()}
                    onValueChange={handleYearChange}
                      <SelectValue placeholder="Select year level" />
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      {selectedProgramId === "bsis" && (
                        <>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                        </>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
          )}
          <DialogFooter>
              onClick={onCloseDialog}
              disabled={isActionLoading}
              onClick={studentToAssignRole?.role === "pio" ? handleRevertRole : handleAssignRole}
              {isActionLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {studentToAssignRole?.role === "pio" ? "Reverting..." : "Assigning..."}
                </span>
                studentToAssignRole?.role === "pio" ? "Revert to Student" : "Assign as PIO"
      {/* Remove Student Modal */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
          aria-describedby="remove-student-description"
            <DialogTitle className="text-lg font-semibold text-red-700">
              Remove Student
            <DialogDescription
              id="remove-student-description"
              className="py-4 text-gray-600"
              Are you sure you want to remove{" "}
              <span className="font-medium">{studentToRemove?.name}</span> (
              {studentToRemove?.id}) from {currentProgram.name} - Year{" "}
              {selectedYear}? This action cannot be undone.
              onClick={closeRemoveModal}
              onClick={handleRemoveStudent}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              {isActionLoading ? "Removing..." : "Remove Student"}
    </div> // End main container
export default Users;
