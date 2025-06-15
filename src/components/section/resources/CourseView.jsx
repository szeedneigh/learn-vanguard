import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  List,
  Filter,
  Loader2,
  PlusCircle,
  Lock,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROLES } from "@/lib/constants";
// SubjectList will be imported from its own file after extraction
// For now, assume it will be: import SubjectList from './SubjectList';
// Or, if it's not defined yet, we might need to temporarily comment out its usage or define a placeholder.
// However, since SubjectList is part of the same refactoring batch, we'll add its import once created.

// Placeholder for SubjectList until it's created in its own file
// const SubjectList = () => <div>SubjectList Placeholder</div>;

const CourseView = ({
  currentYear,
  setCurrentYear,
  currentSemester,
  setCurrentSemester,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  setCurrentSubject,
  programData,
  subjects,
  subjectsLoading,
  subjectsError,
  onAddSubjectClick,
  userRole,
  onDeleteSubject,
  SubjectListComponent,
  canEditInCurrentContext,
  isPIO,
  assignedClassInfo,
}) => {
  const currentYearObject = programData?.years?.find(
    (y) => y.year === currentYear
  );

  if (!programData) return <p>Select a program to view details.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{programData.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex space-x-2 pb-4">
              {programData.years?.map((yearObj) => (
                <Button
                  key={yearObj.year}
                  variant={currentYear === yearObj.year ? "default" : "outline"}
                  onClick={() => {
                    setCurrentYear(yearObj.year);
                    if (yearObj.semesters && yearObj.semesters.length > 0) {
                      setCurrentSemester(yearObj.semesters[0]);
                    } else {
                      setCurrentSemester(null);
                    }
                    setCurrentSubject(null); // Reset subject when year changes
                  }}
                  className="px-6"
                >
                  Year {yearObj.year}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {currentYearObject && currentYearObject.semesters && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex space-x-2 pb-2">
                {currentYearObject.semesters.map((semesterString) => (
                  <Button
                    key={semesterString}
                    variant={
                      currentSemester === semesterString ? "default" : "outline"
                    }
                    onClick={() => {
                      setCurrentSemester(semesterString);
                      setCurrentSubject(null); // Reset subject when semester changes
                    }}
                    className="px-6"
                  >
                    {semesterString}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Search Bar, Add Subject, and View Toggle Section - MODIFIED LAYOUT */}
      {currentYear && currentSemester && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Input - Takes most space */}
          <div className="relative flex-grow w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subjects by name, description, or instructor..."
              className="w-full pl-10 pr-10 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* Action Buttons - Grouped to the right */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddSubjectClick}
                className={!canEditInCurrentContext ? "opacity-60" : ""}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Subject
                {!canEditInCurrentContext && isPIO && (
                  <Lock className="w-3 h-3 ml-1 text-gray-500" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
              }
              className="px-4"
            >
              {viewMode === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Filter className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Subject List Section */}
      {currentYearObject &&
        currentSemester &&
        (subjectsLoading ? (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading Subjects...</p>
          </div>
        ) : subjectsError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error Loading Subjects</AlertTitle>
            <AlertDescription>
              {subjectsError?.message ||
                "An unexpected error occurred while fetching subjects."}
            </AlertDescription>
          </Alert>
        ) : subjects && subjects.length > 0 && SubjectListComponent ? (
          <SubjectListComponent
            subjects={subjects}
            viewMode={viewMode}
            setCurrentSubject={setCurrentSubject}
            onDeleteSubject={onDeleteSubject}
            userRole={userRole}
            canEditInCurrentContext={canEditInCurrentContext}
            isPIO={isPIO}
            assignedClassInfo={assignedClassInfo}
            searchTerm={searchTerm}
          />
        ) : (
          <div className="text-center py-8">
            <p className="mt-4 text-muted-foreground">
              {searchTerm
                ? `No subjects found matching "${searchTerm}".`
                : "No subjects found for the selected criteria. Select a program, year, and semester, or try a different search."}
            </p>
          </div>
        ))}
    </div>
  );
};

CourseView.propTypes = {
  currentYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setCurrentYear: PropTypes.func.isRequired,
  currentSemester: PropTypes.string,
  setCurrentSemester: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]).isRequired,
  setViewMode: PropTypes.func.isRequired,
  setCurrentSubject: PropTypes.func.isRequired,
  programData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    duration: PropTypes.string,
    years: PropTypes.arrayOf(
      PropTypes.shape({
        year: PropTypes.number,
        semesters: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }),
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    })
  ),
  subjectsLoading: PropTypes.bool,
  subjectsError: PropTypes.object,
  onAddSubjectClick: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  onDeleteSubject: PropTypes.func.isRequired,
  SubjectListComponent: PropTypes.elementType.isRequired,
  canEditInCurrentContext: PropTypes.bool,
  isPIO: PropTypes.bool,
  assignedClassInfo: PropTypes.object,
};

export default CourseView;
