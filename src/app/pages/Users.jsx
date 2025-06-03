import { useState } from 'react';
import { useUsersPage, useSearchUsers } from '@/hooks/useUsersQuery';
import { Search, MoreHorizontal, Plus, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const programsData = [
  { id: 'bsis', name: 'Bachelor of Science in Information Systems', years: 4 },
  { id: 'act', name: 'Associate in Computer Technology', years: 2 }
];

const Users = () => {
  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [selectedProgramId, setSelectedProgramId] = useState(programsData[0].id);
  const [selectedYear, setSelectedYear] = useState('1');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToAssignRole, setStudentToAssignRole] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // Add student modal states
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState('');
  const [studentToAdd, setStudentToAdd] = useState(null);

  // React Query hooks
  const {
    students,
    isLoading,
    error,
    refetch,
    assignPIO,
    removeUser,
    isAssigningPIO,
    isRemovingUser,
    isMutating,
  } = useUsersPage(selectedProgramId, selectedYear);

  // Search users hook for add student modal
  const { data: searchResults = [], isLoading: isSearchingStudents } = useSearchUsers(
    addStudentSearchQuery,
    { enabled: addStudentSearchQuery.length > 2 }
  );

  // Computed values
  const currentProgram = programsData.find(p => p.id === selectedProgramId) || programsData[0];

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter(student => {
      // Search filter
      const searchMatch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Gender filter
      const genderMatch = filterOption === 'all' || 
        (filterOption === 'girls' && student.gender === 'female') ||
        (filterOption === 'boys' && student.gender === 'male');
      
      return searchMatch && genderMatch;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Event handlers
  const handleProgramChange = (programId) => {
    if (programId !== selectedProgramId) {
      setSelectedProgramId(programId);
      setSelectedYear('1');
      setSearchQuery('');
      setFilterOption('all');
    }
  };

  const handleYearChange = (year) => {
    if (year !== selectedYear) {
      setSelectedYear(year);
      setSearchQuery('');
      setFilterOption('all');
    }
  };

  const handleNavigate = (section) => {
    console.log("Simulating navigation to: " + section);
    if (section === 'students_summary') {
      alert("Navigate to Students Summary/Analytics Page (Implementation Needed)");
    }
  };

  // Modal handlers
  const openAddStudentModal = () => {
    setShowAddModal(true);
    setAddStudentSearchQuery('');
    setStudentToAdd(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddStudentSearchQuery('');
    setStudentToAdd(null);
  };

  const openAssignRoleModal = (student) => {
    setStudentToAssignRole(student);
    setShowAssignRoleModal(true);
  };

  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    setStudentToAssignRole(null);
  };

  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setStudentToRemove(null);
  };

  const handleSelectSearchResult = (student) => {
    setStudentToAdd(student);
    setAddStudentSearchQuery(student.name);
  };

  const handleAddStudent = async () => {
    if (!studentToAdd) return;

    // Check for existing student
    const isDuplicate = students.some(student => student.id === studentToAdd.id);
    if (isDuplicate) {
      // Handle error - could use toast or set error state
      return;
    }

    // This would need to be implemented in the backend
    // For now, we'll just close the modal
    closeAddModal();
  };

  const handleAssignRole = async () => {
    if (!studentToAssignRole) return;
    
    assignPIO({
      userId: studentToAssignRole.id,
      assignedClass: `${selectedProgramId.toUpperCase()}-${selectedYear}`
    });
    
    closeAssignRoleModal();
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    
    removeUser(studentToRemove.id);
    closeRemoveModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-500 mb-6 flex-wrap">
        <button
          onClick={() => handleNavigate('students_summary')}
          className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1 py-0.5"
        >
          Students
        </button>
        <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
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
        <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
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
              <SelectItem value="girls">Girls Only</SelectItem>
              <SelectItem value="boys">Boys Only</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={openAddStudentModal}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-sm"
            disabled={isLoading || isMutating}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Student
          </Button>
        </div>
      </div>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error.message}</span>
          <button
            onClick={() => refetch()}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            <span className="text-xl" aria-hidden="true">
              ↻
            </span>
            <span className="sr-only">Retry</span>
          </button>
        </div>
      )}
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
                    {searchQuery || filterOption !== 'all'
                      ? 'No students match your current search/filter criteria.'
                      : 'No students found in this class/year.'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  >
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
                      {student.role === 'PIO' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          PIO
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isMutating}
                          >
                            <span className="sr-only">
                              Open options for {student.name}
                            </span>
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border border-gray-200 shadow-md"
                        >
                          {student.role !== 'PIO' && (
                            <DropdownMenuItem
                              onClick={() => openAssignRoleModal(student)}
                              className="cursor-pointer hover:bg-gray-100 text-sm"
                              disabled={isMutating}
                            >
                              Assign PIO Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openRemoveModal(student)}
                            className="cursor-pointer hover:bg-red-50 text-red-600 text-sm"
                            disabled={isMutating}
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="sm:max-w-lg"
          onPointerDownOutside={(e) => {
            const resultsDropdown = e.target.closest('[data-results-dropdown]');
            if (resultsDropdown) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add Student to Class
            </DialogTitle>
            <DialogDescription>
              Search for a student and add them to {currentProgram.name} - Year{' '}
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
                  disabled={!!studentToAdd || isMutating}
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
                        key={student.id}
                        className="cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50"
                        onClick={() => handleSelectSearchResult(student)}
                        role="option"
                        aria-selected="false"
                      >
                        <p className="font-medium block truncate text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-gray-500 block text-sm">{student.id}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!studentToAdd && addStudentSearchQuery && !isSearchingStudents &&
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
                    Selected: {studentToAdd.name}
                  </p>
                  <p className="text-xs text-blue-600">{studentToAdd.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStudentToAdd(null);
                    setAddStudentSearchQuery('');
                  }}
                  className="text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  disabled={isMutating}
                >
                  Change
                </Button>
              </div>
            )}

            <p className="text-sm text-gray-600">
              This student will be added to:{' '}
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
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isMutating || !studentToAdd}
            >
              {isMutating ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignRoleModal} onOpenChange={setShowAssignRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Assign PIO Role
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4 text-gray-600">
            Are you sure you want to assign{' '}
            <span className="font-medium">{studentToAssignRole?.name}</span> (
            {studentToAssignRole?.id}) as a PIO (Peer Information Officer)?
          </DialogDescription>
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
              {isAssigningPIO ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Remove Student
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4 text-gray-600">
            Are you sure you want to remove{' '}
            <span className="font-medium">{studentToRemove?.name}</span> (
            {studentToRemove?.id}) from {currentProgram.name} - Year{' '}
            {selectedYear}? This action cannot be undone.
          </DialogDescription>
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
              {isRemovingUser ? 'Removing...' : 'Remove Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
