import {
  getTaskColor,
  getTaskColorClasses,
  getStatusColorClasses,
  normalizeStatus,
  normalizePriority,
  isTaskCompleted,
} from "../src/lib/calendarHelpers";

describe("Calendar Helpers - Priority-based Color Coding", () => {
  describe("getTaskColor", () => {
    test("should return green for completed tasks regardless of priority", () => {
      expect(getTaskColor("High Priority", "Completed")).toBe("#10B981");
      expect(getTaskColor("Medium Priority", "Completed")).toBe("#10B981");
      expect(getTaskColor("Low Priority", "Completed")).toBe("#10B981");
      expect(getTaskColor(undefined, "Completed")).toBe("#10B981");
    });

    test("should return yellow for on-hold tasks regardless of priority", () => {
      expect(getTaskColor("High Priority", "On-hold")).toBe("#F59E0B");
      expect(getTaskColor("Medium Priority", "On-hold")).toBe("#F59E0B");
      expect(getTaskColor("Low Priority", "On-hold")).toBe("#F59E0B");
      expect(getTaskColor(undefined, "On-hold")).toBe("#F59E0B");
    });

    test("should return priority-based colors for non-completed tasks (matches main task page)", () => {
      expect(getTaskColor("High Priority", "In progress")).toBe("#EF4444"); // Red
      expect(getTaskColor("Medium Priority", "In progress")).toBe("#F59E0B"); // Amber (matches main task page)
      expect(getTaskColor("Low Priority", "In progress")).toBe("#10B981"); // Green (matches main task page)
    });

    test("should return default blue for unspecified priority", () => {
      expect(getTaskColor(undefined, "In progress")).toBe("#6366F1");
      expect(getTaskColor("", "In progress")).toBe("#6366F1");
      expect(getTaskColor("Unknown Priority", "In progress")).toBe("#6366F1");
    });

    test("should handle various status values", () => {
      expect(getTaskColor("High Priority", "Not started")).toBe("#EF4444");
      expect(getTaskColor("High Priority", "Pending")).toBe("#EF4444");
      expect(getTaskColor("High Priority", "Active")).toBe("#EF4444");
    });
  });

  describe("getTaskColorClasses", () => {
    test("should return green classes for completed tasks", () => {
      const classes = getTaskColorClasses("High Priority", "Completed");
      expect(classes).toBe("bg-green-50 border-green-200 text-green-800");
    });

    test("should return yellow classes for on-hold tasks", () => {
      const classes = getTaskColorClasses("Medium Priority", "On-hold");
      expect(classes).toBe("bg-yellow-50 border-yellow-200 text-yellow-800");
    });

    test("should return priority-based classes for other statuses", () => {
      expect(getTaskColorClasses("High Priority", "In progress")).toBe(
        "bg-red-50 border-red-200 text-red-800"
      );

      expect(getTaskColorClasses("Medium Priority", "In progress")).toBe(
        "bg-orange-50 border-orange-200 text-orange-800"
      );

      expect(getTaskColorClasses("Low Priority", "In progress")).toBe(
        "bg-gray-50 border-gray-200 text-gray-800"
      );
    });

    test("should return default blue classes for unspecified priority", () => {
      const classes = getTaskColorClasses(undefined, "In progress");
      expect(classes).toBe("bg-blue-50 border-blue-200 text-blue-800");
    });
  });

  describe("isTaskCompleted", () => {
    test("should return true for completed status", () => {
      expect(isTaskCompleted("Completed")).toBe(true);
    });

    test("should return false for non-completed statuses", () => {
      expect(isTaskCompleted("In progress")).toBe(false);
      expect(isTaskCompleted("On-hold")).toBe(false);
      expect(isTaskCompleted("Not started")).toBe(false);
      expect(isTaskCompleted("Pending")).toBe(false);
      expect(isTaskCompleted("")).toBe(false);
      expect(isTaskCompleted(undefined)).toBe(false);
    });

    test("should be case sensitive", () => {
      expect(isTaskCompleted("completed")).toBe(false);
      expect(isTaskCompleted("COMPLETED")).toBe(false);
      expect(isTaskCompleted("Completed")).toBe(true);
    });
  });

  describe("Color Accessibility", () => {
    test("should use distinct colors for different priorities", () => {
      const highColor = getTaskColor("High Priority", "In progress");
      const mediumColor = getTaskColor("Medium Priority", "In progress");
      const lowColor = getTaskColor("Low Priority", "In progress");
      const defaultColor = getTaskColor(undefined, "In progress");

      // All colors should be different
      expect(highColor).not.toBe(mediumColor);
      expect(mediumColor).not.toBe(lowColor);
      expect(lowColor).not.toBe(defaultColor);
      expect(highColor).not.toBe(defaultColor);
    });

    test("should use valid hex color codes", () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      expect(getTaskColor("High Priority", "In progress")).toMatch(
        hexColorRegex
      );
      expect(getTaskColor("Medium Priority", "In progress")).toMatch(
        hexColorRegex
      );
      expect(getTaskColor("Low Priority", "In progress")).toMatch(
        hexColorRegex
      );
      expect(getTaskColor(undefined, "In progress")).toMatch(hexColorRegex);
      expect(getTaskColor("High Priority", "Completed")).toMatch(hexColorRegex);
      expect(getTaskColor("High Priority", "On-hold")).toMatch(hexColorRegex);
    });
  });

  describe("Integration with Backend Logic", () => {
    test("should match main task page color specifications", () => {
      // These should match the main task page (TaskCard.jsx) color scheme
      expect(getTaskColor("High Priority", "In progress")).toBe("#EF4444"); // Red
      expect(getTaskColor("Medium Priority", "In progress")).toBe("#F59E0B"); // Amber (matches TaskCard)
      expect(getTaskColor("Low Priority", "In progress")).toBe("#10B981"); // Green (matches TaskCard)
      expect(getTaskColor(undefined, "In progress")).toBe("#6366F1"); // Blue (default)
      expect(getTaskColor("High Priority", "Completed")).toBe("#10B981"); // Green (status override)
      expect(getTaskColor("High Priority", "On-hold")).toBe("#F59E0B"); // Amber (status override)
    });
  });

  describe("Edge Cases", () => {
    test("should handle null and undefined values gracefully", () => {
      expect(() => getTaskColor(null, null)).not.toThrow();
      expect(() => getTaskColor(undefined, undefined)).not.toThrow();
      expect(() => getTaskColorClasses(null, null)).not.toThrow();
      expect(() => isTaskCompleted(null)).not.toThrow();
    });

    test("should handle empty strings", () => {
      expect(getTaskColor("", "")).toBe("#6366F1"); // Default blue
      expect(getTaskColorClasses("", "")).toBe(
        "bg-blue-50 border-blue-200 text-blue-800"
      );
      expect(isTaskCompleted("")).toBe(false);
    });

    test("should handle case variations in priority", () => {
      // Should be case sensitive to match backend
      expect(getTaskColor("high priority", "In progress")).toBe("#6366F1"); // Default
      expect(getTaskColor("HIGH PRIORITY", "In progress")).toBe("#6366F1"); // Default
      expect(getTaskColor("High Priority", "In progress")).toBe("#EF4444"); // Red
    });
  });
});
