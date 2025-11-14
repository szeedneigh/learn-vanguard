/**
 * PROGRESS RING COMPONENT
 * Circular progress indicator for dashboard metrics
 * Shows completion percentage visually
 */

import React from 'react';
import { cn } from '@/lib/utils';

const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  className,
  label,
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (progress) => {
    if (progress < 30) return 'text-error';
    if (progress < 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-500', getColor(progress))}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-h4 font-bold">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-body-sm text-muted-foreground font-medium">
          {label}
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
