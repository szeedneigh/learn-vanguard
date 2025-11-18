import logger from "@/utils/logger";
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createSubject } from "@/services/programService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";

const AddSubjectModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    programId: "bsis",
    yearLevel: "1",
    semester: "1st Semester",
    instructor: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  // Check user role and get assigned class info for PIO users
  const isPIO = user?.role === ROLES.PIO;
  const isAdmin = user?.role === ROLES.ADMIN;
  // Parse PIO assigned class information
  const assignedClassInfo = useMemo(() => {
    if (!isPIO || !user?.assignedClass) return null;
    const parts = user.assignedClass.split(" - ");
    if (parts.length !== 2) return null;
    const [course, yearLevel] = parts;
    // Map course names to programId
    const courseToProgram = {
      "Associate in Computer Technology": "act",
      "Bachelor of Science in Information Systems": "bsis",
    };
    // Map year level to numeric value
    const yearLevelToNumber = {
      "First Year": "1",
      "Second Year": "2",
      "Third Year": "3",
      "Fourth Year": "4",
    return {
      course,
      yearLevel,
      programId: courseToProgram[course],
      yearLevelNumber: yearLevelToNumber[yearLevel],
  }, [isPIO, user?.assignedClass]);
  // Define year level options based on selected program and user role
  const yearLevelOptions = useMemo(() => {
    if (isPIO && assignedClassInfo) {
      // PIO users can only create subjects for their assigned year level
      return [
        {
          value: assignedClassInfo.yearLevelNumber,
          label: assignedClassInfo.yearLevel,
        },
      ];
    }
    // Filter year levels based on selected program
    const isACT = formData.programId === "act";
    if (isACT) {
      // ACT is a 2-year program
        { value: "1", label: "First Year" },
        { value: "2", label: "Second Year" },
    } else {
      // BSIS is a 4-year program
        { value: "3", label: "Third Year" },
        { value: "4", label: "Fourth Year" },
  }, [isPIO, assignedClassInfo, formData.programId]);
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      const initialData = {
        name: "",
        description: "",
        programId:
          isPIO && assignedClassInfo ? assignedClassInfo.programId : "bsis",
        yearLevel:
          isPIO && assignedClassInfo ? assignedClassInfo.yearLevelNumber : "1",
        semester: "1st Semester",
        instructor: "",
      };
      setFormData(initialData);
      setErrors({});
      setIsSubmitting(false);
  }, [isOpen, isPIO, assignedClassInfo]);
  // Enforce PIO restrictions when assignedClassInfo becomes available
    if (isPIO && assignedClassInfo && isOpen) {
      logger.log("[AddSubjectModal] Enforcing PIO restrictions:", {
        currentProgramId: formData.programId,
        currentYearLevel: formData.yearLevel,
        requiredProgramId: assignedClassInfo.programId,
        requiredYearLevel: assignedClassInfo.yearLevelNumber,
      });
      // Force correct values for PIO users
      if (formData.programId !== assignedClassInfo.programId) {
        setFormData((prev) => ({
          ...prev,
          programId: assignedClassInfo.programId,
        }));
      }
      if (formData.yearLevel !== assignedClassInfo.yearLevelNumber) {
          yearLevel: assignedClassInfo.yearLevelNumber,
  }, [
    isPIO,
    assignedClassInfo,
    isOpen,
    formData.programId,
    formData.yearLevel,
  ]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    if (!formData.programId) {
      newErrors.programId = "Program is required";
    if (!formData.yearLevel) {
      newErrors.yearLevel = "Year level is required";
    if (!formData.semester) {
      newErrors.semester = "Semester is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    // Final validation for PIO users
      if (
        formData.programId !== assignedClassInfo.programId ||
        formData.yearLevel !== assignedClassInfo.yearLevelNumber
      ) {
        logger.error(
          "[AddSubjectModal] PIO restriction violation detected at submit:",
          {
            submittedProgramId: formData.programId,
            submittedYearLevel: formData.yearLevel,
            requiredProgramId: assignedClassInfo.programId,
            requiredYearLevel: assignedClassInfo.yearLevelNumber,
          }
        );
        setErrors({
          form: "PIO users can only create subjects for their assigned class. Please refresh the page and try again.",
        });
        return;
    setIsSubmitting(true);
    try {
      // Debug user object
      logger.log("Current user data:", user);
      // Prepare subject data with correct user ID format
      const subjectData = {
        ...formData,
        // Try different formats of user ID that might be expected by the backend
        createdBy: user?.userId || user?.id || user?._id,
      // Log the data being sent
      logger.log("Sending subject data:", subjectData);
      if (!subjectData.createdBy) {
        logger.error("No user ID available for createdBy field");
        throw new Error(
          "User ID not available. Please try logging out and back in."
      const result = await createSubject(subjectData);
      if (result) {
        if (onSuccess) {
          onSuccess(result);
        }
        onClose();
    } catch (error) {
      logger.error("Failed to create subject:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create subject. Please try again.",
        variant: "destructive",
        form: error.message || "Failed to create subject",
    } finally {
  const handleModalClose = (open) => {
    // Only call onClose when the dialog is closing
    if (!open) {
      onClose();
  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              {errors.form}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">
              Subject Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
              placeholder="e.g. Introduction to Computing"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              placeholder="Brief description about the subject"
              rows={3}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="programId">
                Program <span className="text-red-600">*</span>
                {isPIO && (
                  <Lock className="inline w-3 h-3 ml-1 text-gray-500" />
                )}
              </Label>
              <Select
                value={formData.programId}
                onValueChange={(value) => {
                  if (!isPIO) {
                    handleInputChange({
                      target: { name: "programId", value },
                    });
                  }
                }}
                disabled={isPIO}
              >
                <SelectTrigger
                  id="programId"
                  className={`${errors.programId ? "border-red-500" : ""} ${
                    isPIO ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                >
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bsis">BS Information Systems</SelectItem>
                  <SelectItem value="act">
                    Associates in Computer Technology
                  </SelectItem>
                </SelectContent>
              </Select>
              {isPIO && assignedClassInfo && (
                <p className="text-xs text-gray-600 flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Restricted to your assigned program:{" "}
                  {assignedClassInfo.course}
                </p>
              )}
              {errors.programId && (
                <p className="text-red-500 text-xs mt-1">{errors.programId}</p>
              <Label htmlFor="yearLevel">
                Year Level <span className="text-red-600">*</span>
                value={formData.yearLevel}
                      target: { name: "yearLevel", value },
                  id="yearLevel"
                  className={`${errors.yearLevel ? "border-red-500" : ""} ${
                  <SelectValue placeholder="Select Year Level" />
                  {yearLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  Restricted to your assigned year:{" "}
                  {assignedClassInfo.yearLevel}
              {errors.yearLevel && (
                <p className="text-red-500 text-xs mt-1">{errors.yearLevel}</p>
              <Label htmlFor="semester">
                Semester <span className="text-red-600">*</span>
                defaultValue={formData.semester}
                  handleInputChange({
                    target: { name: "semester", value },
                  });
                  id="semester"
                  className={errors.semester ? "border-red-500" : ""}
                  <SelectValue placeholder="Select Semester" />
                  <SelectItem value="1st Semester">1st Semester</SelectItem>
                  <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
              {errors.semester && (
                <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g. Prof. Juan Dela Cruz"
              />
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Subject"
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
AddSubjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
export { AddSubjectModal };
