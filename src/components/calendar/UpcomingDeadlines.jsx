import PropTypes from 'prop-types';
import { Info } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseColors, statusClasses, capitalize } from "@/lib/calendarHelpers";

function UpcomingDeadlines({ tasks, onTaskClick }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Tasks due in the next 7 days (excluding completed).</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`${courseColors[task.course] || 'bg-gray-500'} h-10 w-1 rounded-full flex-shrink-0`} />
                    <div className="overflow-hidden">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <div className="text-sm text-muted-foreground truncate">
                        {task.course} • Due: {new Date(task.date + 'T00:00:00').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusClasses[task.status]} ml-2 flex-shrink-0`}>
                    {capitalize(task.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines in the next 7 days.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

UpcomingDeadlines.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        course: PropTypes.string.isRequired,
        description: PropTypes.string,
    })).isRequired,
    onTaskClick: PropTypes.func.isRequired,
};

export default UpcomingDeadlines; 