/**
 * ADMIN DASHBOARD COMPONENT
 * System-wide dashboard for administrators with platform analytics and management
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks, useTaskSummary } from '@/hooks/useTasksQuery';
import { useUsers } from '@/hooks/useUsersQuery';
import { useEvents } from '@/hooks/useEventsQuery';
import StatCard from '@/components/dashboard/StatCard';
import ProgressRing from '@/components/dashboard/ProgressRing';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  CheckSquare,
  TrendingUp,
  BookOpen,
  Activity,
  Shield,
  Settings,
  Database,
  Calendar as CalendarIcon,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Fetch data
  const { data: taskSummary, isLoading: summaryLoading } = useTaskSummary();
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks({ archived: 'false' });
  const { data: allEvents = [], isLoading: eventsLoading } = useEvents();

  // Calculate system-wide metrics
  const metrics = useMemo(() => {
    // User metrics
    const students = allUsers.filter(u => u.role === 'STUDENT');
    const pios = allUsers.filter(u => u.role === 'PIO');
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const totalUsers = allUsers.length;

    // Active users (logged in last 7 days)
    const sevenDaysAgo = addDays(new Date(), -7);
    const activeUsers = allUsers.filter(u => {
      const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt) : null;
      return lastActive && isAfter(lastActive, sevenDaysAgo);
    }).length;

    // Task metrics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      task => task.taskStatus === 'Completed' || task.taskStatus === 'completed'
    ).length;
    const pendingTasks = allTasks.filter(
      task => task.taskStatus === 'Pending' || task.taskStatus === 'pending'
    ).length;

    // System completion rate
    const systemCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Event metrics
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.scheduleDate);
      return isAfter(eventDate, new Date());
    }).length;

    // Resources (mock - enhance when API available)
    const totalResources = 0; // TODO: Implement with actual API

    return {
      totalUsers,
      students: students.length,
      pios: pios.length,
      admins: admins.length,
      activeUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      systemCompletionRate,
      upcomingEvents,
      totalResources,
    };
  }, [allUsers, allTasks, allEvents]);

  // User distribution for visualization
  const userDistribution = useMemo(() => {
    const total = metrics.totalUsers || 1;
    return {
      students: Math.round((metrics.students / total) * 100),
      pios: Math.round((metrics.pios / total) * 100),
      admins: Math.round((metrics.admins / total) * 100),
    };
  }, [metrics]);

  // Generate recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent user registrations
    allUsers
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3)
      .forEach(u => {
        if (u.createdAt) {
          activities.push({
            id: `user-${u._id}`,
            type: 'submission',
            title: 'New User Registration',
            description: `${u.firstName} ${u.lastName} joined as ${u.role}`,
            timestamp: u.createdAt,
          });
        }
      });

    // Add task completions
    allTasks
      .filter(task => task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 2)
      .forEach(task => {
        activities.push({
          id: `task-${task._id}`,
          type: 'task',
          title: task.taskName,
          description: 'Task completed',
          timestamp: task.completedAt,
        });
      });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }, [allUsers, allTasks]);

  const loading = summaryLoading || usersLoading || tasksLoading || eventsLoading;

  return (
    <div className="space-y-8" id="main-content">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-h2 font-bold">
          System Administration Dashboard 🛡️
        </h1>
        <p className="text-body text-muted-foreground">
          Platform-wide overview and system management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toString()}
          icon={Users}
          description={`${metrics.activeUsers} active`}
          loading={loading}
        />

        <StatCard
          title="Active Users"
          value={metrics.activeUsers.toString()}
          change={`${Math.round((metrics.activeUsers / Math.max(metrics.totalUsers, 1)) * 100)}%`}
          changeType="neutral"
          icon={UserCheck}
          description="last 7 days"
          loading={loading}
        />

        <StatCard
          title="System Tasks"
          value={metrics.totalTasks.toString()}
          icon={CheckSquare}
          description={`${metrics.systemCompletionRate}% completed`}
          loading={loading}
        />

        <StatCard
          title="Upcoming Events"
          value={metrics.upcomingEvents.toString()}
          icon={CalendarIcon}
          description="scheduled"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - System Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Health & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ProgressRing
                    progress={metrics.systemCompletionRate}
                    size={140}
                    label="Task Completion"
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium">Active Users</span>
                      <span className="text-body-sm text-muted-foreground">
                        {metrics.activeUsers} / {metrics.totalUsers}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${(metrics.activeUsers / Math.max(metrics.totalUsers, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium">Tasks Progress</span>
                      <span className="text-body-sm text-muted-foreground">
                        {metrics.completedTasks} / {metrics.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success transition-all duration-500"
                        style={{
                          width: `${metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-success-light border border-success/20 rounded-lg">
                    <Shield className="h-4 w-4 text-success flex-shrink-0" />
                    <p className="text-caption text-success">
                      All systems operational
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-h4 font-bold text-primary">{metrics.students}</div>
                  <div className="text-caption text-muted-foreground mt-1">Students</div>
                  <div className="text-caption font-medium text-primary mt-1">
                    {userDistribution.students}%
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-info/5 border border-info/10">
                  <div className="text-h4 font-bold text-info">{metrics.pios}</div>
                  <div className="text-caption text-muted-foreground mt-1">PIOs</div>
                  <div className="text-caption font-medium text-info mt-1">
                    {userDistribution.pios}%
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-success/5 border border-success/10">
                  <div className="text-h4 font-bold text-success">{metrics.admins}</div>
                  <div className="text-caption text-muted-foreground mt-1">Admins</div>
                  <div className="text-caption font-medium text-success mt-1">
                    {userDistribution.admins}%
                  </div>
                </div>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${userDistribution.students}%` }}
                />
                <div
                  className="bg-info transition-all duration-500"
                  style={{ width: `${userDistribution.pios}%` }}
                />
                <div
                  className="bg-success transition-all duration-500"
                  style={{ width: `${userDistribution.admins}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* System Actions */}
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link to="/dashboard/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/tasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  View All Tasks
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/resources">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Resources
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/events">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  System Events
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Total Users</span>
                <span className="text-body-sm font-semibold">{metrics.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Active Users</span>
                <span className="text-body-sm font-semibold text-success">
                  {metrics.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Total Tasks</span>
                <span className="text-body-sm font-semibold">{metrics.totalTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Pending Tasks</span>
                <span className="text-body-sm font-semibold text-warning">
                  {metrics.pendingTasks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Events</span>
                <span className="text-body-sm font-semibold">{metrics.upcomingEvents}</span>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  <span className="text-body-sm">Database</span>
                </div>
                <span className="text-caption text-success font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  <span className="text-body-sm">API</span>
                </div>
                <span className="text-caption text-success font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  <span className="text-body-sm">Storage</span>
                </div>
                <span className="text-caption text-success font-medium">Available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
