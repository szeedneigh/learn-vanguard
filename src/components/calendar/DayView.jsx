import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { statusClasses, courseColors, toLocaleDateStringISO } from "@/lib/calendarHelpers";

function DayView({ date, events, onEventClick }) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
  const formattedDate = date.toLocaleDateString("default", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Convert date to string for comparison
  const dateString = toLocaleDateStringISO(date);
  
  // Filter events for this day
  const dayEvents = events.filter(event => {
    // Handle both date and scheduleDate properties
    let eventDate;
    if (event.date) {
      eventDate = new Date(event.date + 'T00:00:00');
    } else if (event.scheduleDate) {
      eventDate = new Date(event.scheduleDate);
    } else {
      return false;
    }
    
    return toLocaleDateStringISO(eventDate) === dateString;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formattedDate}</CardTitle>
        <CardDescription>Daily schedule</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          {timeSlots.map(hour => {
            // All events are shown for each hour since we don't have time information
            return (
              <div key={hour} className="flex border-b py-2">
                <div className="w-16 flex-shrink-0 text-center text-sm text-muted-foreground">
                  {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-grow">
                  {hour === 9 && dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`${statusClasses[event.status]} flex items-center mb-1 rounded px-3 py-1.5 text-sm cursor-pointer hover:opacity-80 border`}
                    >
                      <div className={`${courseColors[event.course] || 'bg-gray-500'} mr-2 h-3 w-3 rounded-full flex-shrink-0`} />
                      <span className="truncate flex-grow">{event.title}</span>
                    </div>
                  ))}
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