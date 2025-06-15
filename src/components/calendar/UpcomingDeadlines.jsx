import PropTypes from "prop-types";
import { Info, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getTaskColor,
  getTaskColorClasses,
  getStatusColorClasses,
  normalizePriority,
  normalizeStatus,
  isTaskCompleted,
  capitalize,
} from "@/lib/calendarHelpers";

function UpcomingDeadlines({ tasks, onTaskClick }) {
  // Helper function to format date safely
  const formatDate = (task) => {
    try {
      if (task.date) {
        return new Date(task.date + "T00:00:00").toLocaleDateString();
      } else if (task.scheduleDate) {
        return new Date(task.scheduleDate).toLocaleDateString();
      }
      return "No date";
    } catch (error) {
      console.error("Date formatting error:", error, task);
      return "No date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Task Deadlines</CardTitle>
            <CardDescription>
              Personal tasks due in the next 7 days (excluding completed).
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 h-auto text-sm rounded-md"
            asChild
          >
            <Link to="/dashboard/tasks" className="flex items-center gap-1">
              View all Tasks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const taskColor = getTaskColor(task.priority, task.status);
                const taskColorClasses = getTaskColorClasses(
                  task.priority,
                  task.status
                );
                const statusColorClasses = getStatusColorClasses(task.status);
                const completed = isTaskCompleted(task.status);
                const normalizedPriority = normalizePriority(task.priority);
                const normalizedStatus = normalizeStatus(task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      completed ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {/* Priority-based color indicator */}
                      <div
                        className="h-10 w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: taskColor }}
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          {completed && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          <h4
                            className={`font-medium truncate ${
                              completed ? "line-through" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {task.course} • Due: {formatDate(task)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {/* Priority badge - using consistent colors and removing duplicate text */}
                      {normalizedPriority && (
                        <Badge className={taskColorClasses}>
                          {normalizedPriority}
                        </Badge>
                      )}
                      {/* Status badge - using consistent colors */}
                      <Badge className={statusColorClasses}>
                        {capitalize(normalizedStatus)}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines in the next 7 days.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

UpcomingDeadlines.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string,
      scheduleDate: PropTypes.string,
      status: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onTaskClick: PropTypes.func.isRequired,
};

export default UpcomingDeadlines;
