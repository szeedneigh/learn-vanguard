import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createSubject } from "@/services/programService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        programId: "bsis",
        yearLevel: "1",
        semester: "1st Semester",
        instructor: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

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
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    }

    if (!formData.programId) {
      newErrors.programId = "Program is required";
    }

    if (!formData.yearLevel) {
      newErrors.yearLevel = "Year level is required";
    }

    if (!formData.semester) {
      newErrors.semester = "Semester is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug user object
      console.log("Current user data:", user);

      // Prepare subject data with correct user ID format
      const subjectData = {
        ...formData,
        // Try different formats of user ID that might be expected by the backend
        createdBy: user?.userId || user?.id || user?._id,
      };

      // Log the data being sent
      console.log("Sending subject data:", subjectData);

      if (!subjectData.createdBy) {
        console.error("No user ID available for createdBy field");
        throw new Error(
          "User ID not available. Please try logging out and back in."
        );
      }

      const result = await createSubject(subjectData);

      if (result) {
        if (onSuccess) {
          onSuccess(result);
        }

        onClose();
      }
    } catch (error) {
      console.error("Failed to create subject:", error);

      toast({
        title: "Error",
        description:
          error.message || "Failed to create subject. Please try again.",
        variant: "destructive",
      });

      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to create subject",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (open) => {
    // Only call onClose when the dialog is closing
    if (!open) {
      onClose();
    }
  };

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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description about the subject"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="programId">
                Program <span className="text-red-600">*</span>
              </Label>
              <Select
                defaultValue={formData.programId}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "programId", value },
                  });
                }}
              >
                <SelectTrigger
                  id="programId"
                  className={errors.programId ? "border-red-500" : ""}
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
              {errors.programId && (
                <p className="text-red-500 text-xs mt-1">{errors.programId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearLevel">
                Year Level <span className="text-red-600">*</span>
              </Label>
              <Select
                defaultValue={formData.yearLevel}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "yearLevel", value },
                  });
                }}
              >
                <SelectTrigger
                  id="yearLevel"
                  className={errors.yearLevel ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Year Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                </SelectContent>
              </Select>
              {errors.yearLevel && (
                <p className="text-red-500 text-xs mt-1">{errors.yearLevel}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">
                Semester <span className="text-red-600">*</span>
              </Label>
              <Select
                defaultValue={formData.semester}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "semester", value },
                  });
                }}
              >
                <SelectTrigger
                  id="semester"
                  className={errors.semester ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Semester">1st Semester</SelectItem>
                  <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g. Prof. Juan Dela Cruz"
              />
            </div>
          </div>

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
              )}
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
};

export { AddSubjectModal };
