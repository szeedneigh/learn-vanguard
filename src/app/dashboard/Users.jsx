import React, { useState, useEffect, useCallback } from 'react';
import { Search, MoreHorizontal, Plus, ChevronRight } from 'lucide-react'; // Added ChevronDown
// Assuming shadcn/ui components are correctly set up in '@/components/ui/'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel, // Added for clarity
  DropdownMenuSeparator // Added for visual separation
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
// Placeholder for a notification system (e.g., shadcn/ui Sonner or react-toastify)
// import { useToast } from "@/components/ui/use-toast"; // Example import

// --- Mock Data and API Functions ---
// Replace these with actual API calls and data fetching logic

// Available programs
const programsData = [
  { id: 'bsis', name: 'Bachelor of Science in Information Systems', years: 4 },
  { id: 'act', name: 'Associate in Computer Technology', years: 2 }
];

// Example student data (represents students already in the selected class/year)
const initialStudentsData = [
  { id: '21-00001CJ', name: 'John Chen', email: 'johnchen@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1 },
  { id: '21-00002DB', name: 'Barbie Dela Cruz', email: 'barbiedelacruz@student.lxverdad', gender: 'female', role: 'PIO', programId: 'bsis', year: 1 },
  { id: '21-00003FL', name: 'Luca Ferrari', email: 'lucaferrari@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1 },
  { id: '21-00004KA', name: 'Aisha Khan', email: 'aishakhan@student.lxverdad', gender: 'female', role: null, programId: 'bsis', year: 1 },
  { id: '21-00005MS', name: 'Sofia Martinez', email: 'sofiamartinez@student.lxverdad', gender: 'female', role: null, programId: 'bsis', year: 1 },
  { id: '21-00006ML', name: 'Liam Muller', email: 'liammuller@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1 },
  // Add more students for different programs/years if needed for testing
  { id: '22-10001AB', name: 'Anna Bell', email: 'annabell@student.lxverdad', gender: 'female', role: null, programId: 'act', year: 1 },
  { id: '22-10002CD', name: 'Carl Davis', email: 'carldavis@student.lxverdad', gender: 'male', role: null, programId: 'act', year: 1 },
];

// Mock function to fetch students for a specific program and year
const fetchStudentsAPI = async (programId, year) => {
  console.log(`API CALL: Fetching students for program ${programId}, year ${year}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, filter data based on programId and year from the API
  const filteredStudents = initialStudentsData.filter(s => s.programId === programId && s.year === parseInt(year));
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
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  // This should search a broader database of students
  const mockResults = [
    { id: '22-00007RT', name: 'Ryan Thompson', email: 'ryanthompson@student.lxverdad', gender: 'male' },
    { id: '22-00008EJ', name: 'Emma Johnson', email: 'emmajohnson@student.lxverdad', gender: 'female' },
    { id: '22-00009AK', name: 'Alex Kim', email: 'alexkim@student.lxverdad', gender: 'male' },
    { id: '23-00010BC', name: 'Ben Carter', email: 'bencarter@student.lxverdad', gender: 'male' },
    // Ensure mock results don't include students already in the initial list for clarity
  ].filter(s => (s.name.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase())) && !initialStudentsData.some(is => is.id === s.id));
  // Simulate API success
  return mockResults;
  // Simulate API error:
  // throw new Error("Search failed");
};

// Mock function to add a student to a class/year
const addStudentAPI = async (studentId, programId, year) => {
  console.log(`API CALL: Adding student ${studentId} to program ${programId}, year ${year}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, the backend would handle this. 
  // For the frontend simulation, we'll add the student to our local state upon success.
  // Simulate API success
  return { success: true };
  // Simulate API error:
  // throw new Error("Failed to add student");
};

// Mock function to assign PIO role
const assignRoleAPI = async (studentId, role) => {
  console.log(`API CALL: Assigning role ${role} to student ${studentId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Simulate API success
  return { success: true };
  // Simulate API error:
  // throw new Error("Failed to assign role");
};

// Mock function to remove a student from a class/year
const removeStudentAPI = async (studentId, programId, year) => {
  console.log(`API CALL: Removing student ${studentId} from program ${programId}, year ${year}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Simulate API success
  return { success: true };
  // Simulate API error:
  // throw new Error("Failed to remove student");
};

// --- Component ---

const Users = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState(''); // For filtering the main student list
  const [filterOption, setFilterOption] = useState('all'); // 'all', 'girls', 'boys'
  const [programs, setPrograms] = useState(programsData); // Could be fetched from API
  const [selectedProgramId, setSelectedProgramId] = useState(programsData[0].id); // Default to first program
  const [selectedYear, setSelectedYear] = useState('1'); // Default to year 1
  
  const [students, setStudents] = useState([]); // Students currently displayed for the selected program/year
  const [isLoading, setIsLoading] = useState(false); // For loading indicators (main page data)
  const [isActionLoading, setIsActionLoading] = useState(false); // Separate loading state for modal actions (add, assign, remove)
  const [error, setError] = useState(null); // For displaying errors

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState(''); // Search query inside the modal
  const [addStudentSearchResults, setAddStudentSearchResults] = useState([]); // Results for the modal search
  const [studentToAdd, setStudentToAdd] = useState(null); // Student selected from search results
  const [isSearchingStudents, setIsSearchingStudents] = useState(false); // Loading state for modal search

  // Assign Role Modal State
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [studentToAssignRole, setStudentToAssignRole] = useState(null);

  // Remove Student Modal State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Placeholder for toast notifications
  // const { toast } = useToast(); // Uncomment and use if you have a toast system

  // --- Derived State ---
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

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
        setSelectedYear('1'); // Reset to year 1 when changing programs
        setSearchQuery(''); // Clear search when changing context
        setFilterOption('all'); // Reset filter
    }
  };

  // Handles selecting a year tab
  const handleYearChange = (year) => {
    if (year !== selectedYear) {
        setSelectedYear(year);
        setSearchQuery(''); // Clear search
        setFilterOption('all'); // Reset filter
    }
  };

  // Filter and sort students for display
  const getFilteredAndSortedStudents = useCallback(() => {
    // Filter by search query (main list)
    const queryFiltered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) || // Also search by ID
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) // Also search by email
    );

    // Filter by gender
    let genderFiltered;
    if (filterOption === 'girls') {
      genderFiltered = queryFiltered.filter(student => student.gender === 'female');
    } else if (filterOption === 'boys') {
      genderFiltered = queryFiltered.filter(student => student.gender === 'male');
    } else {
      genderFiltered = queryFiltered;
    }

    // Sort alphabetically by name
    return [...genderFiltered].sort((a, b) => a.name.localeCompare(b.name));
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
    setAddStudentSearchQuery('');
    setAddStudentSearchResults([]);
    setStudentToAdd(null);
  };

  // Close Modals and Reset State
  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset state on close
    setAddStudentSearchQuery('');
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
          year: parseInt(selectedYear) 
      };
      // Add to the list and re-sort
      setStudents(prev => [...prev, newStudentEntry].sort((a, b) => a.name.localeCompare(b.name)));

      console.log(`Added ${studentToAdd.name} to ${currentProgram.name} Year ${selectedYear}.`);
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
      await assignRoleAPI(studentToAssignRole.id, 'PIO');

      // Update the role in the local state
      setStudents(prev =>
        prev.map(student =>
          student.id === studentToAssignRole.id
            ? { ...student, role: 'PIO' }
            : student
        )
      );

      console.log(`${studentToAssignRole.name} has been assigned as PIO.`);
      // toast({ title: "Role Assigned", description: `${studentToAssignRole.name} is now a PIO.` }); // Example toast
      closeAssignRoleModal();

    } catch (err) {
      console.error("Error assigning role:", err);
      setError("Failed to assign role. Please try again.");
      // toast({ title: "Error", description: "Failed to assign role.", variant: "destructive" }); // Example toast
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
      await removeStudentAPI(studentToRemove.id, selectedProgramId, selectedYear);

      // Remove the student from the local state
      setStudents(prev => prev.filter(student => student.id !== studentToRemove.id));

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
    if (section === 'students_summary') {
      alert("Navigate to Students Summary/Analytics Page (Implementation Needed)");
      // Example: navigate('/students/summary');
    }
    // Navigation to program/year is handled by handleProgramChange/handleYearChange
  };


  // --- Render ---
  return (
    // Using padding utility for overall spacing
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      
      {/* --- Breadcrumb Navigation --- */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-500 mb-6 flex-wrap"> 
        {/* "Students" Link (to Summary/Analytics) */}
        <button
          onClick={() => handleNavigate('students_summary')}
          className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1 py-0.5"
        >
          Students
        </button>
        
        <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />

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
            {programs.map(program => (
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

        <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />

        {/* Current Year Display */}
        <span className="text-gray-500 px-1 py-0.5" aria-current="page">Year {selectedYear}</span>
      </nav>

      {/* Page Header */}
      {/* Removed the separate program selector */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{currentProgram.name} - Year {selectedYear}</h1>
      </div>

      {/* Year Tabs */}
      <div className="mb-6 overflow-x-auto"> 
        <Tabs
          value={selectedYear}
          onValueChange={handleYearChange} // Use the specific handler
          className="w-max" // Ensure tabs don't force wrap unnecessarily
        >
          <TabsList className="grid border border-gray-200 rounded-md p-0 h-auto"
            // Inline style is sometimes necessary for dynamic grids based on props
            style={{ gridTemplateColumns: `repeat(${currentProgram.years}, minmax(auto, 1fr))` }} 
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
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
          <Select value={filterOption} onValueChange={setFilterOption} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-36 border-gray-300 shadow-sm">
               <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="girls">Girls Only</SelectItem>
              <SelectItem value="boys">Boys Only</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Student Button */}
          <Button
            onClick={openAddStudentModal} // Use specific handler
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-sm"
            disabled={isLoading || isActionLoading} // Disable if loading data OR performing an action
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Display Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 rounded">
             <span className="text-xl" aria-hidden="true">×</span>
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
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    {/* Optional: Add a spinner icon here */}
                    Loading students...
                  </td>
                </tr>
              ) : sortedAndFilteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    {searchQuery || filterOption !== 'all' 
                      ? 'No students match your current search/filter criteria.' 
                      : 'No students found in this class/year.'}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    {/* Adjusted padding for table cells */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.role === 'PIO' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          PIO
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span> // Use a dash for no role
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isActionLoading} // Disable actions trigger while another action is loading
                          >
                            <span className="sr-only">Open options for {student.name}</span>
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border border-gray-200 shadow-md">
                          {/* Conditionally render Assign PIO only if not already PIO */}
                          {student.role !== 'PIO' && (
                            <DropdownMenuItem
                              onClick={() => openAssignRoleModal(student)} // Use specific handler
                              className="cursor-pointer hover:bg-gray-100 text-sm"
                              disabled={isActionLoading} // Disable during any action loading state
                            >
                              Assign PIO Role
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div> {/* End overflow-x-auto */}
      </div> {/* End table container */}


      {/* --- Modals --- */}

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        {/* Added preventDefault to stop modal closing when clicking search results */}
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
             // Check if the click target is inside the search results dropdown
             const resultsDropdown = e.target.closest('[data-results-dropdown]');
             if (resultsDropdown) {
                 e.preventDefault();
             }
         }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Student to Class</DialogTitle>
            <DialogDescription>
              Search for a student and add them to {currentProgram.name} - Year {selectedYear}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Search Input within Modal */}
            <div className="space-y-1">
              <label htmlFor="addStudentSearch" className="text-sm font-medium text-gray-700 block">
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
                   <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">Searching...</span>
                )}
                {/* Search Results Dropdown */}
                {!studentToAdd && addStudentSearchResults.length > 0 && (
                  // Added data attribute for the onPointerDownOutside check
                  <div data-results-dropdown className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200">
                    {addStudentSearchResults.map((student) => (
                      <div
                        key={student.id}
                        className="cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50"
                        onClick={() => handleSelectSearchResult(student)}
                        role="option" // Added role
                        aria-selected="false" // Indicate not selected
                      >
                        <p className="font-medium block truncate text-gray-900">{student.name}</p>
                        <p className="text-gray-500 block text-sm">{student.id}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* No results message */}
                 {!studentToAdd && addStudentSearchQuery && !isSearchingStudents && addStudentSearchResults.length === 0 && (
                     <p className="text-xs text-gray-500 mt-1">No matching students found.</p>
                 )}
              </div>
            </div>

            {/* Display Selected Student */}
            {studentToAdd && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-blue-800">Selected: {studentToAdd.name}</p>
                    <p className="text-xs text-blue-600">{studentToAdd.id}</p>
                 </div>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStudentToAdd(null); setAddStudentSearchQuery(''); }} 
                    className="text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                    disabled={isActionLoading} // Disable change button during action
                 >
                     Change
                 </Button>
              </div>
            )}
            
            {/* Note: Program/Year is determined by the main view context */}
            <p className="text-sm text-gray-600">
                This student will be added to: <span className="font-medium">{currentProgram.name} - Year {selectedYear}</span>.
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
              {isActionLoading ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Modal */}
      <Dialog open={showAssignRoleModal} onOpenChange={setShowAssignRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Assign PIO Role</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4 text-gray-600">
            Are you sure you want to assign <span className="font-medium">{studentToAssignRole?.name}</span> ({studentToAssignRole?.id}) as a PIO (Peer Information Officer)?
          </DialogDescription>
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
              onClick={handleAssignRole}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Modal */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">Remove Student</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4 text-gray-600">
            Are you sure you want to remove <span className="font-medium">{studentToRemove?.name}</span> ({studentToRemove?.id}) from {currentProgram.name} - Year {selectedYear}? This action cannot be undone.
          </DialogDescription>
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
              {isActionLoading ? 'Removing...' : 'Remove Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div> // End main container
  );
};

export default Users;
