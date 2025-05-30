import { useState } from "react";
import HeroSection from "@/components/section/HeroSection";
import TaskList from "@/components/section/TaskList";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTodayEvents } from "@/hooks/useEventsQuery";

const Home = () => {
  const [date, setDate] = useState(new Date());

  // Get today's events from backend
  const { 
    data: todaysEvents = [], 
    isLoading: eventsLoading, 
    isError: eventsError 
  } = useTodayEvents();

  const getEventTypeStyles = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100";
      case "deadline":
        return "bg-red-50 text-red-700 shadow-sm shadow-red-100";
      case "workshop":
        return "bg-green-50 text-green-700 shadow-sm shadow-green-100";
      case "course":
        return "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100";
      default:
        return "bg-slate-50 text-slate-700 shadow-sm";
    }
  };

  // Format event for display
  const formatEvent = (event) => {
    const eventDate = new Date(event.scheduleDate);
    const time = eventDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    return {
      id: event._id,
      title: event.title,
      time,
      type: event.label?.text?.toLowerCase() || 'event'
    };
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          <HeroSection />
          <Card>
            <TaskList />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="rounded-xl shadow-lg bg-white p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg"
                />
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Today&apos;s Events
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <Link
                      to="/dashboard/events"
                      className="flex items-center gap-2"
                    >
                      View all
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  {eventsLoading ? (
                    <Card className="shadow-lg bg-white/50 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-slate-500">Loading events...</p>
                      </CardContent>
                    </Card>
                  ) : eventsError ? (
                    <Card className="shadow-lg bg-white/50 backdrop-blur-sm">
                      <CardContent className="p-6 text-center text-red-500">
                        <p>Failed to load events</p>
                      </CardContent>
                    </Card>
                  ) : todaysEvents.length > 0 ? (
                    todaysEvents.map((event) => {
                      const formattedEvent = formatEvent(event);
                      return (
                        <Card
                          key={formattedEvent.id}
                          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-slate-900">
                                  {formattedEvent.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {formattedEvent.time}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getEventTypeStyles(
                                  formattedEvent.type
                                )}`}
                              >
                                {formattedEvent.type}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="shadow-lg bg-white/50 backdrop-blur-sm">
                      <CardContent className="p-6 text-center text-slate-500">
                        <p>No events scheduled for today</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
