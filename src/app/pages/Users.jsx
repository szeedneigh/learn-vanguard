import { useState, useRef, useEffect } from "react";
import { useUsersPage, useSearchUsers } from "@/hooks/useUsersQuery";
import { Search, MoreHorizontal, Plus, ChevronRight } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

const programsData = [
  { id: "bsis", name: "Bachelor of Science in Information Systems", years: 4 },
  { id: "act", name: "Associate in Computer Technology", years: 2 },
];

const Users = () => {
  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProgramId, setSelectedProgramId] = useState(
    programsData[0].id
  );
  const [selectedYear, setSelectedYear] = useState("1");

  // Local loading state for mutations
  const [isLocalMutating, setIsLocalMutating] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showRevertRoleModal, setShowRevertRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToAssignRole, setStudentToAssignRole] = useState(null);
  const [studentToRevertRole, setStudentToRevertRole] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Add student modal states
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState("");
  const [studentToAdd, setStudentToAdd] = useState(null);
  const [addStudentError, setAddStudentError] = useState("");

  // React Query hooks
  const {
    students,
    isLoading,
    error,
    refetch,
    assignPIO,
    revertPIO,
    removeUser,
    isAssigningPIO,
    isRevertingPIO,
    isRemovingUser,
    isMutating,
    assignPIOError,
    revertPIOError,
    removeUserError,
  } = useUsersPage(selectedProgramId, selectedYear);

  // Search users hook for add student modal
  const { data: searchResults = [], isLoading: isSearchingStudents } =
    useSearchUsers(addStudentSearchQuery, {
      enabled: addStudentSearchQuery.length > 2,
    });

  // Computed values
  const currentProgram =
    programsData.find((p) => p.id === selectedProgramId) || programsData[0];

  // Add user context to check current user's role
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const isCurrentUserPIO = user?.role === "pio";

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter((student) => {
      // Exclude admin users from the list
      if (student.role === "admin") {
        return false;
      }

      // Search filter - handle both name formats and studentNumber
      const fullName =
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`.toLowerCase()
          : (student.name || "").toLowerCase();

      const studentNumber = (student.studentNumber || student.id || "")
        .toString()
        .toLowerCase();
      const emailAddress = (student.email || "").toLowerCase();
      const searchTerm = searchQuery.toLowerCase();

      const searchMatch =
        fullName.includes(searchTerm) ||
        studentNumber.includes(searchTerm) ||
        emailAddress.includes(searchTerm);

      // Role filter - apply only if a specific filter is selected
      let roleMatch = true;
      if (filterOption === "pio") {
        roleMatch = student.role === "pio";
      } else if (filterOption === "student") {
        roleMatch = !student.role || student.role === "student";
      }

      return searchMatch && roleMatch;
    })
    .sort((a, b) => {
      // Sort by role first (PIOs at the top)
      if (a.role === "pio" && b.role !== "pio") return -1;
      if (a.role !== "pio" && b.role === "pio") return 1;

      // Then sort by name
      const nameA =
        a.firstName && a.lastName
          ? `${a.firstName} ${a.lastName}`
          : a.name || "";
      const nameB =
        b.firstName && b.lastName
          ? `${b.firstName} ${b.lastName}`
          : b.name || "";
      return nameA.localeCompare(nameB);
    });

  // Event handlers
  const handleProgramChange = (programId) => {
    if (programId !== selectedProgramId) {
      setSelectedProgramId(programId);
      setSelectedYear("1");
      setSearchQuery("");
      setFilterOption("all");
    }
  };

  const handleYearChange = (year) => {
    if (year !== selectedYear) {
      setSelectedYear(year);
      setSearchQuery("");
      setFilterOption("all");
    }
  };

  const handleNavigate = (section) => {
    console.log("Simulating navigation to: " + section);
    if (section === "students_summary") {
      alert(
        "Navigate to Students Summary/Analytics Page (Implementation Needed)"
      );
    }
  };

  // Modal handlers
  const openAddStudentModal = () => {
    setShowAddModal(true);
    setAddStudentSearchQuery("");
    setStudentToAdd(null);
    setAddStudentError("");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddStudentSearchQuery("");
    setStudentToAdd(null);
    setAddStudentError("");
  };

  const openAssignRoleModal = (student) => {
    setStudentToAssignRole(student);
    setShowAssignRoleModal(true);
  };

  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    setTimeout(() => {
      setStudentToAssignRole(null);
    }, 300); // Delay clearing state until after animation completes
  };

  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setTimeout(() => {
      setStudentToRemove(null);
    }, 300); // Delay clearing state until after animation completes
  };

  const openRevertRoleModal = (student) => {
    setStudentToRevertRole(student);
    setShowRevertRoleModal(true);
  };

  const closeRevertRoleModal = () => {
    setShowRevertRoleModal(false);
    setTimeout(() => {
      setStudentToRevertRole(null);
    }, 300); // Delay clearing state until after animation completes
  };

  const handleSelectSearchResult = (student) => {
    setStudentToAdd(student);
    // Use the appropriate name format for the search query
    const displayName =
      student.firstName && student.lastName
        ? `${student.firstName} ${student.lastName}`
        : student.name;
    setAddStudentSearchQuery(displayName);
  };

  const handleAddStudent = async () => {
    if (!studentToAdd) return;

    // Reset any previous errors
    setAddStudentError("");

    try {
      // Set loading state
      setIsLocalMutating(true);

      // Check for existing student
      const isDuplicate = students.some(
        (student) =>
          student._id === studentToAdd._id || student.id === studentToAdd.id
      );

      if (isDuplicate) {
        setAddStudentError("This student is already in this class");
        return;
      }

      // In a real implementation, you would call an API here
      // For now, we'll just simulate a successful addition
      console.log("Adding student to class:", {
        student: studentToAdd,
        program: currentProgram.name,
        year: selectedYear,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show success message
      toast.success("Student added to class successfully");

      // Close modal and refetch students
      closeAddModal();
      await refetch();
    } catch (error) {
      console.error("Failed to add student:", error);
      setAddStudentError("Failed to add student to class");
      toast.error("Failed to add student to class");
    } finally {
      setIsLocalMutating(false);
    }
  };

  const handleAssignRole = async () => {
    if (!studentToAssignRole) return;

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

    // Use the correct ID field (_id from MongoDB)
    // MongoDB IDs are typically stored in the _id field
    const userId = studentToAssignRole._id || studentToAssignRole.id;

    console.log("Assigning PIO role to user:", {
      user: studentToAssignRole,
      userId: userId,
      assignedClass: `${programName} - ${yearLevel}`,
    });

    if (!userId) {
      console.error(
        "Cannot assign PIO role: Student ID is undefined",
        studentToAssignRole
      );
      toast.error("Cannot assign PIO role: Student ID is undefined");
      return;
    }

    try {
      // Close modal before the API call to improve perceived performance
      closeAssignRoleModal();

      // Set loading state
      setIsLocalMutating(true);

      await assignPIO({
        userId: userId,
        assignedClass: `${programName} - ${yearLevel}`,
      });

      // Force refetch to ensure UI is updated
      await refetch();

      // Show success message
      toast.success("PIO role assigned successfully");
    } catch (error) {
      console.error("Failed to assign PIO role:", error);
      // Force refetch even on error to ensure UI is updated
      try {
        await refetch();
      } catch (refetchError) {
        console.error("Failed to refetch after error:", refetchError);
      }

      // Show error message
      toast.error(error.message || "Failed to assign PIO role");
    } finally {
      // Reset loading state if component is still mounted
      if (mounted.current) {
        setIsLocalMutating(false);
      }
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      // Use the correct ID field (_id from MongoDB)
      const userId = studentToRemove._id || studentToRemove.id;

      if (!userId) {
        console.error(
          "Cannot remove student: Student ID is undefined",
          studentToRemove
        );
        toast.error("Cannot remove student: Student ID is undefined");
        return;
      }

      // Close modal before the API call to improve perceived performance
      closeRemoveModal();

      // Set loading state
      setIsLocalMutating(true);

      await removeUser(userId);

      // Force refetch to ensure UI is updated
      await refetch();

      // Show success message
      toast.success("Student removed successfully");
    } catch (error) {
      console.error("Failed to remove student:", error);
      // Force refetch even on error to ensure UI is updated
      try {
        await refetch();
      } catch (refetchError) {
        console.error("Failed to refetch after error:", refetchError);
      }

      // Show error message
      toast.error("Failed to remove student");
    } finally {
      // Reset loading state if component is still mounted
      if (mounted.current) {
        setIsLocalMutating(false);
      }
    }
  };

  const handleRevertRole = async () => {
    if (!studentToRevertRole) return;

    // Use the correct ID field (_id from MongoDB)
    const userId = studentToRevertRole._id || studentToRevertRole.id;

    if (!userId) {
      console.error(
        "Cannot revert PIO role: Student ID is undefined",
        studentToRevertRole
      );
      toast.error("Cannot revert PIO role: Student ID is undefined");
      return;
    }

    try {
      // Close modal before the API call to improve perceived performance
      closeRevertRoleModal();

      // Set loading state
      setIsLocalMutating(true);

      await revertPIO(userId);

      // Force refetch to ensure UI is updated
      await refetch();

      // Show success message
      toast.success("Role reverted successfully");
    } catch (error) {
      console.error("Failed to revert PIO role:", error);
      // Force refetch even on error to ensure UI is updated
      try {
        await refetch();
      } catch (refetchError) {
        console.error("Failed to refetch after error:", refetchError);
      }

      // Show error message
      toast.error("Failed to revert PIO role");
    } finally {
      // Reset loading state if component is still mounted
      if (mounted.current) {
        setIsLocalMutating(false);
      }
    }
  };

  // Display error message component
  const ErrorMessage = ({ error, onRetry }) => {
    if (!error) return null;

    const errorMessage = error?.message || error?.error || "An error occurred";

    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            <span className="text-xl" aria-hidden="true">
              ↻
            </span>
            <span className="sr-only">Retry</span>
          </button>
        )}
      </div>
    );
  };

  // Add a mounted ref to track component mount state
  const mounted = useRef(true);

  // Update the mounted ref on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm text-gray-500 mb-6 flex-wrap"
      >
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
            {programsData.map((program) => (
              <DropdownMenuItem
                key={program.id}
                onSelect={() => handleProgramChange(program.id)}
                disabled={program.id === selectedProgramId}
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
        <span className="text-gray-500 px-1 py-0.5" aria-current="page">
          Year {selectedYear}
        </span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentProgram.name} - Year {selectedYear}
        </h1>
      </div>
      <div className="mb-6 overflow-x-auto">
        <Tabs
          value={selectedYear}
          onValueChange={handleYearChange}
          className="w-max"
        >
          <TabsList
            className="grid border border-gray-200 rounded-md p-0 h-auto"
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
                  className="px-4 sm:px-6 py-2 text-sm rounded-none data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-inner focus-visible:z-10 focus-visible:ring-2 focus:ring-blue-400 focus:outline-none first:rounded-l-md last:rounded-r-md border-r border-gray-200 last:border-r-0"
                  disabled={isLoading}
                >
                  Year {yearValue}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <Input
            id="student-search"
            placeholder="Search name, ID, email..."
            className="pl-9 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
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
          {!isCurrentUserPIO && hasPermission(PERMISSIONS.MANAGE_STUDENTS) && (
            <Button
              onClick={openAddStudentModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>
      {/* Display errors */}
      <ErrorMessage error={error} onRetry={refetch} />
      {assignPIOError && <ErrorMessage error={assignPIOError} />}
      {revertPIOError && <ErrorMessage error={revertPIOError} />}
      {removeUserError && <ErrorMessage error={removeUserError} />}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filteredAndSortedStudents.length === 0 ? (
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
                filteredAndSortedStudents.map((student) => (
                  <tr
                    key={student._id || student.id}
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.studentNumber || student.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.firstName && student.lastName
                        ? `${student.firstName} ${student.lastName}`
                        : student.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.role === "pio" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Public Information Officer
                        </span>
                      ) : (
                        <span className="text-gray-600">Student</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 focus:ring-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          {/* Only show Assign PIO option if user is not PIO */}
                          {!isCurrentUserPIO && student.role !== "pio" && (
                            <DropdownMenuItem
                              onClick={() => openAssignRoleModal(student)}
                              className="cursor-pointer"
                            >
                              Assign Public Information Officer
                            </DropdownMenuItem>
                          )}

                          {/* Only show Revert option if user is not PIO */}
                          {!isCurrentUserPIO && student.role === "pio" && (
                            <DropdownMenuItem
                              onClick={() => openRevertRoleModal(student)}
                              className="cursor-pointer"
                            >
                              Revert to Student
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => openRemoveModal(student)}
                            className="cursor-pointer text-red-600"
                          >
                            Remove Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={showAddModal}
        onOpenChange={(open) => {
          if (!isLocalMutating) {
            setShowAddModal(open);
            if (!open) {
              // Reset state when closing modal
              setTimeout(() => {
                setAddStudentSearchQuery("");
                setStudentToAdd(null);
                setAddStudentError("");
              }, 300);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          onPointerDownOutside={(e) => {
            if (isLocalMutating) e.preventDefault();
            const resultsDropdown = e.target.closest("[data-results-dropdown]");
            if (resultsDropdown) {
              e.preventDefault();
            }
          }}
          aria-describedby="add-student-description"
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
                    if (studentToAdd) setStudentToAdd(null);
                  }}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={!!studentToAdd || isLocalMutating}
                />
                {isSearchingStudents && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    Searching...
                  </span>
                )}
                {!studentToAdd && searchResults.length > 0 && (
                  <div
                    data-results-dropdown
                    className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200"
                  >
                    {searchResults.map((student) => (
                      <div
                        key={student._id || student.id}
                        className="cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50"
                        onClick={() => handleSelectSearchResult(student)}
                        role="option"
                        aria-selected="false"
                      >
                        <p className="font-medium block truncate text-gray-900">
                          {student.firstName && student.lastName
                            ? `${student.firstName} ${student.lastName}`
                            : student.name}
                        </p>
                        <p className="text-gray-500 block text-sm">
                          {student.studentNumber || student.id}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {!studentToAdd &&
                  addStudentSearchQuery &&
                  !isSearchingStudents &&
                  searchResults.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No matching students found.
                    </p>
                  )}
              </div>
            </div>

            {studentToAdd && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Selected:{" "}
                    {studentToAdd.firstName && studentToAdd.lastName
                      ? `${studentToAdd.firstName} ${studentToAdd.lastName}`
                      : studentToAdd.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    {studentToAdd.studentNumber || studentToAdd.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStudentToAdd(null);
                    setAddStudentSearchQuery("");
                  }}
                  className="text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  disabled={isLocalMutating}
                >
                  Change
                </Button>
              </div>
            )}

            {addStudentError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {addStudentError}
              </div>
            )}

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
              disabled={isLocalMutating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLocalMutating || !studentToAdd}
            >
              {isLocalMutating ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAssignRoleModal}
        onOpenChange={(open) => {
          if (!isLocalMutating && !isAssigningPIO) {
            setShowAssignRoleModal(open);
            if (!open) {
              // Reset state when closing modal
              setTimeout(() => {
                setStudentToAssignRole(null);
              }, 300);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="assign-role-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Assign Public Information Officer Role
            </DialogTitle>
            <DialogDescription id="assign-role-description">
              You are about to assign a student as the Public Information
              Officer for this class.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-gray-600">
            <div className="mb-4">
              Are you sure you want to assign{" "}
              <span className="font-medium">
                {studentToAssignRole?.firstName && studentToAssignRole?.lastName
                  ? `${studentToAssignRole.firstName} ${studentToAssignRole.lastName}`
                  : studentToAssignRole?.name}
              </span>{" "}
              ({studentToAssignRole?.studentNumber || studentToAssignRole?.id})
              as a Public Information Officer?
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded text-sm mb-4">
              <strong>Important:</strong> Only one Public Information Officer
              can be assigned per year level. If a PIO already exists for this
              year, you must first revert their role or remove them before
              assigning a new PIO.
            </div>
          </div>

          {/* Show error in the modal if there is one */}
          {assignPIOError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
              {assignPIOError.message ||
                assignPIOError.error ||
                "Failed to assign PIO role"}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeAssignRoleModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isAssigningPIO}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isAssigningPIO}
            >
              {isAssigningPIO
                ? "Assigning..."
                : "Assign Public Information Officer Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRemoveModal}
        onOpenChange={(open) => {
          if (!isLocalMutating && !isRemovingUser) {
            setShowRemoveModal(open);
            if (!open) {
              // Reset state when closing modal
              setTimeout(() => {
                setStudentToRemove(null);
              }, 300);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="remove-student-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Remove Student
            </DialogTitle>
            <DialogDescription id="remove-student-description">
              This action will remove the student from this class.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-gray-600">
            Are you sure you want to remove{" "}
            <span className="font-medium">
              {studentToRemove?.firstName && studentToRemove?.lastName
                ? `${studentToRemove.firstName} ${studentToRemove.lastName}`
                : studentToRemove?.name}
            </span>{" "}
            ({studentToRemove?.studentNumber || studentToRemove?.id}) from{" "}
            {currentProgram.name} - Year {selectedYear}? This action cannot be
            undone.
          </div>

          {/* Show error in the modal if there is one */}
          {removeUserError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
              {removeUserError.message ||
                removeUserError.error ||
                "Failed to remove student"}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeRemoveModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isRemovingUser}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveStudent}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              disabled={isRemovingUser}
            >
              {isRemovingUser ? "Removing..." : "Remove Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRevertRoleModal}
        onOpenChange={(open) => {
          if (!isLocalMutating && !isRevertingPIO) {
            setShowRevertRoleModal(open);
            if (!open) {
              // Reset state when closing modal
              setTimeout(() => {
                setStudentToRevertRole(null);
              }, 300);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="revert-role-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Revert Public Information Officer to Student
            </DialogTitle>
            <DialogDescription id="revert-role-description">
              This action will remove the Public Information Officer role from
              this student.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-gray-600">
            <div className="mb-4">
              Are you sure you want to revert{" "}
              <span className="font-medium">
                {studentToRevertRole?.firstName && studentToRevertRole?.lastName
                  ? `${studentToRevertRole.firstName} ${studentToRevertRole.lastName}`
                  : studentToRevertRole?.name}
              </span>{" "}
              ({studentToRevertRole?.studentNumber || studentToRevertRole?.id})
              back to a regular student?
            </div>
            <div>
              This will remove their Public Information Officer privileges for{" "}
              {currentProgram.name} - Year {selectedYear}.
            </div>
          </div>

          {/* Show error in the modal if there is one */}
          {revertPIOError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
              {revertPIOError.message ||
                revertPIOError.error ||
                "Failed to revert PIO role"}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeRevertRoleModal}
              className="w-full sm:w-auto border-gray-300"
              disabled={isRevertingPIO}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevertRole}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isRevertingPIO}
            >
              {isRevertingPIO ? "Reverting..." : "Revert to Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
