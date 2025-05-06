import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Search, 
  UserPlus, 
  Filter, 
  ChevronDown, 
  X, 
  AlertCircle, 
  UserMinus, 
  UserCheck 
} from 'lucide-react';

// Mock data - programs and students
const programs = [
  { id: 'bsis', name: 'Bachelor of Science in Information Systems', years: 4, color: '#4f46e5' },
  { id: 'act', name: 'Associate in Computer Technology', years: 2, color: '#0ea5e9' }
];

const studentsData = [
  { id: '21-00001CJ', name: 'John Chen', email: 'johnchen@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1, attendance: 92, performance: 88, enrollmentDate: '2021-06-15' },
  { id: '21-00002DB', name: 'Barbie Dela Cruz', email: 'barbiedelacruz@student.lxverdad', gender: 'female', role: 'PIO', programId: 'bsis', year: 1, attendance: 98, performance: 95, enrollmentDate: '2021-06-12' },
  { id: '21-00003FL', name: 'Luca Ferrari', email: 'lucaferrari@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1, attendance: 85, performance: 82, enrollmentDate: '2021-06-14' },
  { id: '21-00004KA', name: 'Aisha Khan', email: 'aishakhan@student.lxverdad', gender: 'female', role: null, programId: 'bsis', year: 1, attendance: 94, performance: 91, enrollmentDate: '2021-06-10' },
  { id: '21-00005MS', name: 'Sofia Martinez', email: 'sofiamartinez@student.lxverdad', gender: 'female', role: null, programId: 'bsis', year: 1, attendance: 90, performance: 87, enrollmentDate: '2021-06-15' },
  { id: '21-00006ML', name: 'Liam Muller', email: 'liammuller@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 1, attendance: 88, performance: 84, enrollmentDate: '2021-06-11' },
  { id: '22-10001AB', name: 'Anna Bell', email: 'annabell@student.lxverdad', gender: 'female', role: null, programId: 'act', year: 1, attendance: 95, performance: 89, enrollmentDate: '2022-06-14' },
  { id: '22-10002CD', name: 'Carl Davis', email: 'carldavis@student.lxverdad', gender: 'male', role: null, programId: 'act', year: 1, attendance: 91, performance: 86, enrollmentDate: '2022-06-12' },
  { id: '20-00007JD', name: 'Jane Doe', email: 'janedoe@student.lxverdad', gender: 'female', role: 'PIO', programId: 'bsis', year: 2, attendance: 97, performance: 94, enrollmentDate: '2020-06-15' },
  { id: '20-00008JS', name: 'John Smith', email: 'johnsmith@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 2, attendance: 89, performance: 85, enrollmentDate: '2020-06-14' },
  { id: '20-00009AT', name: 'Ava Taylor', email: 'avataylor@student.lxverdad', gender: 'female', role: null, programId: 'bsis', year: 2, attendance: 93, performance: 90, enrollmentDate: '2020-06-10' },
  { id: '20-00010BW', name: 'Ben Wilson', email: 'benwilson@student.lxverdad', gender: 'male', role: null, programId: 'bsis', year: 2, attendance: 86, performance: 83, enrollmentDate: '2020-06-11' },
];

// Main Component
const Users = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('bsis');
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchAvailableQuery, setSearchAvailableQuery] = useState('');

  // Load students for the selected class
  useEffect(() => {
    const classStudents = studentsData.filter(
      student => student.programId === selectedProgram && student.year === selectedYear
    );
    setStudents(classStudents);
    applyFilters(classStudents, selectedFilter, searchQuery);
  }, [selectedProgram, selectedYear]);

  // Filter students when filter or search changes
  useEffect(() => {
    applyFilters(students, selectedFilter, searchQuery);
  }, [selectedFilter, searchQuery]);

  // Set available students for the Add Student modal
  useEffect(() => {
    // Get students who are not already in the selected class
    const notInClass = studentsData.filter(
      student => !(student.programId === selectedProgram && student.year === selectedYear)
    );
    setAvailableStudents(notInClass);
  }, [selectedProgram, selectedYear, students]);

  // Apply filters to the student list
  const applyFilters = (studentsList, filter, query) => {
    let result = [...studentsList];
    
    // Apply search query
    if (query) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.id.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    switch (filter) {
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'female':
        result = result.filter(student => student.gender === 'female');
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'male':
        result = result.filter(student => student.gender === 'male');
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredStudents(result);
  };

  // Add student to class
  const handleAddStudent = (student) => {
    // In a real app, you would call an API to update the student's class
    const updatedStudentsData = studentsData.map(s => {
      if (s.id === student.id) {
        return { ...s, programId: selectedProgram, year: selectedYear };
      }
      return s;
    });
    
    // Update our local state
    const updatedClassStudents = updatedStudentsData.filter(
      s => s.programId === selectedProgram && s.year === selectedYear
    );
    
    setStudents(updatedClassStudents);
    applyFilters(updatedClassStudents, selectedFilter, searchQuery);
    setIsAddModalOpen(false);
  };

  // Assign PIO role to student
  const handleAssignRole = () => {
    // In a real app, you would call an API to update the student's role
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        return { ...student, role: 'PIO' };
      }
      // Remove role from other students (only one PIO per class)
      if (student.role === 'PIO') {
        return { ...student, role: null };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    applyFilters(updatedStudents, selectedFilter, searchQuery);
    setIsAssignRoleModalOpen(false);
  };

  // Remove student from class
  const handleRemoveStudent = () => {
    // In a real app, you would call an API to update the student's class
    const updatedStudents = students.filter(student => student.id !== selectedStudent.id);
    setStudents(updatedStudents);
    applyFilters(updatedStudents, selectedFilter, searchQuery);
    setIsRemoveModalOpen(false);
  };

  // Get program name by ID
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  // Filter available students based on search query
  const filteredAvailableStudents = availableStudents.filter(student => 
    student.name.toLowerCase().includes(searchAvailableQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchAvailableQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-500 mb-6">
        <a href="#" className="font-medium text-blue-600">Students</a>
        <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <a href="#" className="text-gray-500">Users</a>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <p className="text-gray-600 mt-1">Manage students in their respective classes</p>
      </div>

      {/* Class Selection and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-start">
            {/* Class Selection */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Program Selector */}
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-full sm:w-72 bg-white border-gray-300">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Year Selector */}
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {programs.find(p => p.id === selectedProgram)?.years && 
                    [...Array(programs.find(p => p.id === selectedProgram).years)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Year {i + 1}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:flex-1">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
              
              {/* Filter Dropdown */}
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Filter</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="female">Girls (Alphabetical)</SelectItem>
                  <SelectItem value="male">Boys (Alphabetical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Student Button */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Student to Class</DialogTitle>
                  <DialogDescription>
                    Add a student to {getProgramName(selectedProgram)}, Year {selectedYear}
                  </DialogDescription>
                </DialogHeader>
                
                {/* Search Available Students */}
                <div className="relative my-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name or ID..."
                    value={searchAvailableQuery}
                    onChange={(e) => setSearchAvailableQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Available Students List */}
                <div className="max-h-72 overflow-y-auto border rounded-md">
                  {filteredAvailableStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No students available to add
                    </div>
                  ) : (
                    <Table>
                      <TableBody>
                        {filteredAvailableStudents.map(student => (
                          <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleAddStudent(student)}>
                            <TableCell className="py-2">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.id}</div>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {student.programId === 'bsis' ? 'BSIS' : 'ACT'} - Year {student.year}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                
                <DialogFooter className="sm:justify-between">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            Students in Class
            <Badge variant="outline" className="ml-2 text-xs font-normal bg-blue-50 text-blue-600">
              {filteredStudents.length} students
            </Badge>
          </CardTitle>
          <CardDescription>
            {getProgramName(selectedProgram)}, Year {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-sm mt-1">
                {searchQuery ? "Try a different search term" : "Add students to this class"}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-10 text-center">#</TableHead>
                    <TableHead className="w-1/4">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-center font-mono text-sm text-gray-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${student.gender === 'female' ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                          {student.gender === 'female' ? 'Female' : 'Male'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.role === 'PIO' ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            PIO
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Assign Role Button/Modal */}
                          <Dialog open={isAssignRoleModalOpen && selectedStudent?.id === student.id} 
                                 onOpenChange={(open) => {
                                   if (!open) setIsAssignRoleModalOpen(false);
                                   if (open) {
                                     setSelectedStudent(student);
                                     setIsAssignRoleModalOpen(true);
                                   }
                                 }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedStudent(student);
                                setIsAssignRoleModalOpen(true);
                              }} disabled={student.role === 'PIO'}>
                                <UserCheck className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Assign Role</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Assign PIO Role</DialogTitle>
                                <DialogDescription>
                                  Assign {student.name} as the PIO (Public Information Officer) for this class
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>
                                  This will assign {student.name} as the PIO for {getProgramName(selectedProgram)}, Year {selectedYear}.
                                  {students.some(s => s.role === 'PIO') && 
                                    " This will remove the PIO role from the current PIO."}
                                </p>
                              </div>
                              <DialogFooter className="sm:justify-between">
                                <Button variant="outline" onClick={() => setIsAssignRoleModalOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAssignRole}>
                                  Assign PIO
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Remove Student Button/Modal */}
                          <Dialog open={isRemoveModalOpen && selectedStudent?.id === student.id}
                                 onOpenChange={(open) => {
                                   if (!open) setIsRemoveModalOpen(false);
                                   if (open) {
                                     setSelectedStudent(student);
                                     setIsRemoveModalOpen(true);
                                   }
                                 }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => {
                                setSelectedStudent(student);
                                setIsRemoveModalOpen(true);
                              }}>
                                <UserMinus className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Remove</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Remove Student</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to remove this student from the class?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>
                                  This will remove <span className="font-medium">{student.name}</span> from {getProgramName(selectedProgram)}, Year {selectedYear}.
                                </p>
                              </div>
                              <DialogFooter className="sm:justify-between">
                                <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleRemoveStudent}>
                                  Remove
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <a href="/students/analytics" className="text-blue-600 hover:underline flex items-center">
            View Analytics <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Users;