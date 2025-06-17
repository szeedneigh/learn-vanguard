import { useState, useEffect, useCallback } from "react";
import { Search, User, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUsers } from "@/lib/api/userApi";
import { programsData } from "@/lib/constants";
import PropTypes from "prop-types";

const MoveStudentModal = ({ isOpen, onClose, onMoveSuccess }) => {
  const { toast } = useToast();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Move form state
  const [targetCourse, setTargetCourse] = useState("");
  const [targetYearLevel, setTargetYearLevel] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  // Available year levels based on selected course
  const getAvailableYearLevels = useCallback((course) => {
    if (course === "Associate in Computer Technology") {
      return ["First Year", "Second Year"];
    } else if (course === "Bachelor of Science in Information Systems") {
      return ["First Year", "Second Year", "Third Year", "Fourth Year"];
    }
    return [];
  }, []);

  // Search for users
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await getUsers({
        search: query,
        isEmailVerified: true, // Only show verified users
      });

      if (result.success) {
        setSearchResults(result.data || []);
      } else {
        console.error("Search failed:", result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
      setTargetCourse("");
      setTargetYearLevel("");
      setIsMoving(false);
    }
  }, [isOpen]);

  // Reset year level when course changes
  useEffect(() => {
    if (targetCourse) {
      setTargetYearLevel("");
    }
  }, [targetCourse]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.firstName} ${user.lastName} (${user.studentNumber})`);
    setSearchResults([]);
  };

  const handleMove = async () => {
    if (!selectedUser || !targetCourse || !targetYearLevel) {
      toast({
        title: "Missing Information",
        description: "Please select a user, target course, and year level.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is already in target class
    if (selectedUser.course === targetCourse && selectedUser.yearLevel === targetYearLevel) {
      toast({
        title: "Invalid Move",
        description: "User is already in the selected class.",
        variant: "destructive",
      });
      return;
    }

    setIsMoving(true);
    try {
      await onMoveSuccess(selectedUser._id, {
        targetCourse,
        targetYearLevel,
      });
      onClose();
    } catch (error) {
      console.error("Move failed:", error);
    } finally {
      setIsMoving(false);
    }
  };

  const formatUserRole = (role) => {
    return role === "pio" ? "Public Information Officer" : "Student";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Move Student to Class</DialogTitle>
          <DialogDescription>
            Search for a verified user and move them to a different class. PIOs will be converted to Students when moved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <Label htmlFor="user-search">Search for User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="user-search"
                placeholder="Search by name, student number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={isMoving}
              />
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="text-sm text-gray-500 text-center py-2">
                Searching...
              </div>
            )}

            {searchResults.length > 0 && !selectedUser && (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.studentNumber} • {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {formatUserRole(user.role)}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {user.course} - {user.yearLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedUser.studentNumber} • {selectedUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {formatUserRole(selectedUser.role)}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Current: {selectedUser.course} - {selectedUser.yearLevel}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Class Selection */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <Label>Move to Class</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-course">Target Course</Label>
                  <Select
                    value={targetCourse}
                    onValueChange={setTargetCourse}
                    disabled={isMoving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {programsData.map((program) => (
                        <SelectItem key={program.id} value={program.name}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-year">Target Year Level</Label>
                  <Select
                    value={targetYearLevel}
                    onValueChange={setTargetYearLevel}
                    disabled={!targetCourse || isMoving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYearLevels(targetCourse).map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {targetCourse && targetYearLevel && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm">
                    <strong>Preview:</strong> {selectedUser.firstName} {selectedUser.lastName} will be moved from{" "}
                    <span className="font-medium">{selectedUser.course} - {selectedUser.yearLevel}</span> to{" "}
                    <span className="font-medium">{targetCourse} - {targetYearLevel}</span>
                    {selectedUser.role === "pio" && (
                      <span className="text-orange-600"> (Role will change from PIO to Student)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedUser || !targetCourse || !targetYearLevel || isMoving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isMoving ? "Moving..." : "Move Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

MoveStudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMoveSuccess: PropTypes.func.isRequired,
};

export default MoveStudentModal;
