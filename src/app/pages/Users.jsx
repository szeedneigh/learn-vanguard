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
import { useToast } from "@/hooks/use-toast";
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

function Users() {
  const { toast } = useToast();
  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProgramId, setSelectedProgramId] = useState(
    programsData[0].id
  );
  const [selectedYear, setSelectedYear] = useState("1");

  // Remove modal states since we're using toast notifications
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentToAdd, setStudentToAdd] = useState(null);
  const [addStudentError, setAddStudentError] = useState("");
  const [studentToAssignRole, setStudentToAssignRole] = useState(null);
  const [studentToRevertRole, setStudentToRevertRole] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Remove add student modal states
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState("");

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
    assignPIOError,
    revertPIOError,
    removeUserError,
  } = useUsersPage(selectedProgramId, selectedYear);

  // Remove search users hook for add student modal
  // const { data: searchResults = [], isLoading: isSearchingStudents } =
  //   useSearchUsers(addStudentSearchQuery, {
  //     enabled: addStudentSearchQuery.length > 2,
  //   });

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
  // const openAddStudentModal = () => {
  //   // Don't open modal if user is PIO
  //   if (isCurrentUserPIO) return;

  //   setShowAddModal(true);
  //   setAddStudentSearchQuery("");
  //   setStudentToAdd(null);
  //   setAddStudentError("");
  // };

  // const closeAddModal = () => {
  //   setShowAddModal(false);
  //   setStudentToAdd(null);
  //   setAddStudentError("");
  // };

  const openAssignRoleModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToAssignRole(student);
    toast({
      title: "Assign Public Information Officer Role?",
      description: `Are you sure you want to assign ${
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.name
      } as a Public Information Officer for ${
        currentProgram.name
      } - Year ${selectedYear}?`,
      action: (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleAssignRole();
            }}
          >
            Assign
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStudentToAssignRole(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const openRemoveModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToRemove(student);
    toast({
      title: "Remove Student?",
      description: `Are you sure you want to remove ${
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.name
      } from ${
        currentProgram.name
      } - Year ${selectedYear}? This action cannot be undone.`,
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              handleRemoveStudent();
            }}
          >
            Remove
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStudentToRemove(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const openRevertRoleModal = (student) => {
    // Don't open modal if user is PIO
    if (isCurrentUserPIO) return;

    setStudentToRevertRole(student);
    toast({
      title: "Revert Public Information Officer Role?",
      description: `Are you sure you want to revert ${
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.name
      } back to a regular student in ${
        currentProgram.name
      } - Year ${selectedYear}?`,
      action: (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleRevertRole();
            }}
          >
            Revert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStudentToRevertRole(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
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
      // closeAddModal();
      refetch();

      // Show success toast
      toast({
        title: "Student Added",
        description: `${
          studentToAdd.firstName && studentToAdd.lastName
            ? `${studentToAdd.firstName} ${studentToAdd.lastName}`
            : studentToAdd.name
        } has been added to ${currentProgram.name} - Year ${selectedYear}`,
      });
    } catch (error) {
      console.error("Error adding student:", error);
      setAddStudentError(
        error.message || "Failed to add student. Please try again."
      );
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
      setStudentToRemove(null);
      refetch();

      // Show success toast
      toast({
        title: "Student Removed",
        description: `${
          studentToRemove.firstName && studentToRemove.lastName
            ? `${studentToRemove.firstName} ${studentToRemove.lastName}`
            : studentToRemove.name
        } has been removed from ${currentProgram.name} - Year ${selectedYear}`,
      });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
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
      setStudentToAssignRole(null);
      refetch();

      // Show success toast
      toast({
        title: "Role Assigned",
        description: `${
          studentToAssignRole.firstName && studentToAssignRole.lastName
            ? `${studentToAssignRole.firstName} ${studentToAssignRole.lastName}`
            : studentToAssignRole.name
        } has been assigned as Public Information Officer for ${
          currentProgram.name
        } - Year ${selectedYear}`,
      });
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
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

      // Close modal and refetch data on success
      setStudentToRevertRole(null);
      refetch();

      // Show success toast
      toast({
        title: "Role Reverted",
        description: `${
          studentToRevertRole.firstName && studentToRevertRole.lastName
            ? `${studentToRevertRole.firstName} ${studentToRevertRole.lastName}`
            : studentToRevertRole.name
        } has been reverted to a regular student in ${
          currentProgram.name
        } - Year ${selectedYear}`,
      });
    } catch (error) {
      console.error("Error reverting role:", error);
      toast({
        title: "Error",
        description: "Failed to revert role. Please try again.",
        variant: "destructive",
      });
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
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
      </div>
    );
  } catch (error) {
    console.error("Render error in Users component:", error);
    return null; // Return null while we set the error state
  }
}

export default Users;
