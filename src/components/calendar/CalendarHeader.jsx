import { useMemo, useContext } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from 'prop-types';
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";

function CalendarHeader({ currentDate, currentView, onPrevious, onNext, onViewChange, onAddEvent }) {
  const formattedDate = useMemo(() => {
    if (currentView === "month") {
      return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    } else if (currentView === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `Week of ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else {
      return currentDate.toLocaleDateString("default", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  }, [currentDate, currentView]);

  const { user } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold min-w-[200px] text-center">{formattedDate}</h2>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={currentView} onValueChange={onViewChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
        {(user?.role === ROLES.STUDENT || user?.role === ROLES.PIO) && (
          <Button onClick={onAddEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
}

CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  currentView: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onAddEvent: PropTypes.func.isRequired,
};

export default CalendarHeader; 