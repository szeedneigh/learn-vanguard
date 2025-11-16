import React from 'react';
import { Star, Calendar, Clock, CheckSquare, AlertCircle, PlayCircle, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEFAULT_PRESETS } from '@/utils/filterPresetsStorage';

/**
 * QuickFilters Component
 *
 * Displays preset filter buttons for one-click filtering.
 * Shows common filters like "My Favorites", "Due Today", etc.
 *
 * Features:
 * - One-click filter application
 * - Visual active state
 * - Icon indicators
 * - Responsive layout
 * - Customizable presets
 *
 * @param {Object} props
 * @param {Object} props.activeFilters - Currently active filters
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {Array} [props.presets] - Custom presets (defaults to DEFAULT_PRESETS)
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * <QuickFilters
 *   activeFilters={filters}
 *   onFilterChange={(newFilters) => setFilters(newFilters)}
 * />
 */
const QuickFilters = ({
  activeFilters = {},
  onFilterChange,
  presets = DEFAULT_PRESETS,
  className,
}) => {
  // Icon mapping for presets
  const getPresetIcon = (presetId) => {
    const iconMap = {
      favorites: Star,
      'due-today': Calendar,
      'due-week': Clock,
      'new-week': AlertCircle,
      completed: CheckSquare,
      'in-progress': PlayCircle,
      overdue: AlertCircle,
      videos: Video,
      documents: FileText,
    };

    return iconMap[presetId] || Calendar;
  };

  // Check if a preset is active
  const isPresetActive = (preset) => {
    const presetFilters = preset.filters;

    // Check if all preset filters match active filters
    return Object.entries(presetFilters).every(
      ([key, value]) => activeFilters[key] === value
    );
  };

  // Handle preset click
  const handlePresetClick = (preset) => {
    const isActive = isPresetActive(preset);

    if (isActive) {
      // If already active, clear the filters
      onFilterChange({});
    } else {
      // Apply preset filters
      onFilterChange(preset.filters);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map((preset) => {
        const Icon = getPresetIcon(preset.id);
        const isActive = isPresetActive(preset);

        return (
          <Button
            key={preset.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className={cn(
              'transition-all duration-200',
              isActive && 'shadow-md',
              !isActive && 'hover:bg-accent'
            )}
          >
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {preset.name}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickFilters;
