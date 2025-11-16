/**
 * STUDENT DASHBOARD COMPONENT
 * Enhanced dashboard view for students with analytics, progress tracking, and quick actions
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks, useTaskSummary } from '@/hooks/useTasksQuery';
import { useEvents } from '@/hooks/useEventsQuery';
import StatCard from '@/components/dashboard/StatCard';
import ProgressRing from '@/components/dashboard/ProgressRing';
import RecentActivity from '@/components/dashboard/RecentActivity';
import EmptyState from '@/components/dashboard/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  CheckSquare,
  BookOpen,
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  Trophy,
  Target,
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Fetch data
  const { data: taskSummary, isLoading: summaryLoading } = useTaskSummary();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks({ archived: 'false' });
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useEvents({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = addDays(today, -7);

    // Completed tasks
    const completedTasks = allTasks.filter(
      (task) => task.taskStatus === 'Completed' || task.taskStatus === 'completed'
    ).length;

    const recentlyCompleted = allTasks.filter((task) => {
      const isCompleted = task.taskStatus === 'Completed' || task.taskStatus === 'completed';
      const completedDate = task.completedAt ? new Date(task.completedAt) : null;
      return isCompleted && completedDate && isAfter(completedDate, sevenDaysAgo);
    }).length;

    // Pending tasks
    const pendingTasks = allTasks.filter(
      (task) => task.taskStatus === 'Pending' || task.taskStatus === 'pending'
    ).length;

    // Overdue tasks
    const overdueTasks = allTasks.filter((task) => {
      if (task.taskStatus === 'Completed' || task.taskStatus === 'completed') return false;
      const deadline = task.taskDeadline ? new Date(task.taskDeadline) : null;
      return deadline && isBefore(deadline, today);
    }).length;

    // Overall completion rate
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Upcoming events count
    const upcomingCount = upcomingEvents.length;

    return {
      completedTasks,
      recentlyCompleted,
      pendingTasks,
      overdueTasks,
      completionRate,
      totalTasks,
      upcomingCount,
    };
  }, [allTasks, upcomingEvents]);

  // Generate recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add completed tasks
    allTasks
      .filter((task) => {
        const isCompleted = task.taskStatus === 'Completed' || task.taskStatus === 'completed';
        return isCompleted && task.completedAt;
      })
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 3)
      .forEach((task) => {
        activities.push({
          id: `task-${task._id}`,
          type: 'task',
          title: task.taskName,
          description: 'Completed task',
          timestamp: task.completedAt,
        });
      });

    // Add upcoming events
    upcomingEvents.slice(0, 2).forEach((event) => {
      activities.push({
        id: `event-${event._id}`,
        type: 'event',
        title: event.title,
        description: `Scheduled for ${format(new Date(event.scheduleDate), 'MMM d')}`,
        timestamp: event.createdAt || event.scheduleDate,
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  }, [allTasks, upcomingEvents]);

  const loading = summaryLoading || tasksLoading || eventsLoading;

  return (
    <div className="space-y-8" id="main-content">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-h2 font-bold">
          Welcome back, {user?.firstName || 'Student'}! 👋
        </h1>
        <p className="text-body text-muted-foreground">
          Here's what's happening with your learning journey today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tasks Completed"
          value={metrics.completedTasks.toString()}
          change={metrics.recentlyCompleted > 0 ? `+${metrics.recentlyCompleted}` : undefined}
          changeType="positive"
          trend={metrics.recentlyCompleted > 0 ? 'up' : 'neutral'}
          icon={CheckSquare}
          description={metrics.recentlyCompleted > 0 ? 'this week' : undefined}
          loading={loading}
        />

        <StatCard
          title="Pending Tasks"
          value={metrics.pendingTasks.toString()}
          icon={Clock}
          description={`${metrics.totalTasks} total tasks`}
          loading={loading}
        />

        <StatCard
          title="Overdue Tasks"
          value={metrics.overdueTasks.toString()}
          change={metrics.overdueTasks > 0 ? 'Needs attention' : 'All caught up!'}
          changeType={metrics.overdueTasks > 0 ? 'negative' : 'positive'}
          icon={AlertCircle}
          loading={loading}
        />

        <StatCard
          title="Upcoming Events"
          value={metrics.upcomingCount.toString()}
          icon={CalendarIcon}
          description="next 30 days"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Progress & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ProgressRing
                    progress={metrics.completionRate}
                    size={140}
                    label="Completion Rate"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium">Completed</span>
                      <span className="text-body-sm text-muted-foreground">
                        {metrics.completedTasks} / {metrics.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success transition-all duration-500"
                        style={{ width: `${metrics.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {metrics.overdueTasks > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-error-light border border-error/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body-sm font-medium text-error">
                          {metrics.overdueTasks} overdue {metrics.overdueTasks === 1 ? 'task' : 'tasks'}
                        </p>
                        <p className="text-caption text-error/80 mt-1">
                          Review your tasks to stay on track
                        </p>
                      </div>
                    </div>
                  )}

                  {metrics.completionRate === 100 && metrics.totalTasks > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-success-light border border-success/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body-sm font-medium text-success">
                          All tasks completed!
                        </p>
                        <p className="text-caption text-success/80 mt-1">
                          Great job staying on top of your work!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/dashboard/tasks">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    View Tasks
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/dashboard/resources">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Resources
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/dashboard/events">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    View Events
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>

        {/* Right Column - Calendar & Events */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Upcoming Events Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Events</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/events" className="flex items-center gap-1">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="No upcoming events"
                  description="Check back later for new events"
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event._id}
                      className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium truncate">{event.title}</p>
                        <p className="text-caption text-muted-foreground">
                          {format(new Date(event.scheduleDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
