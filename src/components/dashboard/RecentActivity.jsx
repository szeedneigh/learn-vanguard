/**
 * RECENT ACTIVITY FEED COMPONENT
 * Displays recent user activities in a timeline format
 * Used in dashboard views
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { Activity } from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const icons = {
      task: '✓',
      resource: '📄',
      event: '📅',
      announcement: '📢',
      submission: '📝',
    };
    return icons[type] || '•';
  };

  const getActivityColor = (type) => {
    const colors = {
      task: 'text-task bg-task/10',
      resource: 'text-resource bg-resource/10',
      event: 'text-event bg-event/10',
      announcement: 'text-info bg-info-light',
      submission: 'text-success bg-success-light',
    };
    return colors[type] || 'text-muted-foreground bg-muted';
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
          getActivityColor(activity.type)
        )}
      >
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-foreground truncate">
          {activity.title}
        </p>
        <p className="text-caption text-muted-foreground">
          {activity.description}
        </p>
        <p className="text-caption text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [], maxItems = 5, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Your recent actions will appear here"
            size="sm"
          />
        </CardContent>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {displayActivities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
