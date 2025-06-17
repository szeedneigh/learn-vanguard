import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTopic } from "@/services/topicService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const EditTopicModal = ({ isOpen, onClose, onSuccess, topic }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when modal is opened or topic changes
  useEffect(() => {
    if (isOpen && topic) {
      setFormData({
        name: topic.name || "",
        description: topic.description || "",
        order: topic.order || 0,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, topic]);

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
      newErrors.name = "Topic name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a topic.",
        variant: "destructive",
      });
      return;
    }

    if (!topic?.id) {
      toast({
        title: "Error",
        description: "Invalid topic data.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a clean topic ID (handle both _id and id fields)
    let topicId = topic._id || topic.id;

    // Clean the topic ID - ensure it's a string and remove any extra characters
    if (typeof topicId === "object") {
      topicId = topicId.toString();
    }
    topicId = String(topicId).trim();

    if (!topicId) {
      toast({
        title: "Error",
        description: "Topic ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for submission, ensuring proper format
      const submissionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0,
      };

      console.log("Updating topic with data:", submissionData);
      console.log("Topic ID:", topicId);
      console.log("Full topic object:", topic);

      const result = await updateTopic(topicId, submissionData);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Topic has been successfully updated.",
          variant: "default",
        });

        if (onSuccess) {
          onSuccess(result.data);
        }

        onClose();
      } else {
        throw new Error(result.error || "Failed to update topic");
      }
    } catch (error) {
      console.error("Failed to update topic:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      // Extract more detailed error message
      let errorMessage = "Failed to update topic. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Validation errors: ${error.response.data.errors
          .map((e) => e.msg)
          .join(", ")}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setErrors((prev) => ({
        ...prev,
        form: errorMessage,
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
          <DialogTitle>Edit Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Topic Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
              placeholder="e.g. Introduction to Databases"
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
              placeholder="Brief description about the topic"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min={0}
              placeholder="Topic display order (0 = first)"
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in the list
            </p>
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
                  Updating...
                </span>
              ) : (
                "Update Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

EditTopicModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  topic: PropTypes.object,
};

export { EditTopicModal };
