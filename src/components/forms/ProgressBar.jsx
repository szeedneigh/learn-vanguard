import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ProgressBar Component
 *
 * Visual progress indicator for forms, uploads, and processes.
 *
 * Variants:
 * - linear: Horizontal progress bar
 * - circular: Circular progress ring
 *
 * @param {Object} props
 * @param {number} [props.value=0] - Current progress value
 * @param {number} [props.max=100] - Maximum progress value
 * @param {'linear'|'circular'} [props.variant='linear'] - Display variant
 * @param {'primary'|'success'|'warning'|'error'} [props.color='primary'] - Color theme
 * @param {'sm'|'default'|'lg'} [props.size='default'] - Size
 * @param {boolean} [props.indeterminate=false] - Indeterminate loading state
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.showPercentage=false] - Show percentage value
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * // Linear progress
 * <ProgressBar value={75} label="Uploading..." showPercentage />
 *
 * @example
 * // Circular progress
 * <ProgressBar variant="circular" value={60} size="lg" />
 *
 * @example
 * // Indeterminate
 * <ProgressBar indeterminate label="Processing..." />
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'linear',
  color = 'primary',
  size = 'default',
  indeterminate = false,
  label,
  showPercentage = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Color classes
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };

  // Size classes for linear
  const linearSizeClasses = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3',
  };

  // Size classes for circular
  const circularSizeClasses = {
    sm: 'w-12 h-12',
    default: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const strokeWidthMap = {
    sm: 3,
    default: 4,
    lg: 6,
  };

  if (variant === 'circular') {
    const size_px = size === 'sm' ? 48 : size === 'lg' ? 96 : 64;
    const strokeWidth = strokeWidthMap[size];
    const radius = (size_px - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('inline-flex flex-col items-center gap-2', className)}>
        <div className={cn('relative', circularSizeClasses[size])}>
          <svg
            className="transform -rotate-90"
            width={size_px}
            height={size_px}
          >
            {/* Background circle */}
            <circle
              cx={size_px / 2}
              cy={size_px / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx={size_px / 2}
              cy={size_px / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
              className={cn(
                'transition-all duration-300',
                colorClasses[color],
                indeterminate && 'animate-spin'
              )}
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage text */}
          {!indeterminate && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-foreground">{label}</span>}
          {showPercentage && !indeterminate && (
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          linearSizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            colorClasses[color],
            indeterminate && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
