/**
 * EMPTY STATE COMPONENT
 * Provides beautiful, helpful empty states with clear CTAs
 * Used throughout the application
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className,
  size = 'default', // 'sm', 'default', 'lg'
}) => {
  const sizes = {
    sm: {
      icon: 'h-12 w-12',
      title: 'text-h6',
      description: 'text-body-sm',
      padding: 'p-6',
    },
    default: {
      icon: 'h-16 w-16',
      title: 'text-h5',
      description: 'text-body',
      padding: 'p-8',
    },
    lg: {
      icon: 'h-24 w-24',
      title: 'text-h4',
      description: 'text-body-lg',
      padding: 'p-12',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <Card className={cn('border-2 border-dashed', className)}>
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeConfig.padding
        )}
      >
        {Icon && (
          <div className="mb-4">
            <Icon
              className={cn(sizeConfig.icon, 'text-muted-foreground opacity-50')}
            />
          </div>
        )}
        <h3 className={cn('font-semibold text-foreground mb-2', sizeConfig.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-muted-foreground mb-6 max-w-sm', sizeConfig.description)}>
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {action && (
              <Button onClick={action} size={size === 'sm' ? 'sm' : 'default'}>
                {actionLabel || 'Get Started'}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction}
                variant="outline"
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {secondaryActionLabel || 'Learn More'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
