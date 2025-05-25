import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';

/**
 * DeleteTaskModal Component
 * 
 * A modal dialog for confirming task deletion.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Function} props.onConfirm - Callback function when deletion is confirmed
 * @param {string} props.taskName - Name of the task to be deleted
 */
const DeleteTaskModal = ({ isOpen, onClose, onConfirm, taskName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="pt-4">
            Are you sure you want to delete <span className="font-medium text-gray-700">"{taskName}"</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DeleteTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  taskName: PropTypes.string
};

export default DeleteTaskModal; 