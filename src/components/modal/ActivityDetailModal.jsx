import React from "react";
import PropTypes from "prop-types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  FileText,
  Award,
  Clock,
  User,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Custom DialogContent without automatic close button
const CustomDialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
CustomDialogContent.displayName = "CustomDialogContent";

/**
 * Activity Detail Modal Component
 * Displays comprehensive information about an activity
 */
const ActivityDetailModal = ({ isOpen, onClose, activity, topic, subject }) => {
  if (!activity) return null;

  // Get activity type display info
  const getActivityTypeInfo = (type) => {
    switch (type) {
      case "assignment":
        return { label: "Assignment", color: "bg-blue-100 text-blue-800" };
      case "quiz":
        return { label: "Quiz", color: "bg-purple-100 text-purple-800" };
      case "material":
        // Backward compatibility for existing material activities
        return {
          label: "Learning Material",
          color: "bg-green-100 text-green-800",
        };
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" };
    }
  };

  const typeInfo = getActivityTypeInfo(activity.type);

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "PPP 'at' p");
    } catch (error) {
      return dateString;
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                {activity.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                {activity.dueDate && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-200"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Due {formatDateShort(activity.dueDate)}
                  </Badge>
                )}
              </div>
              {(topic || subject) && (
                <div className="text-sm text-gray-600">
                  {subject && (
                    <span className="font-medium">{subject.name}</span>
                  )}
                  {topic && subject && <span className="mx-1">•</span>}
                  {topic && <span>{topic.name}</span>}
                </div>
              )}
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {activity.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {activity.description}
                </p>
              </div>
            </div>
          )}

          {/* Due Date Details */}
          {activity.dueDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </h3>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm text-orange-800 font-medium">
                  {formatDate(activity.dueDate)}
                </p>
              </div>
            </div>
          )}

          {/* File URLs */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              Attached Files
            </h3>
            {activity.fileUrls &&
            Array.isArray(activity.fileUrls) &&
            activity.fileUrls.length > 0 ? (
              <div className="space-y-2">
                {activity.fileUrls
                  .filter((url) => url && url.trim())
                  .map((url, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <a
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 hover:text-blue-900 underline break-all"
                      >
                        {url.trim()}
                      </a>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500 italic">
                  No files attached to this activity
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {activity.createdAt && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Created
                </h4>
                <p className="text-gray-600">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            )}
            {activity.updatedAt &&
              activity.updatedAt !== activity.createdAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Last Updated
                  </h4>
                  <p className="text-gray-600">
                    {formatDate(activity.updatedAt)}
                  </p>
                </div>
              )}
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

ActivityDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activity: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
    fileUrls: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    createdBy: PropTypes.string,
  }),
  topic: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  subject: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export { ActivityDetailModal };
