import React from 'react';
import { Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

/**
 * SaveIndicator Component
 *
 * Shows auto-save status to users with visual feedback.
 *
 * States:
 * - idle: No indicator shown
 * - saving: "Saving..." with spinner
 * - saved: "Saved ✓" with checkmark (fades after 2s)
 * - error: "Error saving" with retry button
 *
 * @param {Object} props
 * @param {'idle'|'saving'|'saved'|'error'} props.status - Save status
 * @param {Date} [props.lastSaved] - Timestamp of last save
 * @param {Function} [props.onRetry] - Retry save callback (for error state)
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showTimestamp=true] - Show last saved time
 *
 * @example
 * <SaveIndicator
 *   status={saveStatus}
 *   lastSaved={lastSaved}
 *   onRetry={handleRetry}
 * />
 */
const SaveIndicator = ({
  status,
  lastSaved,
  onRetry,
  className,
  showTimestamp = true,
}) => {
  // Don't render anything if idle
  if (status === 'idle') {
    return null;
  }

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';

    try {
      return formatDistanceToNow(new Date(lastSaved), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm transition-opacity duration-300',
        status === 'saved' && 'animate-in fade-in',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Saving state */}
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {/* Saved state */}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-success" />
          <span className="text-success font-medium">
            Saved
            {showTimestamp && lastSaved && (
              <span className="text-muted-foreground font-normal ml-1">
                {formatLastSaved()}
              </span>
            )}
          </span>
        </>
      )}

      {/* Error state */}
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive font-medium">Error saving</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-destructive hover:text-destructive"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SaveIndicator;
