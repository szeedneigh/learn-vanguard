import React from 'react';
import { Star } from 'lucide-react';
import { useFavoriteStatus } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * FavoriteButton Component
 *
 * Inline button to favorite/unfavorite an item.
 * Shows filled star when favorited, outlined star when not.
 *
 * Features:
 * - Automatic state management
 * - Smooth animations
 * - Toast notifications
 * - Keyboard accessible
 * - Loading state
 *
 * @param {Object} props
 * @param {string} props.id - Item ID
 * @param {string} props.type - Item type ('resource', 'task', 'event', etc.)
 * @param {string} props.title - Item title (for toast notifications)
 * @param {string} props.path - Navigation path
 * @param {string} [props.icon='Star'] - Icon name
 * @param {Object} [props.metadata] - Additional metadata
 * @param {string} [props.size='default'] - Button size ('sm', 'default', 'lg', 'icon')
 * @param {string} [props.variant='ghost'] - Button variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onToggle] - Callback when toggled
 *
 * @example
 * <FavoriteButton
 *   id={resource.id}
 *   type="resource"
 *   title={resource.title}
 *   path={`/dashboard/resources/${resource.id}`}
 *   metadata={{ category: resource.category }}
 * />
 */
const FavoriteButton = ({
  id,
  type,
  title,
  path,
  icon = 'Star',
  metadata = {},
  size = 'icon',
  variant = 'ghost',
  className,
  onToggle,
}) => {
  const { isFavorited, isUpdating, toggle } = useFavoriteStatus(id, type);
  const { toast } = useToast();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newStatus = toggle({
      title,
      path,
      icon,
      metadata,
    });

    // Show toast notification
    toast({
      title: newStatus ? 'Added to favorites' : 'Removed from favorites',
      description: title,
      duration: 2000,
    });

    // Call callback if provided
    if (onToggle) {
      onToggle(newStatus);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isUpdating}
      className={cn(
        'transition-all duration-200',
        isFavorited && 'text-yellow-500 hover:text-yellow-600',
        !isFavorited && 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorited}
    >
      <Star
        className={cn(
          'h-5 w-5 transition-all duration-200',
          isFavorited && 'fill-current scale-110',
          isUpdating && 'animate-pulse'
        )}
      />
      {size !== 'icon' && (
        <span className="ml-2">{isFavorited ? 'Favorited' : 'Favorite'}</span>
      )}
    </Button>
  );
};

export default FavoriteButton;
