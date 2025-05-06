import React, { useState, useCallback } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const Events = () => {
  const [view, setView] = useState("month"); // "day", "week", "month"
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([
    { date: "2025-01-13", title: "Project Deadline" },
    { date: "2025-01-13", title: "Team Meeting" },
    { date: "2025-01-16", title: "CT Project Deadline" },
    { date: "2025-01-20", title: "Clearance" },
    { date: "2025-01-25", title: "Appdev Project Submission" },
  ]); // Static events data
  const [showAddEvent, setShowAddEvent] = useState(false); // Modal visibility
  const [newEvent, setNewEvent] = useState({ date: "", title: "" }); // New event data
  const [showMoreEvents, setShowMoreEvents] = useState(false); // Modal for "View More"
  const [selectedDate, setSelectedDate] = useState(null); // Date for "View More" modal
  const today = dayjs();

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startOfWeek = currentDate.startOf("isoWeek");
  const endOfWeek = currentDate.endOf("isoWeek");

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) =>
      view === "month"
        ? prev.subtract(1, "month")
        : view === "week"
        ? prev.subtract(1, "week")
        : prev.subtract(1, "day")
    );
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) =>
      view === "month"
        ? prev.add(1, "month")
        : view === "week"
        ? prev.add(1, "week")
        : prev.add(1, "day")
    );
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(today);
  }, [today]);

  const handleShowAddEvent = () => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      date: view === "day" ? currentDate.format("YYYY-MM-DD") : "",
    }));
    setShowAddEvent(true);
  };
  

  const handleAddEvent = useCallback(() => {
    if (!newEvent.date || !newEvent.title.trim()) {
      alert("Please provide a valid date and title.");
      return;
    }
    setEvents((prevEvents) => [
      ...prevEvents,
      { ...newEvent, date: dayjs(newEvent.date).format("YYYY-MM-DD") },
    ]);
    setShowAddEvent(false);
    setNewEvent({ date: "", title: "" });
  }, [newEvent]);

  const handleDeleteEvent = useCallback(
    (eventToDelete) => {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event !== eventToDelete)
      );
    },
    [events]
  );

  const handleDayClick = (date) => {
    setView("day");
    setCurrentDate(date);
  };

  const handleViewMoreClick = (date) => {
    setSelectedDate(date);
    setShowMoreEvents(true);
  };

  const renderDays = () => {
    const days = [];
    let dateIterator =
      view === "month" ? startOfMonth.startOf("isoWeek") : startOfWeek;
  
    const isWithinRange = (date) =>
      view === "month"
        ? date.isBefore(endOfMonth.endOf("isoWeek").add(1, "day"))
        : date.isBefore(endOfWeek.add(1, "day"));
  
    while (isWithinRange(dateIterator)) {
      days.push(dateIterator);
      dateIterator = dateIterator.add(1, "day");
    }
  
    if (view === "week") {
      days.splice(7);
    }
  
    return days.map((date, idx) => (
      <div
        key={idx}
        className={`border p-5 h-32 flex flex-col relative cursor-pointer ${
          date.isSame(currentDate, "month") || view === "week"
            ? ""
            : "text-gray-400"
        } ${
          date.isSame(today, "day")
            ? "border-blue-500 border-2 text-blue-500 font-bold"
            : ""
        }`}
        onClick={() => handleDayClick(date)}
      >
        <div className="text-sm font-medium">{date.date()}</div>
        <div className="flex-1 overflow-hidden">
          {events
            .filter((event) => dayjs(event.date).isSame(date, "day"))
            .slice(0, 2)
            .map((event, eventIdx) => (
              <div
                key={eventIdx}
                className="text-xs bg-blue-100 text-blue-700 p-1 rounded mt-1"
              >
                {event.title}
              </div>
            ))}
        </div>
        {events.filter((event) => dayjs(event.date).isSame(date, "day")).length >
          2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMoreClick(date);
            }}
            className="text-xs text-gray-500 mt-1 underline"
          >
            + More
          </button>
        )}
      </div>
    ));
  };
  

  const renderDayView = () => {
    const dayEvents = events.filter((event) =>
      dayjs(event.date).isSame(currentDate, "day")
    );

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Events on {currentDate.format("MMMM D, YYYY")}
        </h3>
        <ul>
          {dayEvents.length > 0 ? (
            dayEvents.map((event, idx) => (
              <li
                key={idx}
                className="border p-4 rounded-lg mb-2 bg-gray-100 text-gray-800"
              >
                {event.title}
                <button
                  onClick={() => handleDeleteEvent(event)}
                  className="ml-4 text-red-500 text-sm font-bold"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No events for this day.</p>
          )}
        </ul>
        <button
          onClick={() => setView("month")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Month View
        </button>
      </div>
    );
  };

  const renderMoreEventsModal = () => {
    const moreEvents = events.filter((event) =>
      dayjs(event.date).isSame(selectedDate, "day")
    );

    return (
      showMoreEvents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Events on {dayjs(selectedDate).format("MMMM D, YYYY")}
            </h3>
            <ul>
              {moreEvents.map((event, idx) => (
                <li
                  key={idx}
                  className="border p-4 rounded-lg mb-2 bg-gray-100 text-gray-800"
                >
                  {event.title}
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="ml-4 text-red-500 text-sm font-bold"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowMoreEvents(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Add Event Modal */}
      {showAddEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 pointer-events-auto"
          onClick={() => setShowAddEvent(false)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Add Event</h3>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
              className="w-full border rounded p-2 mb-2"
            />
            <input
              type="text"
              value={newEvent.title}
              maxLength={30}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              placeholder="Event Title (Max 30 characters)"
              className="w-full border rounded p-2 mb-2"
            />
            <p className="text-right text-sm text-gray-500">
              {30 - newEvent.title.length} characters remaining
            </p>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={!newEvent.title || !newEvent.date}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-3xl font-semibold mb-3">
            {currentDate.format("MMMM YYYY")}
          </h2>
          <nav className="flex space-x-4 mb-4">
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1 text-m rounded ${
                view === "day" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-sm rounded ${
                view === "week" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-sm rounded ${
                view === "month" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Month
            </button>
          </nav>
        </div>
        <div className="space-x-2">
          <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white">
            {"<"}
          </button>
          <button onClick={handleToday} className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white">
            Today
          </button>
          <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white">
            {">"}
          </button>
        </div>
      </header>

      {/* Add Event Button */}
      <div className="mb-4">
      <button
        onClick={handleShowAddEvent}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-3 hover:bg-blue-700"
      >
        + Add Event
      </button>
      </div>

      {/* Render Views */}
      {view === "day"
        ? renderDayView()
        : view === "week" || view === "month"
        ? (
          <>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 mt-2">{renderDays()}</div>
          </>
        )
        : null}

      {/* More Events Modal */}
      {renderMoreEventsModal()}
    </div>
  );
};

export default Events;
 