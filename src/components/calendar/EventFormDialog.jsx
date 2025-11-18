import logger from "@/utils/logger";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const LABEL_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
];
function EventFormDialog({
  open,
  onOpenChange,
  onSave,
  onCancel,
  isLoading,
  event,
}) {
  const { user } = useAuth();
  const isPIO = user?.role?.toLowerCase() === "pio";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  // Debug: Log user role information
  React.useEffect(() => {
    logger.log("[EventFormDialog] User role debug:", {
      userRole: user?.role,
      userRoleLowerCase: user?.role?.toLowerCase(),
      isPIO,
      isAdmin,
      assignedClass: user?.assignedClass,
    });
  }, [user?.role, isPIO, isAdmin, user?.assignedClass]);
  // Check if PIO user can edit this event (only if they created it)
  const canEditEvent = useMemo(() => {
    if (!event) return true; // Creating new event
    if (isAdmin) return true; // Admin can edit all events
    if (isPIO) {
      // PIO can only edit events they created
      const eventCreatorId = event.createdBy || event.userId;
      const currentUserId = user?.id;
      return (
        eventCreatorId &&
        currentUserId &&
        (eventCreatorId === currentUserId ||
          eventCreatorId.toString() === currentUserId.toString())
      );
    }
    return false; // Students cannot edit events
  }, [event, isAdmin, isPIO, user?.id]);
  // Parse assigned class for PIO users with enhanced validation
  const assignedClassInfo = useMemo(() => {
    if (!isPIO || !user?.assignedClass) {
      logger.log("[EventFormDialog] assignedClassInfo: null", {
        isPIO,
        hasAssignedClass: !!user?.assignedClass,
      });
      return null;
    const parts = user.assignedClass.split(" - ");
    if (parts.length !== 2) {
      logger.error("Invalid assignedClass format:", user.assignedClass);
    const classInfo = {
      course: parts[0],
      yearLevel: parts[1],
    };
    logger.log("[EventFormDialog] assignedClassInfo parsed:", classInfo);
    return classInfo;
  }, [isPIO, user?.assignedClass]);
  // Enhanced loading state management
  const isUserDataLoading = useMemo(() => {
    // If user is PIO but assignedClassInfo is not available, we're still loading
    if (isPIO && !assignedClassInfo && user) {
      logger.log("[EventFormDialog] User data still loading for PIO", {
        hasUser: !!user,
        userRole: user?.role,
        userAssignedClass: user?.assignedClass,
        assignedClassInfo,
      return true;
    // Also check if we're waiting for user data entirely
    if (!user && open) {
      logger.log("[EventFormDialog] Waiting for user data to load");
    return false;
  }, [isPIO, assignedClassInfo, user, open]);
  // Helper function to get initial course value
  const getInitialCourse = useCallback(() => {
    if (event?.course) return event.course;
    if (isPIO && assignedClassInfo) return assignedClassInfo.course;
    return "ALL";
  }, [event?.course, isPIO, assignedClassInfo]);
  // Helper function to get initial year level value
  const getInitialYearLevel = useCallback(() => {
    if (event?.yearLevel) return event.yearLevel;
    if (isPIO && assignedClassInfo) return assignedClassInfo.yearLevel;
  }, [event?.yearLevel, isPIO, assignedClassInfo]);
  // Define state variables with proper initialization
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date, setDate] = useState(
    event?.scheduleDate
      ? event.scheduleDate.substring(0, 10)
      : toLocaleDateStringISO(new Date())
  );
  const [time, setTime] = useState(
    event?.time ||
      (event?.scheduleDate
        ? new Date(event.scheduleDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "09:00")
  // Initialize course and year level with proper defaults
  const [course, setCourse] = useState(() => getInitialCourse());
  const [yearLevel, setYearLevel] = useState(() => getInitialYearLevel());
  const [labelColor, setLabelColor] = useState(
    event?.label?.color || "#3b82f6"
  const [errors, setErrors] = useState({});
  // Track if form has been properly initialized for PIO users
  const [isPIOFormInitialized, setIsPIOFormInitialized] = useState(false);
  // Debug: Log user and assignedClassInfo on every render
    logger.log("[EventFormDialog] Render state:", {
      user: user
        ? { id: user.id, role: user.role, assignedClass: user.assignedClass }
        : null,
      assignedClassInfo,
      isUserDataLoading,
      course,
      yearLevel,
      isPIOFormInitialized,
  }, [
    user,
    assignedClassInfo,
    isPIO,
    isUserDataLoading,
    course,
    yearLevel,
    isPIOFormInitialized,
  ]);
  // Critical: Initialize PIO form fields when assignedClassInfo becomes available
  useEffect(() => {
    if (isPIO && assignedClassInfo && !isPIOFormInitialized && open) {
      logger.log("[EventFormDialog] Initializing PIO form fields:", {
        currentCourse: course,
        currentYearLevel: yearLevel,
        isEditing: !!event,
      // Always set the correct values for PIO users, even when editing
      // This ensures restrictions are enforced after page reload
      setCourse(assignedClassInfo.course);
      setYearLevel(assignedClassInfo.yearLevel);
      setIsPIOFormInitialized(true);
    event,
    open,
  // Additional safety: Validate PIO restrictions on every render
  const pioRestrictionViolation = useMemo(() => {
    if (!isPIO || !assignedClassInfo || !open) return null;
    const violations = [];
    if (course && course !== assignedClassInfo.course) {
      violations.push(`Course must be "${assignedClassInfo.course}"`);
    if (yearLevel && yearLevel !== assignedClassInfo.yearLevel) {
      violations.push(`Year level must be "${assignedClassInfo.yearLevel}"`);
    return violations.length > 0 ? violations : null;
  }, [isPIO, assignedClassInfo, course, yearLevel, open]);
  // Reset initialization flag when user changes or dialog opens/closes
    if (!open || !isPIO) {
      setIsPIOFormInitialized(false);
  }, [open, isPIO]);
  // Show loading spinner if user data is still loading
  if (isUserDataLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin mr-2" />
            <span>
              {isPIO
                ? "Loading your assigned class information..."
                : "Loading user information..."}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // Define course options based on user role and assigned class
  const courseOptions = useMemo(() => {
    if (isPIO && assignedClassInfo) {
      // PIO users can only create events for their assigned class
      return [
        { value: assignedClassInfo.course, label: assignedClassInfo.course },
      ];
    return [
      { value: "ALL", label: "All Courses" },
      {
        value: "Bachelor of Science in Information Systems",
        label: "BS Information Systems",
      },
        value: "Associate in Computer Technology",
        label: "Associate in Computer Technology",
    ];
  }, [isPIO, assignedClassInfo]);
  // Define year level options based on user role, assigned class, and selected course
  const yearLevelOptions = useMemo(() => {
      // PIO users can only create events for their assigned year level
        {
          value: assignedClassInfo.yearLevel,
          label: assignedClassInfo.yearLevel,
        },
    const baseOptions = [{ value: "ALL", label: "All Years" }];
    const isACT = course === "Associate in Computer Technology";
    const yearOptions = isACT
      ? ["First Year", "Second Year"]
      : ["First Year", "Second Year", "Third Year", "Fourth Year"];
      ...baseOptions,
      ...yearOptions.map((year) => ({ value: year, label: year })),
  }, [isPIO, assignedClassInfo, course]);
  // Effect to handle form reset and initialization
    if (open) {
      logger.log("[EventFormDialog] Form initialization triggered", {
        event: !!event,
        assignedClassInfo: !!assignedClassInfo,
      if (event) {
        // Pre-populate form for editing
        setTitle(event.title || "");
        setDescription(event.description || "");
        setDate(
          event.scheduleDate
            ? event.scheduleDate.substring(0, 10)
            : toLocaleDateStringISO(new Date())
        );
        setTime(
          event.time ||
            (event.scheduleDate
              ? new Date(event.scheduleDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "09:00")
        // For editing, use event values or fallback to assigned class
        setCourse(event.course || getInitialCourse());
        setYearLevel(event.yearLevel || getInitialYearLevel());
        setLabelColor(event.label?.color || "#3b82f6");
      } else {
        // Reset form for new event
        setTitle("");
        setDescription("");
        setDate(toLocaleDateStringISO(new Date()));
        setTime("09:00");
        setLabelColor("#3b82f6");
        // Set initial course and year level based on role and assigned class
        const initialCourse = getInitialCourse();
        const initialYearLevel = getInitialYearLevel();
        logger.log("[EventFormDialog] Setting initial values:", {
          initialCourse,
          initialYearLevel,
        });
        setCourse(initialCourse);
        setYearLevel(initialYearLevel);
      }
      setErrors({});
  }, [open, event, getInitialCourse, getInitialYearLevel]);
  // Critical: Enforce PIO restrictions whenever assignedClassInfo becomes available
    if (isPIO && assignedClassInfo && open) {
      logger.log("[EventFormDialog] Enforcing PIO restrictions:", {
        requiredCourse: assignedClassInfo.course,
        requiredYearLevel: assignedClassInfo.yearLevel,
      // Force correct values for PIO users
      if (course !== assignedClassInfo.course) {
        logger.log(
          "[EventFormDialog] Correcting course:",
          course,
          "->",
          assignedClassInfo.course
        setCourse(assignedClassInfo.course);
      if (yearLevel !== assignedClassInfo.yearLevel) {
          "[EventFormDialog] Correcting yearLevel:",
          yearLevel,
          assignedClassInfo.yearLevel
        setYearLevel(assignedClassInfo.yearLevel);
  }, [isPIO, assignedClassInfo, open, course, yearLevel]);
  // Additional safety net: Prevent any unauthorized changes to course/yearLevel for PIO users
      // This effect runs whenever course or yearLevel changes
      // If a PIO user somehow gets unauthorized values, correct them immediately
      if (course !== assignedClassInfo.course && course !== "ALL") {
        logger.warn(
          "[EventFormDialog] Unauthorized course change detected, reverting:",
      if (yearLevel !== assignedClassInfo.yearLevel && yearLevel !== "ALL") {
          "[EventFormDialog] Unauthorized yearLevel change detected, reverting:",
  }, [course, yearLevel, isPIO, assignedClassInfo]);
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (title.length > 30)
      newErrors.title = "Title must be 30 characters or less.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";
    // Date validation - prevent past dates
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      if (selectedDate < today) {
        newErrors.date = "Event date cannot be in the past.";
    // Add PIO restriction validation
    if (pioRestrictionViolation) {
      newErrors.role = `PIO access restriction: ${pioRestrictionViolation.join(
        ", "
      )}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Final validation for PIO users
      if (
        course !== assignedClassInfo.course ||
        yearLevel !== assignedClassInfo.yearLevel
      ) {
        logger.error(
          "[EventFormDialog] PIO restriction violation detected at submit:",
          {
            submittedCourse: course,
            submittedYearLevel: yearLevel,
            requiredCourse: assignedClassInfo.course,
            requiredYearLevel: assignedClassInfo.yearLevel,
          }
        setErrors({
          role: "PIO users can only create events for their assigned class. Please refresh the page and try again.",
        return;
    // Format data to match backend API
    const eventData = {
      title,
      description,
      scheduleDate: new Date(`${date}T${time}:00`).toISOString(),
      label: {
        text: "General",
        color: labelColor,
      archived: false,
      // Store time separately for easier access in views
      time,
    logger.log("[EventFormDialog] Submitting event data:", {
      ...eventData,
      hasTitle: !!eventData.title,
      hasDescription: !!eventData.description,
      titleLength: eventData.title?.length,
      descriptionLength: eventData.description?.length,
    // Pass the data to the parent component
    onSave(eventData);
    // The form will be closed by the parent component after successful creation
  // Show unauthorized message if PIO tries to edit event they didn't create
  if (event && !canEditEvent) {
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You can only edit events that you created.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              PIO users can only edit events they created. This event was
              created by another user.
            </div>
          <DialogFooter>
            <Button onClick={onCancel} variant="outline">
              Close
            </Button>
          </DialogFooter>
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
          <DialogDescription>
            {event
              ? "Update the details of your event."
              : "Add a new event to your calendar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* PIO Restriction Notice */}
          {isPIO && assignedClassInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm">
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <div>
                  <strong>PIO Access Restrictions Active</strong>
                  <p className="text-xs mt-1">
                    You can only create events for: {assignedClassInfo.course} -{" "}
                    {assignedClassInfo.yearLevel}
                  </p>
                </div>
              </div>
          )}
          {errors.role && (
              {errors.role}
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
              htmlFor="description"
              Description
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
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
                  min={toLocaleDateStringISO(new Date())} // Prevent past dates
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
                htmlFor="time"
                Time
                <Clock className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
              {errors.time && (
                <p className="text-xs text-red-500 mt-1">{errors.time}</p>
                htmlFor="course"
                Course
              <Select
                value={course}
                onValueChange={(value) => {
                  // Prevent unauthorized changes for PIO users
                  if (
                    isPIO &&
                    assignedClassInfo &&
                    value !== assignedClassInfo.course
                  ) {
                    logger.warn(
                      "[EventFormDialog] Attempted unauthorized course change blocked:",
                      value
                    );
                    return;
                  }
                  setCourse(value);
                }}
                disabled={isPIO && assignedClassInfo} // Disable for PIO users
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isPIO && assignedClassInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  🔒 PIO users can only create events for their assigned class:{" "}
                  {assignedClassInfo.course}
                </p>
                htmlFor="yearLevel"
                Year Level
                value={yearLevel}
                    value !== assignedClassInfo.yearLevel
                      "[EventFormDialog] Attempted unauthorized yearLevel change blocked:",
                  setYearLevel(value);
                  <SelectValue placeholder="Select year level" />
                  {yearLevelOptions.map((option) => (
                  🔒 Restricted to: {assignedClassInfo.yearLevel}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label Color
            <RadioGroup
              value={labelColor}
              onValueChange={setLabelColor}
              className="flex flex-wrap gap-3"
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
              ))}
            </RadioGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              Cancel
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {event ? "Update Event" : "Add Event"}
        </form>
      </DialogContent>
    </Dialog>
}
EventFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  event: PropTypes.object, // new prop for editing
};
export default EventFormDialog;
