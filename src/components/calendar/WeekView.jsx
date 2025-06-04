import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { statusClasses, courseColors, toLocaleDateStringISO } from "@/lib/calendarHelpers";

function WeekView({ startDate, events, onEventClick, onDateClick }) {
  // Generate dates for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
  
  // Group events by date
  const eventsByDate = weekDays.map(date => {
    const dateString = toLocaleDateStringISO(date);
    return {
      date,
      dateString,
      events: events.filter(event => {
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
      })
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
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
              <div className="text-muted-foreground">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto mt-1 text-sm font-medium 
                ${toLocaleDateStringISO(date) === toLocaleDateStringISO(new Date()) ? "bg-primary text-primary-foreground" : ""}`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {eventsByDate.map((dayData, index) => (
            <div key={index} className="border-r min-h-[300px] p-2 last:border-r-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {dayData.events.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`${statusClasses[event.status]} flex items-center rounded px-2 py-1.5 text-xs cursor-pointer hover:opacity-80 border`}
                    >
                      <div className={`${courseColors[event.course] || 'bg-gray-500'} mr-1.5 h-2 w-2 rounded-full flex-shrink-0`} />
                      <span className="truncate flex-grow">{event.title}</span>
                    </div>
                  ))}
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