import PropTypes from "prop-types";
import { CheckCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  statusClasses,
  courseColors,
  toLocaleDateStringISO,
  getTaskColor,
  getTaskColorClasses,
  isTaskCompleted,
} from "@/lib/calendarHelpers";

function WeekView({ startDate, events, onEventClick, onDateClick }) {
  // Generate dates for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Group events by date
  const eventsByDate = weekDays.map((date) => {
    const dateString = toLocaleDateStringISO(date);
    return {
      date,
      dateString,
      events: events.filter((event) => {
        // Handle both date and scheduleDate properties
        let eventDate;
        if (event.date) {
          eventDate = new Date(event.date + "T00:00:00");
        } else if (event.scheduleDate) {
          eventDate = new Date(event.scheduleDate);
        } else {
          return false;
        }

        return toLocaleDateStringISO(eventDate) === dateString;
      }),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          {weekDays[0].toLocaleDateString()} -{" "}
          {weekDays[6].toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b text-center">
          {weekDays.map((date, index) => (
            <div
              key={index}
              className="border-r p-2 font-medium text-sm last:border-r-0 cursor-pointer hover:bg-muted/50"
              onClick={() => onDateClick(toLocaleDateStringISO(date))}
            >
              <div className="text-muted-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto mt-1 text-sm font-medium 
                ${
                  toLocaleDateStringISO(date) ===
                  toLocaleDateStringISO(new Date())
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {eventsByDate.map((dayData, index) => (
            <div
              key={index}
              className="border-r min-h-[300px] p-2 last:border-r-0"
            >
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {dayData.events.map((event) => {
                    const isTask = event.type === "task";
                    const taskColor = isTask
                      ? getTaskColor(event.priority, event.status)
                      : event.label?.color;
                    const taskColorClasses = isTask
                      ? getTaskColorClasses(event.priority, event.status)
                      : statusClasses[event.status] ||
                        "bg-gray-50 border-gray-200";
                    const completed = isTask && isTaskCompleted(event.status);

                    return (
                      <div
                        key={event.id || event._id}
                        onClick={() => onEventClick(event)}
                        className={`${
                          isTask
                            ? taskColorClasses + " hover:opacity-80"
                            : statusClasses[event.status] ||
                              "bg-gray-50 border-gray-200"
                        } flex items-center rounded px-2 py-1.5 text-xs cursor-pointer hover:opacity-80 border ${
                          completed ? "opacity-75" : ""
                        }`}
                        style={
                          isTask
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
                            backgroundColor:
                              taskColor ||
                              courseColors[event.course] ||
                              "#6b7280",
                          }}
                        />
                        <div className="flex-grow">
                          <div className="flex items-center">
                            {isTask && completed && (
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            )}
                            {isTask && !completed && (
                              <span
                                className="mr-1"
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
                              {event.title}
                            </span>
                            {isTask && event.priority && (
                              <span
                                className="ml-1 px-1 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${taskColor}20`,
                                  color: taskColor,
                                  borderColor: taskColor,
                                  border: "1px solid",
                                }}
                              >
                                {event.priority.charAt(0)}
                              </span>
                            )}
                          </div>
                          {isTask &&
                            event.status === "On-hold" &&
                            event.onHoldRemark && (
                              <div className="text-xs text-yellow-700 mt-0.5 italic truncate">
                                💬 {event.onHoldRemark}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

WeekView.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.array.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onDateClick: PropTypes.func.isRequired,
};

export default WeekView;
