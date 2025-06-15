import PropTypes from "prop-types";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  courseColors,
  statusClasses,
  toLocaleDateStringISO,
  getTaskColor,
  getTaskColorClasses,
  isTaskCompleted,
} from "@/lib/calendarHelpers";

function CalendarGrid({ grid, view, onTaskClick, onDateClick, selectedDate }) {
  const todayDateString = toLocaleDateStringISO(new Date());

  return (
    <Card>
      <CardContent className="p-0">
        {view !== "day" && (
          <div className="grid grid-cols-7 border-b text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="border-r p-2 font-medium text-sm text-muted-foreground last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
        )}
        <div
          className={`grid ${view === "day" ? "grid-cols-1" : "grid-cols-7"}`}
        >
          {grid.map((week, weekIndex) =>
            week.map((cell, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[120px] border-b border-r p-1 last:border-r-0 
                ${
                  !cell.isCurrentMonth
                    ? "bg-muted/30 text-muted-foreground"
                    : "bg-background"
                } 
                ${weekIndex === grid.length - 1 ? "border-b-0" : ""}
                ${cell.dateString === selectedDate ? "bg-blue-50" : ""}`}
              >
                <div className="flex justify-between items-center p-1">
                  <span
                    onClick={() => onDateClick(cell.dateString)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium 
                    ${
                      cell.dateString === todayDateString
                        ? "bg-primary text-primary-foreground"
                        : ""
                    } 
                    cursor-pointer hover:bg-gray-200`}
                  >
                    {cell.day}
                  </span>
                  {Array.isArray(cell.tasks) && cell.tasks.length > 0 && (
                    <div className="flex gap-1">
                      {(() => {
                        const events = cell.tasks.filter(
                          (task) => task.type !== "task"
                        );
                        const tasks = cell.tasks.filter(
                          (task) => task.type === "task"
                        );
                        return (
                          <>
                            {events.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5"
                              >
                                {events.length} event
                                {events.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                            {tasks.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 border-blue-300 text-blue-700"
                              >
                                {tasks.length} task{tasks.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <ScrollArea className="h-[80px] pr-2">
                  <div className="space-y-1 p-1">
                    {Array.isArray(cell.tasks) &&
                      cell.tasks.map((task) => {
                        const isTask = task.type === "task";
                        const taskColor = isTask
                          ? getTaskColor(task.priority, task.status)
                          : task.label?.color;
                        const taskColorClasses = isTask
                          ? getTaskColorClasses(task.priority, task.status)
                          : statusClasses[task.status] ||
                            "bg-gray-50 border-gray-200";
                        const completed =
                          isTask && isTaskCompleted(task.status);

                        return (
                          <div
                            key={task.id || task._id}
                            onClick={() => onTaskClick(task)}
                            className={`${
                              isTask
                                ? taskColorClasses + " hover:opacity-80"
                                : statusClasses[task.status] ||
                                  "bg-gray-50 border-gray-200"
                            } flex items-center rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 border ${
                              completed ? "opacity-75" : ""
                            }`}
                            style={
                              taskColor && task.type !== "task"
                                ? {
                                    borderColor: taskColor,
                                    borderLeftWidth: "3px",
                                  }
                                : isTask
                                ? {
                                    borderLeftWidth: "3px",
                                    borderLeftColor: taskColor,
                                  }
                                : {}
                            }
                          >
                            <div
                              className="mr-1.5 h-2 w-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: taskColor || "#6b7280",
                              }}
                            />
                            <div className="flex-grow">
                              <div className="flex items-center">
                                {isTask && completed && (
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                )}
                                {isTask && !completed && (
                                  <span
                                    className="font-medium mr-1"
                                    style={{ color: taskColor }}
                                  >
                                    📋
                                  </span>
                                )}
                                <span
                                  className={`truncate flex-grow ${
                                    completed ? "line-through" : ""
                                  }`}
                                >
                                  {task.title}
                                </span>
                                {isTask && task.priority && (
                                  <span
                                    className="ml-1 px-1 py-0.5 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: `${taskColor}20`,
                                      color: taskColor,
                                      borderColor: taskColor,
                                      border: "1px solid",
                                    }}
                                  >
                                    {task.priority.replace(" Priority", "")}
                                  </span>
                                )}
                              </div>
                              {isTask &&
                                task.status === "On-hold" &&
                                task.onHoldRemark && (
                                  <div className="text-xs text-yellow-700 mt-1 italic truncate">
                                    💬 {task.onHoldRemark}
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

CalendarGrid.propTypes = {
  grid: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        day: PropTypes.number.isRequired,
        dateString: PropTypes.string.isRequired,
        isCurrentMonth: PropTypes.bool.isRequired,
        tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
      })
    )
  ).isRequired,
  view: PropTypes.oneOf(["month", "week", "day"]).isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onDateClick: PropTypes.func.isRequired,
  selectedDate: PropTypes.string,
};

export default CalendarGrid;
