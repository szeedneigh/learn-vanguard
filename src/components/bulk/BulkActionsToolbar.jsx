import React, { useState } from 'react';
import { Star, Trash2, Archive, Tag, FolderInput, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * BulkActionsToolbar Component
 *
 * Floating toolbar that appears when items are selected.
 * Provides bulk actions like favorite, delete, archive, etc.
 *
 * Features:
 * - Appears only when items selected
 * - Confirmation dialogs for destructive actions
 * - Toast notifications
 * - Customizable actions
 * - Selection count display
 *
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected items
 * @param {Array} props.selectedItems - Selected item objects
 * @param {Function} props.onClearSelection - Clear selection callback
 * @param {Function} [props.onAddToFavorites] - Favorite action callback
 * @param {Function} [props.onRemoveFromFavorites] - Unfavorite action callback
 * @param {Function} [props.onDelete] - Delete action callback
 * @param {Function} [props.onArchive] - Archive action callback
 * @param {Function} [props.onAddTags] - Add tags callback
 * @param {Function} [props.onMoveToCategory] - Move to category callback
 * @param {Function} [props.onExport] - Export callback
 * @param {Array} [props.customActions] - Custom action buttons
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * <BulkActionsToolbar
 *   selectedCount={selectedIds.length}
 *   selectedItems={selectedItems}
 *   onClearSelection={clearSelection}
 *   onAddToFavorites={handleBulkFavorite}
 *   onDelete={handleBulkDelete}
 * />
 */
const BulkActionsToolbar = ({
  selectedCount,
  selectedItems = [],
  onClearSelection,
  onAddToFavorites,
  onRemoveFromFavorites,
  onDelete,
  onArchive,
  onAddTags,
  onMoveToCategory,
  onExport,
  customActions = [],
  className,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const { toast } = useToast();

  // Don't render if nothing selected
  if (selectedCount === 0) {
    return null;
  }

  // Handle favorite
  const handleFavorite = async () => {
    if (onAddToFavorites) {
      try {
        await onAddToFavorites(selectedItems);
        toast({
          title: 'Added to favorites',
          description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} favorited`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to favorite items',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle unfavorite
  const handleUnfavorite = async () => {
    if (onRemoveFromFavorites) {
      try {
        await onRemoveFromFavorites(selectedItems);
        toast({
          title: 'Removed from favorites',
          description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} unfavorited`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to unfavorite items',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(selectedItems);
        toast({
          title: 'Deleted',
          description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} deleted`,
        });
        onClearSelection();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete items',
          variant: 'destructive',
        });
      }
    }
    setShowDeleteConfirm(false);
  };

  // Handle archive
  const handleArchive = async () => {
    if (onArchive) {
      try {
        await onArchive(selectedItems);
        toast({
          title: 'Archived',
          description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} archived`,
        });
        onClearSelection();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to archive items',
          variant: 'destructive',
        });
      }
    }
    setShowArchiveConfirm(false);
  };

  // Handle export
  const handleExport = async () => {
    if (onExport) {
      try {
        await onExport(selectedItems);
        toast({
          title: 'Exported',
          description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} exported`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to export items',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'bg-background border rounded-lg shadow-lg',
          'flex items-center gap-2 px-4 py-3',
          'animate-in slide-in-from-bottom-5',
          className
        )}
      >
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Favorite */}
          {onAddToFavorites && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className="h-8"
            >
              <Star className="w-4 h-4 mr-1" />
              Favorite
            </Button>
          )}

          {/* Unfavorite */}
          {onRemoveFromFavorites && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnfavorite}
              className="h-8"
            >
              <Star className="w-4 h-4 mr-1 fill-current" />
              Unfavorite
            </Button>
          )}

          {/* Archive */}
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchiveConfirm(true)}
              className="h-8"
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive
            </Button>
          )}

          {/* Add Tags */}
          {onAddTags && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTags(selectedItems)}
              className="h-8"
            >
              <Tag className="w-4 h-4 mr-1" />
              Tag
            </Button>
          )}

          {/* Move to Category */}
          {onMoveToCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveToCategory(selectedItems)}
              className="h-8"
            >
              <FolderInput className="w-4 h-4 mr-1" />
              Move
            </Button>
          )}

          {/* Export */}
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => action.onClick(selectedItems)}
              className="h-8"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-1" />}
              {action.label}
            </Button>
          ))}

          {/* Delete */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} item{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedCount} item{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              The selected items will be moved to the archive. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActionsToolbar;
