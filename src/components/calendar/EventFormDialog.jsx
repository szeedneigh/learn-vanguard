import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toLocaleDateStringISO } from "@/lib/calendarHelpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const LABEL_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
];

function EventFormDialog({ open, onOpenChange, onSave, onCancel, isLoading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toLocaleDateStringISO(new Date()));
  const [time, setTime] = useState("09:00"); // Default to 9 AM
  const [course, setCourse] = useState("ALL");
  const [yearLevel, setYearLevel] = useState("ALL");
  const [labelColor, setLabelColor] = useState("#3b82f6");
  const [errors, setErrors] = useState({});
  const [yearLevelOptions, setYearLevelOptions] = useState([
    { value: "ALL", label: "All Years" },
    { value: "First Year", label: "First Year" },
    { value: "Second Year", label: "Second Year" },
    { value: "Third Year", label: "Third Year" },
    { value: "Fourth Year", label: "Fourth Year" },
  ]);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setDate(toLocaleDateStringISO(new Date()));
      setTime("09:00"); // Reset time to default
      setCourse("ALL");
      setYearLevel("ALL");
      setLabelColor("#3b82f6");
      setErrors({});
    }
  }, [open]);

  // Update year level options based on selected course
  useEffect(() => {
    if (course === "Associate in Computer Technology") {
      setYearLevelOptions([
        { value: "ALL", label: "All Years" },
        { value: "First Year", label: "First Year" },
        { value: "Second Year", label: "Second Year" },
      ]);
      // Reset year level if it was set to 3rd or 4th year
      if (["Third Year", "Fourth Year"].includes(yearLevel)) {
        setYearLevel("ALL");
      }
    } else {
      setYearLevelOptions([
        { value: "ALL", label: "All Years" },
        { value: "First Year", label: "First Year" },
        { value: "Second Year", label: "Second Year" },
        { value: "Third Year", label: "Third Year" },
        { value: "Fourth Year", label: "Fourth Year" },
      ]);
    }
  }, [course, yearLevel]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (title.length > 30)
      newErrors.title = "Title must be 30 characters or less.";
    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Format data to match backend API
    const eventData = {
      title,
      description,
      scheduleDate: new Date(`${date}T${time}:00`).toISOString(),
      label: {
        text: "General",
        color: labelColor,
      },
      course,
      yearLevel,
      archived: false,
      // Store time separately for easier access in views
      time,
    };

    // Pass the data to the parent component
    onSave(eventData);

    // The form will be closed by the parent component after successful creation
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title (max 30 characters)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
              placeholder="Enter event title"
              required
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
            <div className="text-xs text-right mt-1 text-muted-foreground">
              {title.length}/30
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <div className="flex">
                <Calendar className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time
              </label>
              <div className="flex">
                <Clock className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              {errors.time && (
                <p className="text-xs text-red-500 mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course
              </label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  <SelectItem value="Associate in Computer Technology">
                    Associate in Computer Technology
                  </SelectItem>
                  <SelectItem value="Bachelor of Science in Information Systems">
                    BS Information Systems
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="yearLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year Level
              </label>
              <Select value={yearLevel} onValueChange={setYearLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {yearLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label Color
            </label>
            <RadioGroup
              value={labelColor}
              onValueChange={setLabelColor}
              className="flex flex-wrap gap-3"
            >
              {LABEL_COLORS.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={color.value}
                    id={`color-${color.value}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`color-${color.value}`}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      labelColor === color.value
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EventFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default EventFormDialog;
