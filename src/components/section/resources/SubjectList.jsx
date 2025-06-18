import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, XCircle, Eye, User, Lock, Info } from "lucide-react";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { useState, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SubjectList = ({
  subjects,
  viewMode,
  setCurrentSubject,
  onDeleteSubject,
  canEditInCurrentContext = false,
  userRole,
  isPIO = false,
  assignedClassInfo,
  searchTerm = "",
}) => {
  const { hasPermission } = usePermission();
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  const canDeleteSubject = hasPermission(PERMISSIONS.DELETE_SUBJECT);

  // Determine if user can edit/delete subjects based on role and context
  const isStudent = userRole === ROLES.STUDENT;
  const isAdmin = userRole === ROLES.ADMIN;

  // Students cannot delete anything, PIO/Admin can delete based on context
  const showDeleteButton =
    !isStudent && canDeleteSubject && canEditInCurrentContext;

  // Debug: Log subjects data to see what we're receiving
  console.log("SubjectList: Received subjects data:", subjects);
  if (subjects && subjects.length > 0) {
    console.log("SubjectList: First subject sample:", subjects[0]);
    console.log(
      "SubjectList: First subject description:",
      subjects[0]?.description
    );
    console.log(
      "SubjectList: First subject instructor:",
      subjects[0]?.instructor
    );
  }

  const toggleDescription = (subjectId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Filter subjects based on search term
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return subjects;

    const searchLower = searchTerm.toLowerCase().trim();
    return subjects.filter((subject) => {
      const nameMatch = subject.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = subject.description
        ?.toLowerCase()
        .includes(searchLower);
      const instructorMatch = subject.instructor
        ?.toLowerCase()
        .includes(searchLower);

      return nameMatch || descriptionMatch || instructorMatch;
    });
  }, [subjects, searchTerm]);

  // Show no results message when search returns empty
  if (searchTerm.trim() && filteredSubjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No subjects found
        </h3>
        <p className="text-gray-500">
          No subjects match your search for "{searchTerm}". Try adjusting your
          search terms.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4"
            : "space-y-4 pt-4"
        }
      >
        {filteredSubjects.map((subject) => (
          <Card
            key={subject.id}
            className={`overflow-hidden hover:shadow-lg transition-shadow duration-150 ease-in-out rounded-xl border-l-4 ${
              canEditInCurrentContext
                ? "bg-white border-l-blue-500 hover:border-l-blue-600"
                : "bg-gray-50/50 border-l-gray-400 hover:border-l-gray-500"
            }`}
          >
            <CardHeader className="p-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-lg flex-shrink-0 ${
                        canEditInCurrentContext ? "bg-blue-50" : "bg-gray-100"
                      }`}
                    >
                      <Book
                        className={`w-5 h-5 ${
                          canEditInCurrentContext
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base font-semibold text-gray-800 leading-tight">
                          {subject.name}
                        </CardTitle>
                        {!canEditInCurrentContext && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                {isStudent
                                  ? "Students have read-only access"
                                  : isPIO
                                  ? "You can only edit subjects in your assigned class"
                                  : "Read-only access"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!canEditInCurrentContext && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {isStudent
                              ? "You can view and download resources but cannot edit"
                              : isPIO
                              ? `Edit access restricted to: ${assignedClassInfo?.course} - ${assignedClassInfo?.yearLevel}`
                              : "View-only access"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {showDeleteButton && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSubject(subject.id);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="sr-only">Delete Subject</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Subject Description */}
                {subject.description && (
                  <div className="pl-14">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {expandedDescriptions.has(subject.id)
                        ? subject.description
                        : truncateText(subject.description)}
                      {subject.description.length > 100 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(subject.id);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {expandedDescriptions.has(subject.id)
                            ? "Show less"
                            : "Read more"}
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {/* Instructor Information */}
                {subject.instructor && (
                  <div className="pl-14">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 font-medium">
                        {subject.instructor}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full text-sm py-2 ${
                      canEditInCurrentContext
                        ? "border-blue-200 hover:bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setCurrentSubject(subject);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {canEditInCurrentContext
                      ? "Manage Subject"
                      : "View Subject"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

SubjectList.propTypes = {
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      instructor: PropTypes.string,
    })
  ).isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]).isRequired,
  setCurrentSubject: PropTypes.func.isRequired,
  onDeleteSubject: PropTypes.func.isRequired,
  canEditInCurrentContext: PropTypes.bool,
  userRole: PropTypes.string,
  isPIO: PropTypes.bool,
  assignedClassInfo: PropTypes.object,
  searchTerm: PropTypes.string,
};

export default SubjectList;
