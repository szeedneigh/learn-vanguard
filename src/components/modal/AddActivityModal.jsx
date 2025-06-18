import React, { useState, useEffect } from "react";
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
import { addActivity } from "@/services/topicService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AddActivityModal = ({ isOpen, onClose, onSuccess, topicId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "assignment",
    title: "",
    description: "",
    dueDate: "",
    points: 0,
    fileUrls: [],
  });
  const [newFileUrl, setNewFileUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "assignment",
        title: "",
        description: "",
        dueDate: "",
        points: 0,
        fileUrls: [],
      });
      setNewFileUrl("");
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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const addFileUrl = () => {
    if (newFileUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        fileUrls: [...prev.fileUrls, newFileUrl.trim()],
      }));
      setNewFileUrl("");
    }
  };

  const removeFileUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      fileUrls: prev.fileUrls.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Activity title is required";
    }

    if (!formData.type) {
      newErrors.type = "Activity type is required";
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
      // Prepare the data for submission, ensuring proper format
      const submissionData = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate:
          formData.dueDate && formData.dueDate.trim() !== ""
            ? formData.dueDate
            : null,
        points: formData.points || 0, // Points for assignments and quizzes
        fileUrls: formData.fileUrls || [],
      };

      console.log("AddActivityModal: Submitting data:", submissionData);

      const result = await addActivity(topicId, submissionData);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Activity has been successfully created.",
          variant: "default",
        });

        if (onSuccess) {
          onSuccess(result.data);
        }

        onClose();
      } else {
        throw new Error(result.error || "Failed to create activity");
      }
    } catch (error) {
      console.error("Failed to create activity:", error);

      toast({
        title: "Error",
        description:
          error.message || "Failed to create activity. Please try again.",
        variant: "destructive",
      });

      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to create activity",
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">
              Activity Type <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger
                id="type"
                className={errors.type ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? "border-red-500" : ""}
              placeholder="e.g. Week 1 Assignment"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the activity"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-50" />
              <Input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <p className="text-xs text-gray-500">
              When this activity is due (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrls">File URLs (Optional)</Label>
            <div className="flex">
              <Input
                id="fileUrlInput"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                placeholder="Enter a URL to a file or resource"
                className="flex-1 mr-2"
              />
              <Button
                type="button"
                onClick={addFileUrl}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              {formData.fileUrls.length > 0 ? (
                formData.fileUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 p-2 rounded"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1 text-sm truncate"
                    >
                      {url}
                    </a>
                    <Button
                      type="button"
                      onClick={() => removeFileUrl(index)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No files added yet
                </p>
              )}
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
                "Create Activity"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

AddActivityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  topicId: PropTypes.string.isRequired,
};

export { AddActivityModal };
