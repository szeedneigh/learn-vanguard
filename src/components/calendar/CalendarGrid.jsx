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
  getContentTypeInfo,
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
                onClick={() => onDateClick(cell.dateString)}
                className={`min-h-[120px] border-b border-r p-1 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors
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
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium
                    ${
                      cell.dateString === todayDateString
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {cell.day}
                  </span>
                </div>
                <ScrollArea className="h-[80px] pr-2">
                  <div className="space-y-1 p-1">
                    {Array.isArray(cell.tasks) &&
                      cell.tasks.map((task) => {
                        const contentTypeInfo = getContentTypeInfo(task);
                        const isTask = contentTypeInfo.type === "task";
                        const isAnnouncement =
                          contentTypeInfo.type === "announcement";
                        const isEvent = contentTypeInfo.type === "event";

                        const taskColor = isTask
                          ? getTaskColor(task.priority, task.status)
                          : isAnnouncement
                          ? "#8B5CF6" // Purple for announcements
                          : task.label?.color || "#3B82F6"; // Blue for events

                        const taskColorClasses = isTask
                          ? getTaskColorClasses(task.priority, task.status)
                          : isAnnouncement
                          ? "bg-purple-50 border-purple-200"
                          : statusClasses[task.status] ||
                            "bg-blue-50 border-blue-200";

                        const completed =
                          isTask && isTaskCompleted(task.status);

                        return (
                          <div
                            key={task.id || task._id}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering date click
                              onTaskClick(task);
                            }}
                            className={`${taskColorClasses} flex items-center rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 border ${
                              completed ? "opacity-75" : ""
                            }`}
                            style={{
                              borderLeftWidth: "3px",
                              borderLeftColor: taskColor,
                            }}
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
                                {!completed && (
                                  <span
                                    className="font-medium mr-1"
                                    style={{ color: taskColor }}
                                  >
                                    {contentTypeInfo.icon}
                                  </span>
                                )}
                                <span
                                  className={`truncate flex-grow ${
                                    completed ? "line-through" : ""
                                  }`}
                                >
                                  {task.title}
                                </span>
                                {(isTask || isAnnouncement) &&
                                  task.priority && (
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
                                {isEvent && (
                                  <span className="ml-1 px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                                    Event
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
