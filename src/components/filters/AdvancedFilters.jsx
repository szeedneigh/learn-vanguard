import React, { useState, useMemo } from 'react';
import { Filter, X, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { getUniqueValues, getCategoryCounts, getTypeCounts } from '@/utils/filterUtils';
import { saveFilterPreset } from '@/utils/filterPresetsStorage';
import { useToast } from '@/hooks/use-toast';

/**
 * AdvancedFilters Component
 *
 * Slide-out filter panel with multiple filter criteria.
 * Supports category, type, date range, tags, and more.
 *
 * Features:
 * - Multi-dimensional filtering
 * - Save custom filter presets
 * - Live filter counts
 * - Collapsible sections
 * - Responsive sheet/drawer
 *
 * @param {Object} props
 * @param {Array} props.items - All items (for generating filter options)
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showSavePreset=true] - Show save preset button
 *
 * @example
 * <AdvancedFilters
 *   items={allResources}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 */
const AdvancedFilters = ({
  items = [],
  filters = {},
  onFiltersChange,
  className,
  showSavePreset = true,
}) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [savePresetName, setSavePresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  // Get unique values and counts
  const categories = useMemo(() => getUniqueValues(items, 'category'), [items]);
  const types = useMemo(() => getUniqueValues(items, 'type'), [items]);
  const categoryCounts = useMemo(() => getCategoryCounts(items), [items]);
  const typeCounts = useMemo(() => getTypeCounts(items), [items]);
  const allTags = useMemo(() => getUniqueValues(items, 'tags'), [items]);

  // Update local filter
  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Remove a filter
  const removeFilter = (key) => {
    setLocalFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Apply filters
  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  // Clear all filters
  const handleClear = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  // Save as preset
  const handleSavePreset = () => {
    if (!savePresetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        variant: 'destructive',
      });
      return;
    }

    const saved = saveFilterPreset(savePresetName, localFilters);

    if (saved) {
      toast({
        title: 'Preset saved',
        description: `"${savePresetName}" saved successfully`,
      });
      setSavePresetName('');
      setShowSaveDialog(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save preset',
        variant: 'destructive',
      });
    }
  };

  // Count active filters
  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key] !== null && localFilters[key] !== undefined && localFilters[key] !== ''
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your search with multiple criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Category Filter */}
          {categories.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-base font-semibold">Category</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <Select
                  value={localFilters.category || ''}
                  onValueChange={(value) =>
                    value ? updateFilter('category', value) : removeFilter('category')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                        <span className="ml-auto text-xs text-muted-foreground">
                          ({categoryCounts[category] || 0})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localFilters.category && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter('category')}
                    className="w-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear category
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Type Filter */}
          {types.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-base font-semibold">Type</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <Select
                  value={localFilters.type || ''}
                  onValueChange={(value) =>
                    value ? updateFilter('type', value) : removeFilter('type')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                        <span className="ml-auto text-xs text-muted-foreground">
                          ({typeCounts[type] || 0})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localFilters.type && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter('type')}
                    className="w-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear type
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Status Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="text-base font-semibold">Status</Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) =>
                  value ? updateFilter('status', value) : removeFilter('status')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.status && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('status')}
                  className="w-full"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear status
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Due Date Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="text-base font-semibold">Due Date</Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              <Select
                value={localFilters.dueDate || ''}
                onValueChange={(value) =>
                  value ? updateFilter('dueDate', value) : removeFilter('dueDate')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="week">Due This Week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('dueDate')}
                  className="w-full"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear due date
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-base font-semibold">Tags</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <Select
                  value={localFilters.tags || ''}
                  onValueChange={(value) =>
                    value ? updateFilter('tags', value) : removeFilter('tags')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localFilters.tags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter('tags')}
                    className="w-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear tags
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Save Preset */}
          {showSavePreset && activeFilterCount > 0 && (
            <div className="pt-4 border-t">
              {!showSaveDialog ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Preset
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    value={savePresetName}
                    onChange={(e) => setSavePresetName(e.target.value)}
                    placeholder="e.g., My Custom Filter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSavePreset();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSavePreset}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setSavePresetName('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
