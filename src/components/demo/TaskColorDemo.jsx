import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTaskColor, getTaskColorClasses, isTaskCompleted } from '@/lib/calendarHelpers';

/**
 * Demo component to showcase priority-based color coding for tasks
 * This component demonstrates the new color system implementation
 */
const TaskColorDemo = () => {
  // Sample tasks with different priorities and statuses
  const sampleTasks = [
    { id: 1, title: 'Critical Bug Fix', priority: 'High Priority', status: 'In progress', course: 'BSIS' },
    { id: 2, title: 'Feature Development', priority: 'Medium Priority', status: 'In progress', course: 'ACT' },
    { id: 3, title: 'Documentation Update', priority: 'Low Priority', status: 'In progress', course: 'BSIS' },
    { id: 4, title: 'Code Review', priority: undefined, status: 'In progress', course: 'ACT' },
    { id: 5, title: 'Database Migration', priority: 'High Priority', status: 'Completed', course: 'BSIS' },
    { id: 6, title: 'UI Testing', priority: 'Medium Priority', status: 'Completed', course: 'ACT' },
    { id: 7, title: 'Performance Optimization', priority: 'High Priority', status: 'On-hold', course: 'BSIS' },
    { id: 8, title: 'Security Audit', priority: 'Medium Priority', status: 'On-hold', course: 'ACT' },
  ];

  const priorities = ['High Priority', 'Medium Priority', 'Low Priority', undefined];
  const statuses = ['In progress', 'Completed', 'On-hold'];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Priority-Based Color Coding Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Color Reference</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {priorities.map((priority) => (
                  <div key={priority || 'default'} className="space-y-2">
                    <div className="text-sm font-medium">
                      {priority || 'Default/Unspecified'}
                    </div>
                    {statuses.map((status) => {
                      const color = getTaskColor(priority, status);
                      const completed = isTaskCompleted(status);
                      return (
                        <div
                          key={status}
                          className="flex items-center gap-2 p-2 rounded border"
                          style={{ 
                            backgroundColor: `${color}10`,
                            borderColor: color,
                            borderLeftWidth: '4px'
                          }}
                        >
                          {completed && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className={`text-xs ${completed ? 'line-through' : ''}`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Sample Tasks</h3>
              <div className="space-y-2">
                {sampleTasks.map((task) => {
                  const taskColor = getTaskColor(task.priority, task.status);
                  const taskColorClasses = getTaskColorClasses(task.priority, task.status);
                  const completed = isTaskCompleted(task.status);
                  
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        completed ? 'opacity-75' : ''
                      }`}
                      style={{
                        backgroundColor: `${taskColor}08`,
                        borderLeftColor: taskColor,
                        borderLeftWidth: '4px'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: taskColor }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            {completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <h4 className={`font-medium ${completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h4>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {task.course} • Priority: {task.priority || 'Default'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <Badge
                            style={{
                              backgroundColor: `${taskColor}20`,
                              color: taskColor,
                              borderColor: taskColor,
                              border: '1px solid'
                            }}
                          >
                            {task.priority.replace(' Priority', '')}
                          </Badge>
                        )}
                        <Badge
                          className={taskColorClasses}
                          variant={completed ? "default" : "secondary"}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Implementation Notes</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>High Priority:</strong> Red (#EF4444) - Critical tasks requiring immediate attention</p>
                <p>• <strong>Medium Priority:</strong> Orange (#F97316) - Important tasks with moderate urgency</p>
                <p>• <strong>Low Priority:</strong> Gray (#6B7280) - Tasks that can be addressed when time permits</p>
                <p>• <strong>Default/Unspecified:</strong> Blue (#6366F1) - Standard task color when priority is not set</p>
                <p>• <strong>Completed Tasks:</strong> Always show green (#10B981) regardless of original priority</p>
                <p>• <strong>On-hold Tasks:</strong> Always show yellow (#F59E0B) regardless of original priority</p>
                <p>• <strong>Visual Indicators:</strong> Completed tasks show checkmark icon and strikethrough text</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskColorDemo;
