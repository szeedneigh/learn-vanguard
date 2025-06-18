import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTopic } from "@/services/topicService";
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

const AddTopicModal = ({ isOpen, onClose, onSuccess, subjectId }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subjectId: subjectId,
    order: 0,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        subjectId: subjectId,
        order: 0,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, subjectId]);

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

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
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
        description: "You must be logged in to create a topic.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating topic with data:", formData);

      const result = await createTopic(formData);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Topic has been successfully created.",
          variant: "default",
        });

        if (onSuccess) {
          onSuccess(result.data);
        }

        onClose();
      } else {
        throw new Error(result.error || "Failed to create topic");
      }
    } catch (error) {
      console.error("Failed to create topic:", error);

      toast({
        title: "Error",
        description:
          error.message || "Failed to create topic. Please try again.",
        variant: "destructive",
      });

      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to create topic",
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
          <DialogTitle>Add Topic</DialogTitle>
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

          <div className="space-y-2" style={{ display: "none" }}>
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
                  Creating...
                </span>
              ) : (
                "Create Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

AddTopicModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  subjectId: PropTypes.string.isRequired,
};

export { AddTopicModal };
