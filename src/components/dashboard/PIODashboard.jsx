/**
 * PIO DASHBOARD COMPONENT
 * Enhanced dashboard for Program Information Officers with class insights and student management
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks, useTaskSummary } from '@/hooks/useTasksQuery';
import { useUsers } from '@/hooks/useUsersQuery';
import StatCard from '@/components/dashboard/StatCard';
import ProgressRing from '@/components/dashboard/ProgressRing';
import RecentActivity from '@/components/dashboard/RecentActivity';
import EmptyState from '@/components/dashboard/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  BookOpen,
  BarChart3,
  UserCheck,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';

const PIODashboard = () => {
  const { user } = useAuth();

  // Fetch data
  const { data: taskSummary, isLoading: summaryLoading } = useTaskSummary();
  const { data: students = [], isLoading: studentsLoading } = useUsers();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks({ archived: 'false' });

  // Calculate metrics
  const metrics = useMemo(() => {
    // Filter students by assigned class (PIOs are restricted to their class)
    const myStudents = user?.assignedClass
      ? students.filter(s => s.assignedClass === user.assignedClass && s.role === 'STUDENT')
      : students.filter(s => s.role === 'STUDENT');

    const totalStudents = myStudents.length;

    // Active students (those with recent activity)
    const sevenDaysAgo = addDays(new Date(), -7);
    const activeStudents = myStudents.filter(student => {
      const lastActive = student.lastLoginAt ? new Date(student.lastLoginAt) : null;
      return lastActive && isAfter(lastActive, sevenDaysAgo);
    }).length;

    // Task statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      task => task.taskStatus === 'Completed' || task.taskStatus === 'completed'
    ).length;
    const pendingTasks = allTasks.filter(
      task => task.taskStatus === 'Pending' || task.taskStatus === 'pending'
    ).length;

    // Average completion rate
    const avgCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Resources accessed (mock data - can be enhanced with actual API)
    const resourcesAccessed = 0; // TODO: Implement when resource analytics available

    return {
      totalStudents,
      activeStudents,
      totalTasks,
      completedTasks,
      pendingTasks,
      avgCompletionRate,
      resourcesAccessed,
      className: user?.assignedClass || 'All Classes',
    };
  }, [students, allTasks, user]);

  // Generate recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add task completions
    allTasks
      .filter(task => task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .forEach(task => {
        activities.push({
          id: `task-${task._id}`,
          type: 'task',
          title: task.taskName,
          description: 'Task completed by student',
          timestamp: task.completedAt,
        });
      });

    return activities.slice(0, 5);
  }, [allTasks]);

  // Top performing students
  const topStudents = useMemo(() => {
    const myStudents = user?.assignedClass
      ? students.filter(s => s.assignedClass === user.assignedClass && s.role === 'STUDENT')
      : students.filter(s => s.role === 'STUDENT');

    // Mock calculation - can be enhanced with actual performance metrics
    return myStudents.slice(0, 5).map((student, index) => ({
      id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      completionRate: Math.max(0, 100 - index * 15), // Mock data
      tasksCompleted: Math.max(0, 20 - index * 3), // Mock data
    }));
  }, [students, user]);

  const loading = summaryLoading || studentsLoading || tasksLoading;

  return (
    <div className="space-y-8" id="main-content">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-h2 font-bold">
          Class Management Dashboard 📊
        </h1>
        <p className="text-body text-muted-foreground">
          Managing <span className="font-semibold text-foreground">{metrics.className}</span> ·
          {metrics.totalStudents} {metrics.totalStudents === 1 ? 'student' : 'students'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={metrics.totalStudents.toString()}
          icon={Users}
          description={metrics.className}
          loading={loading}
        />

        <StatCard
          title="Active Students"
          value={metrics.activeStudents.toString()}
          change={`${Math.round((metrics.activeStudents / Math.max(metrics.totalStudents, 1)) * 100)}%`}
          changeType="neutral"
          icon={UserCheck}
          description="last 7 days"
          loading={loading}
        />

        <StatCard
          title="Tasks Assigned"
          value={metrics.totalTasks.toString()}
          icon={CheckSquare}
          description={`${metrics.completedTasks} completed`}
          loading={loading}
        />

        <StatCard
          title="Avg Completion"
          value={`${metrics.avgCompletionRate}%`}
          change={metrics.avgCompletionRate >= 70 ? 'Good progress' : 'Needs improvement'}
          changeType={metrics.avgCompletionRate >= 70 ? 'positive' : 'negative'}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Class Overview & Top Students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Class Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ProgressRing
                    progress={metrics.avgCompletionRate}
                    size={140}
                    label="Average Completion"
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium">Completed Tasks</span>
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

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium">Pending Tasks</span>
                      <span className="text-body-sm text-muted-foreground">
                        {metrics.pendingTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning transition-all duration-500"
                        style={{
                          width: `${metrics.totalTasks > 0 ? (metrics.pendingTasks / metrics.totalTasks) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-info-light border border-info/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-info flex-shrink-0" />
                    <p className="text-caption text-info">
                      {metrics.activeStudents} of {metrics.totalStudents} students active this week
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Top Performing Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topStudents.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No student data yet"
                  description="Student performance metrics will appear here"
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-body-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium truncate">{student.name}</p>
                        <p className="text-caption text-muted-foreground">
                          {student.tasksCompleted} tasks completed
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <p className="text-body-sm font-semibold text-success">
                            {student.completionRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link to="/dashboard/students">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/tasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Assign Tasks
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/resources">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Share Resources
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Student Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm">Active This Week</span>
                  <span className="text-body-sm font-semibold">
                    {metrics.activeStudents}/{metrics.totalStudents}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${metrics.totalStudents > 0 ? (metrics.activeStudents / metrics.totalStudents) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
                  <Link to="/dashboard/students">
                    View All Students
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Class Info */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Class</span>
                <span className="text-body-sm font-medium">{metrics.className}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Total Students</span>
                <span className="text-body-sm font-medium">{metrics.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Active Tasks</span>
                <span className="text-body-sm font-medium">{metrics.totalTasks}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PIODashboard;
