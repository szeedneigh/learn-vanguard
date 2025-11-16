import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, X, Trash2, ExternalLink, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

/**
 * FavoritesList Component
 *
 * Displays all favorited items with filtering options.
 * Can be used as a full page or embedded component.
 *
 * Features:
 * - Filter by type (resources, tasks, events)
 * - Remove individual favorites
 * - Clear all favorites
 * - Empty state
 * - Grid or list view
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'grid'|'list'} [props.view='grid'] - Display mode
 * @param {boolean} [props.showFilters=true] - Show type filters
 * @param {boolean} [props.showClearAll=true] - Show clear all button
 *
 * @example
 * <FavoritesList view="grid" />
 */
const FavoritesList = ({
  className,
  view = 'grid',
  showFilters = true,
  showClearAll = true,
}) => {
  const [typeFilter, setTypeFilter] = useState(null);
  const { favorites, isLoading, removeFavorite, clearAll } = useFavorites({
    type: typeFilter,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Get icon component from icon name
  const getIcon = (iconName) => {
    if (!iconName) return Star;
    const Icon = LucideIcons[iconName];
    return Icon || Star;
  };

  // Get item type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      resource: 'bg-blue-100 text-blue-700 border-blue-200',
      task: 'bg-purple-100 text-purple-700 border-purple-200',
      event: 'bg-green-100 text-green-700 border-green-200',
      user: 'bg-orange-100 text-orange-700 border-orange-200',
      page: 'bg-gray-100 text-gray-700 border-gray-200',
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

  // Get type counts for filter
  const typeCounts = favorites.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
          <div>
            <h2 className="text-h4 font-bold">My Favorites</h2>
            <p className="text-body-sm text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Type filter */}
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {typeFilter && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                      1
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={typeFilter === null}
                  onCheckedChange={() => setTypeFilter(null)}
                >
                  All ({favorites.length + Object.values(typeCounts).reduce((a, b) => a, 0)})
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {Object.entries(typeCounts).map(([type, count]) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilter === type}
                    onCheckedChange={() =>
                      setTypeFilter(typeFilter === type ? null : type)
                    }
                  >
                    <span className="capitalize">{type}s</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {count}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear all */}
          {showClearAll && favorites.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    `Remove all ${favorites.length} favorites? This cannot be undone.`
                  )
                ) {
                  clearAll();
                }
              }}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div className="py-16 text-center">
          <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-h5 font-semibold mb-2">No favorites yet</h3>
          <p className="text-body text-muted-foreground max-w-md mx-auto">
            {typeFilter
              ? `No ${typeFilter}s in your favorites. Try a different filter.`
              : 'Items you favorite will appear here for quick access.'}
          </p>
          {typeFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTypeFilter(null)}
              className="mt-4"
            >
              Clear filter
            </Button>
          )}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => {
            const Icon = getIcon(item.icon);

            return (
              <div
                key={`${item.type}:${item.id}`}
                className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(item.id, item.type)}
                  aria-label={`Remove ${item.title} from favorites`}
                >
                  <X className="w-4 h-4" />
                </Button>

                <Link
                  to={item.path}
                  className="block"
                >
                  {/* Icon */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <span
                        className={cn(
                          'inline-block text-xs px-2 py-0.5 rounded border font-medium',
                          getTypeBadgeColor(item.type)
                        )}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  {item.metadata && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {item.metadata.category && (
                        <span>Category: {item.metadata.category}</span>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Favorited {formatTime(item.timestamp)}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && favorites.length > 0 && (
        <div className="space-y-2">
          {favorites.map((item) => {
            const Icon = getIcon(item.icon);

            return (
              <div
                key={`${item.type}:${item.id}`}
                className="group flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <Link to={item.path} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded border font-medium',
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
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </Link>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(item.id, item.type)}
                  aria-label={`Remove ${item.title} from favorites`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
