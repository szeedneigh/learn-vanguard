import PropTypes from "prop-types";
import { CheckCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  statusClasses,
  courseColors,
  toLocaleDateStringISO,
  getTaskColor,
  getTaskColorClasses,
  isTaskCompleted,
  getContentTypeInfo,
} from "@/lib/calendarHelpers";

function DayView({ date, events, onEventClick }) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
  const formattedDate = date.toLocaleDateString("default", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Convert date to string for comparison
  const dateString = toLocaleDateStringISO(date);

  // Filter events for this day
  const dayEvents = events.filter((event) => {
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
  });

  // Group events by hour
  const eventsByHour = {};
  dayEvents.forEach((event) => {
    let hour = 9; // Default to 9 AM if no time specified

    if (event.scheduleDate) {
      const eventDate = new Date(event.scheduleDate);
      hour = eventDate.getHours();
    } else if (event.time) {
      // Parse time string like "09:00" or "14:30"
      hour = parseInt(event.time.split(":")[0], 10);
    }

    // Ensure hour is within our display range
    if (hour < 7) hour = 7;
    if (hour > 20) hour = 20;

    if (!eventsByHour[hour]) {
      eventsByHour[hour] = [];
    }
    eventsByHour[hour].push(event);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formattedDate}</CardTitle>
        <CardDescription>Daily schedule</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          {timeSlots.map((hour) => {
            return (
              <div key={hour} className="flex border-b py-2">
                <div className="w-16 flex-shrink-0 text-center text-sm text-muted-foreground">
                  {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-grow">
                  {eventsByHour[hour] &&
                    eventsByHour[hour].map((event) => {
                      const contentTypeInfo = getContentTypeInfo(event);
                      const isTask = contentTypeInfo.type === "task";
                      const isAnnouncement =
                        contentTypeInfo.type === "announcement";
                      const isEvent = contentTypeInfo.type === "event";

                      const taskColor = isTask
                        ? getTaskColor(event.priority, event.status)
                        : isAnnouncement
                        ? "#8B5CF6" // Purple for announcements
                        : event.label?.color || "#3B82F6"; // Blue for events

                      const taskColorClasses = isTask
                        ? getTaskColorClasses(event.priority, event.status)
                        : isAnnouncement
                        ? "bg-purple-50 border-purple-200"
                        : statusClasses[event.status] ||
                          "bg-blue-50 border-blue-200";

                      const completed = isTask && isTaskCompleted(event.status);

                      return (
                        <div
                          key={event.id || event._id}
                          onClick={() => onEventClick(event)}
                          className={`${taskColorClasses} flex items-center mb-1 rounded px-3 py-1.5 text-sm cursor-pointer hover:opacity-80 border ${
                            completed ? "opacity-75" : ""
                          }`}
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: taskColor,
                          }}
                        >
                          <div
                            className="mr-2 h-3 w-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: taskColor || "#6b7280",
                            }}
                          />
                          <div className="flex-grow">
                            <div className="font-medium flex items-center">
                              {isTask && completed && (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                              )}
                              {!completed && (
                                <span
                                  className="mr-1"
                                  style={{ color: taskColor }}
                                >
                                  {contentTypeInfo.icon}
                                </span>
                              )}
                              <span className={completed ? "line-through" : ""}>
                                {event.title}
                              </span>
                              {(isTask || isAnnouncement) && event.priority && (
                                <span
                                  className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `${taskColor}20`,
                                    color: taskColor,
                                    borderColor: taskColor,
                                    border: "1px solid",
                                  }}
                                >
                                  {event.priority.replace(" Priority", "")}
                                </span>
                              )}
                              {isEvent && (
                                <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                                  Event
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {event.description}
                              </div>
                            )}
                            {isTask && event.status && (
                              <div
                                className="text-xs mt-0.5 font-medium"
                                style={{ color: taskColor }}
                              >
                                Status: {event.status}
                                {completed && (
                                  <span className="ml-1 text-green-600">✓</span>
                                )}
                              </div>
                            )}
                            {event.type === "task" &&
                              event.status === "On-hold" &&
                              event.onHoldRemark && (
                                <div className="text-xs mt-1 text-yellow-700 italic bg-yellow-50 p-1 rounded">
                                  💬 {event.onHoldRemark}
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

DayView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.array.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default DayView;
