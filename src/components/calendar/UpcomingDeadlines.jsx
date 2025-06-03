import PropTypes from "prop-types";
import { Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseColors, statusClasses, capitalize } from "@/lib/calendarHelpers";

function UpcomingDeadlines({ tasks, onTaskClick }) {
  // Helper function to format date display
  const formatDate = (dateString) => {
    try {
      // Handle ISO string or YYYY-MM-DD format
      const date = new Date(dateString);
      if (isNaN(date)) return "Invalid date";
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Helper function to get status display
  const getStatusDisplay = (task) => {
    if (!task.status) {
      return "upcoming";
    }
    return task.status.toLowerCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>
          Tasks due in the next 7 days (excluding completed).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id || task._id}
                  onClick={() => onTaskClick(task)}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div
                      className={`${
                        courseColors[task.course] || "bg-gray-500"
                      } h-10 w-1 rounded-full flex-shrink-0`}
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-medium truncate">
                        {task.title || task.taskName}
                      </h4>
                      <div className="text-sm text-muted-foreground truncate">
                        {task.course || "All Courses"} • Due:{" "}
                        {formatDate(
                          task.date || task.scheduleDate || task.taskDeadline
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      statusClasses[getStatusDisplay(task)] ||
                      statusClasses.upcoming
                    } ml-2 flex-shrink-0`}
                  >
                    {capitalize(getStatusDisplay(task))}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No upcoming tasks in the next 7 days.
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
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.string, // MongoDB ID format
      title: PropTypes.string,
      taskName: PropTypes.string,
      date: PropTypes.string,
      scheduleDate: PropTypes.string,
      taskDeadline: PropTypes.string,
      status: PropTypes.string,
      priority: PropTypes.string,
      course: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
  onTaskClick: PropTypes.func.isRequired,
};

export default UpcomingDeadlines;
