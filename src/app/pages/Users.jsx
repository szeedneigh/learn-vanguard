import { useState } from "react";
import PropTypes from "prop-types";
import { useUsersPage, useSearchUsers } from "@/hooks/useUsersQuery";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/context/PermissionContext";
import { programsData } from "@/lib/constants";
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
import { PERMISSIONS } from "@/lib/constants";

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

// Add prop types for ErrorMessage
ErrorMessage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    error: PropTypes.string,
  }),
  onRetry: PropTypes.func,
};

const Users = () => {
  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProgramId, setSelectedProgramId] = useState(
    programsData[0].id
  );
  const [selectedYear, setSelectedYear] = useState("1");

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
    addUser,
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

  // Check if current user is a PIO - this will be used to disable actions
  const isCurrentUserPIO =
    user?.role === "pio" || user?.normalizedRole === "pio";

  // Check if current user is an admin - this will be used to show/hide actions
  const isCurrentUserAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.normalizedRole?.toLowerCase() === "admin" ||
    user?.role === "ADMIN";

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
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setShowAddModal(true);
    setAddStudentSearchQuery("");
    setStudentToAdd(null);
    setAddStudentError("");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset state immediately without setTimeout
    setAddStudentSearchQuery("");
    setStudentToAdd(null);
    setAddStudentError("");
  };

  const openAssignRoleModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToAssignRole(student);
    setShowAssignRoleModal(true);
  };

  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    // Reset state immediately without setTimeout
    setStudentToAssignRole(null);
  };

  const openRemoveModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    // Reset state immediately without setTimeout
    setStudentToRemove(null);
  };

  const openRevertRoleModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToRevertRole(student);
    setShowRevertRoleModal(true);
  };

  const closeRevertRoleModal = () => {
    setShowRevertRoleModal(false);
    // Reset state immediately without setTimeout
    setStudentToRevertRole(null);
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
    if (!studentToAdd) {
      setAddStudentError("Please select a student first");
      return;
    }

    try {
      // Clear any previous errors
      setAddStudentError("");

      // Use the appropriate API call from the useUsersPage hook
      await addUser({
        studentId: studentToAdd.id || studentToAdd._id,
        program: currentProgram.id,
        yearLevel: selectedYear,
      });

      // Close modal and refetch data on success
      closeAddModal();
      refetch();

      // Show success toast
      toast.success(
        `${
          studentToAdd.firstName && studentToAdd.lastName
            ? `${studentToAdd.firstName} ${studentToAdd.lastName}`
            : studentToAdd.name
        } has been added to ${currentProgram.name} - Year ${selectedYear}`
      );
    } catch (error) {
      console.error("Error adding student:", error);
      setAddStudentError(
        error.message || "Failed to add student. Please try again."
      );
    }
  };

  const handleAssignRole = async () => {
    if (!studentToAssignRole) return;

    try {
      await assignPIO({
        studentId: studentToAssignRole.id || studentToAssignRole._id,
        program: currentProgram.id,
        yearLevel: selectedYear,
      });

      // Close modal and refetch data on success
      closeAssignRoleModal();
      refetch();

      // Show success toast
      toast.success(
        `${
          studentToAssignRole.firstName && studentToAssignRole.lastName
            ? `${studentToAssignRole.firstName} ${studentToAssignRole.lastName}`
            : studentToAssignRole.name
        } is now a Public Information Officer`
      );
    } catch (error) {
      console.error("Error assigning PIO role:", error);
      // Close modal after a short delay to allow error display, then refetch
      setTimeout(() => {
        closeAssignRoleModal();
        // Optionally refetch to ensure data consistency
        refetch().catch((refetchError) => {
          console.error(
            "Error refetching after PIO assignment error:",
            refetchError
          );
        });
      }, 2000);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      await removeUser({
        studentId: studentToRemove.id || studentToRemove._id,
        program: currentProgram.id,
        yearLevel: selectedYear,
      });

      // Close modal and refetch data on success
      closeRemoveModal();
      refetch();

      // Show success toast
      toast.success(
        `${
          studentToRemove.firstName && studentToRemove.lastName
            ? `${studentToRemove.firstName} ${studentToRemove.lastName}`
            : studentToRemove.name
        } has been removed from ${currentProgram.name} - Year ${selectedYear}`
      );
    } catch (error) {
      console.error("Error removing student:", error);
      // Close modal after a short delay to allow error display, then refetch
      setTimeout(() => {
        closeRemoveModal();
        // Optionally refetch to ensure data consistency
        refetch().catch((refetchError) => {
          console.error(
            "Error refetching after student removal error:",
            refetchError
          );
        });
      }, 2000);
    }
  };

  const handleRevertRole = async () => {
    if (!studentToRevertRole) return;

    try {
      await revertPIO({
        studentId: studentToRevertRole.id || studentToRevertRole._id,
        program: currentProgram.id,
        yearLevel: selectedYear,
      });

      // Close modal first
      closeRevertRoleModal();

      // Show success toast
      toast.success(
        `${
          studentToRevertRole.firstName && studentToRevertRole.lastName
            ? `${studentToRevertRole.firstName} ${studentToRevertRole.lastName}`
            : studentToRevertRole.name
        } is now a regular student`
      );

      // Add a small delay before refetching to ensure backend has processed the change
      setTimeout(() => {
        // Try to refetch data
        refetch().catch((error) => {
          console.error("Error refetching after role revert:", error);
          // If refetch fails, reload the page as a fallback
          window.location.reload();
        });
      }, 500);
    } catch (error) {
      console.error("Error reverting PIO role:", error);
      // Error will be shown in the modal via the revertPIOError state
    }
  };

  // Error fallback UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 mb-4">
            An error occurred while rendering the users page. Please try
            refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Refresh Page
          </Button>
        </div>
        {error && (
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-64">
            {error.toString()}
          </pre>
        )}
      </div>
    );
  }

  // Wrap the render in try-catch
  try {
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
                <SelectValue placeholder="Filter By Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="pio">Public Information Officer</SelectItem>
                <SelectItem value="student">Students Only</SelectItem>
              </SelectContent>
            </Select>

            {isCurrentUserAdmin &&
              hasPermission(PERMISSIONS.MANAGE_STUDENTS) && (
                <Button
                  onClick={openAddStudentModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
                  disabled={isLoading}
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
                  {isCurrentUserAdmin && (
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
                      colSpan={isCurrentUserAdmin ? "5" : "4"}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : filteredAndSortedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isCurrentUserAdmin ? "5" : "4"}
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
                      {isCurrentUserAdmin && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 focus:ring-0"
                                disabled={false}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              {student.role !== "pio" && (
                                <DropdownMenuItem
                                  onClick={() => openAssignRoleModal(student)}
                                  className="cursor-pointer"
                                  disabled={false}
                                >
                                  Assign Public Information Officer
                                </DropdownMenuItem>
                              )}

                              {student.role === "pio" && (
                                <DropdownMenuItem
                                  onClick={() => openRevertRoleModal(student)}
                                  className="cursor-pointer"
                                  disabled={false}
                                >
                                  Revert to Student
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => openRemoveModal(student)}
                                className="cursor-pointer text-red-600"
                                disabled={false}
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
          </div>
        </div>

        <Dialog
          open={showAddModal}
          onOpenChange={(open) => {
            if (!isAssigningPIO) {
              setShowAddModal(open);
              if (!open) {
                setStudentToAdd(null);
                setAddStudentSearchQuery("");
                setAddStudentError("");
              }
            }
          }}
        >
          <DialogContent
            className="sm:max-w-lg"
            aria-describedby="add-student-description"
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Add Student to Class
              </DialogTitle>
              <DialogDescription id="add-student-description">
                Search for a student and add them to {currentProgram.name} -
                Year {selectedYear}.
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
                    disabled={!!studentToAdd || isAssigningPIO}
                  />
                  {isSearchingStudents && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      Searching...
                    </span>
                  )}
                  {!studentToAdd && searchResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200">
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
                    disabled={isAssigningPIO}
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
                disabled={isAssigningPIO}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isAssigningPIO || !studentToAdd}
              >
                {isAssigningPIO ? "Adding..." : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAssignRoleModal}
          onOpenChange={(open) => {
            // Allow closing the modal even during loading after a reasonable delay
            if (!isAssigningPIO || !open) {
              setShowAssignRoleModal(open);
              if (!open) {
                setStudentToAssignRole(null);
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
                  {studentToAssignRole?.firstName &&
                  studentToAssignRole?.lastName
                    ? `${studentToAssignRole.firstName} ${studentToAssignRole.lastName}`
                    : studentToAssignRole?.name}
                </span>{" "}
                ({studentToAssignRole?.studentNumber || studentToAssignRole?.id}
                ) as a Public Information Officer?
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
            // Allow closing the modal even during loading after a reasonable delay
            if (!isRemovingUser || !open) {
              setShowRemoveModal(open);
              if (!open) {
                setStudentToRemove(null);
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
            // Allow closing the modal even during loading after a reasonable delay
            if (!isRevertingPIO || !open) {
              setShowRevertRoleModal(open);
              if (!open) {
                setStudentToRevertRole(null);
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
                  {studentToRevertRole?.firstName &&
                  studentToRevertRole?.lastName
                    ? `${studentToRevertRole.firstName} ${studentToRevertRole.lastName}`
                    : studentToRevertRole?.name}
                </span>{" "}
                ({studentToRevertRole?.studentNumber || studentToRevertRole?.id}
                ) back to a regular student?
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
  } catch (error) {
    console.error("Render error in Users component:", error);
    return null; // Return null while we set the error state
  }
};

export default Users;
