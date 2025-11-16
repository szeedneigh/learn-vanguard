import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, X, Trash2, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

/**
 * RecentlyViewed Component
 *
 * Displays recently viewed items in a dropdown menu.
 * Shows item icon, title, type, and relative timestamp.
 *
 * Features:
 * - Dropdown menu interface
 * - Click to navigate to item
 * - Remove individual items
 * - Clear all history
 * - Empty state
 * - Keyboard accessible
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.limit=10] - Maximum items to show
 * @param {boolean} [props.showClearAll=true] - Show clear all button
 *
 * @example
 * <RecentlyViewed limit={5} />
 */
const RecentlyViewed = ({ className, limit = 10, showClearAll = true }) => {
  const { items, isLoading, removeItem, clearAll } = useRecentlyViewed({ limit });

  const [open, setOpen] = React.useState(false);

  if (isLoading) {
    return null; // Or show skeleton
  }

  // Get icon component from icon name
  const getIcon = (iconName) => {
    if (!iconName) return Clock;
    const Icon = LucideIcons[iconName];
    return Icon || Clock;
  };

  // Get item type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      resource: 'bg-blue-100 text-blue-700',
      task: 'bg-purple-100 text-purple-700',
      event: 'bg-green-100 text-green-700',
      user: 'bg-orange-100 text-orange-700',
      page: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.page;
  };

  // Format relative time
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Recently viewed items"
        >
          <Clock className="h-5 w-5" />
          {items.length > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
              aria-hidden="true"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[500px] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recently Viewed
          </span>
          {showClearAll && items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearAll();
              }}
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
              aria-label="Clear all history"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity</p>
            <p className="text-xs mt-1">Your recent views will appear here</p>
          </div>
        ) : (
          <div className="py-1">
            {items.map((item) => {
              const Icon = getIcon(item.icon);

              return (
                <DropdownMenuItem
                  key={`${item.type}:${item.id}`}
                  asChild
                  className="group cursor-pointer focus:bg-accent"
                >
                  <div className="flex items-start gap-3 p-2">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <Link
                      to={item.path}
                      className="flex-1 min-w-0"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <p className="text-sm font-medium leading-tight truncate">
                            {item.title}
                          </p>

                          {/* Type badge and time */}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded font-medium',
                                getTypeBadgeColor(item.type)
                              )}
                            >
                              {item.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* External link icon on hover */}
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>
                    </Link>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.id, item.type);
                      }}
                      aria-label={`Remove ${item.title} from history`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RecentlyViewed;
