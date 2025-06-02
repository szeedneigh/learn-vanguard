import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseColors, statusClasses, toLocaleDateStringISO } from "@/lib/calendarHelpers";

function CalendarGrid({ grid, view, onTaskClick, onDateClick, selectedDate }) {
  const todayDateString = toLocaleDateStringISO(new Date());

  return (
    <Card>
      <CardContent className="p-0">
        {view !== "day" && (
          <div className="grid grid-cols-7 border-b text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="border-r p-2 font-medium text-sm text-muted-foreground last:border-r-0">
                {day}
              </div>
            ))}
          </div>
        )}
        <div className={`grid ${view === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
          {grid.map((week, weekIndex) =>
            week.map((cell, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[120px] border-b border-r p-1 last:border-r-0 
                ${!cell.isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-background"} 
                ${weekIndex === grid.length - 1 ? 'border-b-0' : ''}
                ${cell.dateString === selectedDate ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-center p-1">
                  <span
                    onClick={() => onDateClick(cell.dateString)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium 
                    ${cell.dateString === todayDateString ? "bg-primary text-primary-foreground" : ""} 
                    cursor-pointer hover:bg-gray-200`}
                  >
                    {cell.day}
                  </span>
                  {Array.isArray(cell.tasks) && cell.tasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">
                      {cell.tasks.length} event{cell.tasks.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[80px] pr-2">
                  <div className="space-y-1 p-1">
                    {Array.isArray(cell.tasks) && cell.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`${statusClasses[task.status]} flex items-center rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 border`}
                      >
                        <div className={`${courseColors[task.course] || 'bg-gray-500'} mr-1.5 h-2 w-2 rounded-full flex-shrink-0`} />
                        <span className="truncate flex-grow">{task.title}</span>
                      </div>
                    ))}
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
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
        day: PropTypes.number.isRequired,
        dateString: PropTypes.string.isRequired,
        isCurrentMonth: PropTypes.bool.isRequired,
        tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    }))).isRequired,
    view: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onDateClick: PropTypes.func.isRequired,
    selectedDate: PropTypes.string,
};

export default CalendarGrid; 