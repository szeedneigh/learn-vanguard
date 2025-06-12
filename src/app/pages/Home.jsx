import { useState, useEffect, useMemo } from "react";
import HeroSection from "@/components/section/HeroSection";
import TaskList from "@/components/section/TaskList";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useEvents } from "@/hooks/useEventsQuery";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format, isSameDay, parseISO } from "date-fns";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format the selected date for display
  const formattedDate = useMemo(() => {
    return format(selectedDate, "MMMM d, yyyy");
  }, [selectedDate]);

  // Get all events for the current month to show indicators
  const currentMonth = useMemo(() => {
    const date = new Date(selectedDate);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  }, [selectedDate]);

  // Format the selected date for API query
  const dateString = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  // Get events for the selected day
  const {
    data: selectedDayEvents = [],
    isLoading: selectedDayEventsLoading,
    isError: selectedDayEventsError,
    refetch: refetchSelectedDayEvents,
  } = useEvents(
    {
      startDate: dateString,
      endDate: dateString,
    },
    {
      // Force refetch when the date changes
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      cacheTime: 0, // Don't cache this query
      staleTime: 0, // Consider data stale immediately
      retry: 1, // Retry once if the request fails
      onSuccess: (data) => {
        console.log(
          `Successfully fetched ${data.length} events for ${dateString}`
        );
      },
      onError: (error) => {
        console.error(`Error fetching events for ${dateString}:`, error);
      },
    }
  );

  // Effect to refetch selected day events when date changes
  useEffect(() => {
    refetchSelectedDayEvents();
  }, [dateString, refetchSelectedDayEvents]);

  const {
    data: monthEvents = [],
    isLoading: monthEventsLoading,
    refetch: refetchMonthEvents,
  } = useEvents(
    {
      startDate: currentMonth.firstDay,
      endDate: currentMonth.lastDay,
    },
    {
      // Force refetch when the month changes
      refetchOnMount: true,
      cacheTime: 60000, // 1 minute cache
    }
  );

  // Effect to refetch month events when month changes
  useEffect(() => {
    refetchMonthEvents();
  }, [currentMonth, refetchMonthEvents]);

  // Create a function to check if a date has events
  const hasEventOnDate = (date) => {
    if (!monthEvents || monthEvents.length === 0) return false;

    // Format the calendar date to YYYY-MM-DD for comparison
    const formattedDate = format(date, "yyyy-MM-dd");

    return monthEvents.some((event) => {
      // First check if we have the pre-formatted date
      if (event._formattedDate) {
        const match = event._formattedDate === formattedDate;
        if (match) {
          console.log(
            `Found match using _formattedDate for ${formattedDate}: ${event.title}`
          );
        }
        return match;
      }

      // Fallback to manual date parsing if _formattedDate is not available
      if (!event.scheduleDate) return false;

      try {
        // Parse event date safely - handle both string and Date objects
        const eventDate =
          typeof event.scheduleDate === "string"
            ? parseISO(event.scheduleDate)
            : new Date(event.scheduleDate);

        if (isNaN(eventDate.getTime())) {
          console.error("Invalid event date:", event.scheduleDate);
          return false;
        }

        // Format event date to YYYY-MM-DD for comparison
        const formattedEventDate = format(eventDate, "yyyy-MM-dd");

        // Compare the formatted dates
        const match = formattedDate === formattedEventDate;

        if (match) {
          console.log(`Found match for ${formattedDate}: ${event.title}`);
        }

        return match;
      } catch (err) {
        console.error("Error comparing dates:", err, event);
        return false;
      }
    });
  };

  // Debug: Log events when they change
  useEffect(() => {
    console.log("Month events loaded:", monthEvents.length, "events");
    console.log(
      "Month range:",
      currentMonth.firstDay,
      "to",
      currentMonth.lastDay
    );

    if (monthEvents.length > 0) {
      console.log("All month events:");
      monthEvents.forEach((event) => {
        try {
          // Handle both string and Date objects
          const eventDate =
            typeof event.scheduleDate === "string"
              ? parseISO(event.scheduleDate)
              : new Date(event.scheduleDate);

          console.log("Event:", {
            id: event._id || event.id,
            title: event.title,
            date: event.scheduleDate,
            formattedDate: format(eventDate, "yyyy-MM-dd"),
            rawDate: eventDate.toString(),
          });
        } catch (err) {
          console.error("Error formatting event date:", err, event);
        }
      });
    }

    console.log(
      "Selected day events loaded:",
      selectedDayEvents.length,
      "events for",
      dateString
    );

    if (selectedDayEvents.length > 0) {
      selectedDayEvents.forEach((event) => {
        try {
          // Handle both string and Date objects
          const eventDate =
            typeof event.scheduleDate === "string"
              ? parseISO(event.scheduleDate)
              : new Date(event.scheduleDate);

          console.log("Selected day event:", {
            id: event._id || event.id,
            title: event.title,
            date: event.scheduleDate,
            formattedDate: format(eventDate, "yyyy-MM-dd"),
            matches: format(eventDate, "yyyy-MM-dd") === dateString,
          });
        } catch (err) {
          console.error("Error formatting selected event date:", err, event);
        }
      });
    } else {
      console.log("No events found for selected day:", dateString);
    }
  }, [monthEvents, selectedDayEvents, dateString, selectedDate, currentMonth]);

  // Additional component loading state
  useEffect(() => {
    console.log("Home component mounted");
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-red-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message ||
              "An unexpected error occurred in the Dashboard Home component"}
            <Button
              className="mt-4 w-full"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            Loading dashboard...
          </h3>
          <p className="text-slate-500 mt-2">
            Please wait while we prepare your dashboard
          </p>
        </div>
      </div>
    );
  }

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
    try {
      // Use pre-formatted time if available
      const time =
        event._displayTime ||
        (() => {
          // Handle both string and Date objects
          const eventDate =
            typeof event.scheduleDate === "string"
              ? parseISO(event.scheduleDate)
              : new Date(event.scheduleDate);

          return eventDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        })();

      return {
        id: event._id || event.id,
        title: event.title,
        time,
        type: event.label?.text?.toLowerCase() || event.type || "event",
        date:
          event._formattedDate ||
          format(parseISO(event.scheduleDate), "yyyy-MM-dd"),
      };
    } catch (err) {
      console.error("Error formatting event for display:", err, event);
      return {
        id: event._id || event.id,
        title: event.title,
        time: "Invalid time",
        type: event.label?.text?.toLowerCase() || event.type || "event",
        date: "Invalid date",
      };
    }
  };

  // Wrap rendering in try-catch to catch any runtime errors
  try {
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
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg"
                    modifiers={{
                      hasEvent: (date) => hasEventOnDate(date),
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: "bold",
                        textDecoration: "underline",
                        color: "var(--blue-600)",
                      },
                    }}
                  />
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Events on {formattedDate}
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "Force refetching events for:",
                            dateString
                          );
                          refetchSelectedDayEvents();
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Refresh
                      </Button>
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
                  </div>

                  <div className="space-y-3">
                    {selectedDayEventsLoading ? (
                      <Card className="shadow-lg bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-6 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-slate-500">Loading events...</p>
                        </CardContent>
                      </Card>
                    ) : selectedDayEventsError ? (
                      <Card className="shadow-lg bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-6 text-center text-red-500">
                          <p>Failed to load events</p>
                        </CardContent>
                      </Card>
                    ) : selectedDayEvents.length > 0 ? (
                      selectedDayEvents.map((event) => {
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
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center text-slate-500">
                          <CalendarIcon className="h-12 w-12 text-slate-300 mb-2" />
                          <p>No events scheduled for {formattedDate}</p>
                          <p className="text-sm mt-2">
                            Select another date or add an event from the Events
                            page
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="mt-4"
                          >
                            <Link to="/dashboard/events">Go to Events</Link>
                          </Button>
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
  } catch (err) {
    console.error("Error rendering Home component:", err);
    setError(err);
    return null;
  }
};

export default Home;
