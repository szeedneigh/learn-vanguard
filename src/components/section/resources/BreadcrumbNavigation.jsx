import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

const BreadcrumbNavigation = ({
  currentProgram,
  currentYear,
  currentSemester,
  currentSubject,
  handleProgramChange,
  setCurrentYear,
  setCurrentSemester,
  setCurrentSubject,
  programsData,
  subjectsData,
}) => {
  const selectedProgramObject = programsData?.find(
    (p) => p.name === currentProgram
  );
  const programYears = selectedProgramObject?.years || [];
  const currentYearObject = programYears.find((y) => y.year === currentYear);
  const currentSemesterString = currentSemester;
  const subjectDisplayName = currentSubject?.name;

  if (!programsData || programsData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {currentProgram && (
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 font-medium"
                  >
                    {currentProgram}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {programsData?.map((program) => (
                    <DropdownMenuItem
                      key={program.id}
                      onClick={() => handleProgramChange(program.name)}
                    >
                      {program.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          )}
          {currentYear && selectedProgramObject && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hover:bg-blue-50 font-medium"
                    >
                      {currentYear}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {programYears.map((yearObj) => (
                      <DropdownMenuItem
                        key={yearObj.year}
                        onClick={() => {
                          setCurrentYear(yearObj.year);
                          if (
                            yearObj.semesters &&
                            yearObj.semesters.length > 0
                          ) {
                            setCurrentSemester(yearObj.semesters[0]);
                          }
                          setCurrentSubject(null);
                        }}
                      >
                        Year {yearObj.year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}
          {currentSemesterString &&
            currentYearObject &&
            currentYearObject.semesters && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hover:bg-blue-50 font-medium"
                      >
                        {currentSemesterString}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {currentYearObject.semesters.map((semesterStr) => (
                        <DropdownMenuItem
                          key={semesterStr}
                          onClick={() => {
                            setCurrentSemester(semesterStr);
                            setCurrentSubject(null);
                          }}
                        >
                          {semesterStr}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}
          {subjectDisplayName && currentSemesterString && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hover:bg-blue-50 font-medium"
                    >
                      {subjectDisplayName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {currentYearObject?.semesters?.find(
                      (s) => s === currentSemesterString
                    ) && currentSubject?.id ? (
                      subjectsData?.map((subject) => (
                        <DropdownMenuItem
                          key={subject.id}
                          onClick={() => setCurrentSubject(subject)}
                        >
                          {subject.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No subjects to list here directly
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

BreadcrumbNavigation.propTypes = {
  currentProgram: PropTypes.string,
  currentYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentSemester: PropTypes.string,
  currentSubject: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  handleProgramChange: PropTypes.func.isRequired,
  setCurrentYear: PropTypes.func.isRequired,
  setCurrentSemester: PropTypes.func.isRequired,
  setCurrentSubject: PropTypes.func.isRequired,
  programsData: PropTypes.array,
  subjectsData: PropTypes.array,
};

export default BreadcrumbNavigation;
