/**
 * STAT CARD COMPONENT
 * Displays key metrics with icons and trends
 * Used across all dashboard types
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  description,
  trend,
  loading = false,
}) => {
  const trendIcons = {
    up: ArrowUp,
    down: ArrowDown,
    neutral: Minus,
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  const changeColors = {
    positive: 'text-success bg-success-light',
    negative: 'text-error bg-error-light',
    neutral: 'text-muted-foreground bg-muted',
  };

  if (loading) {
    return (
      <Card className="hover-elevation hover-elevation-2 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-body-sm font-medium text-muted-foreground">
            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
          </CardTitle>
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevation hover-elevation-2 transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-body-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-h3 font-bold">{value}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-caption font-medium px-2 py-1 rounded-full',
                  changeColors[changeType]
                )}
              >
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                {change}
              </span>
            )}
            {description && (
              <p className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
