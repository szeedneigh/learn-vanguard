import React, { useState, useCallback, useMemo } from "react";
import { ChevronRight, Upload, Search, Book, List, Filter, Download } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadModal } from "@/components/UploadModal";
import AnalyticsDisplay from "@/components/AnalyticsDisplay";

const courses = {
  "Associate in Computer Technology": {
    duration: "2 years",
    description: "A 2-year program focused on essential IT skills, including hardware and software technologies.",
    years: [
      {
        name: "Year 1",
        subjects: [
          "Introduction to Computing",
          "Computer Programming 1",
          "Fundamentals of Information Systems",
          "Professional Skills in ICT",
          "Mathematics in Modern World",
          "Philippine Literature",
          "Understanding the Self",
          "Physical Education 1",
          "Christian Teaching 1"
        ],
      },
      {
        name: "Year 2",
        subjects: [
          "Web App Development 1",
          "Responsive Web Design",
          "Data Structures and Algorithm",
          "IS Infrastructure and Network Technologies",
          "Organization and Management",
          "Contemporary World",
          "Life and Works of Rizal",
          "Pagtuturo at Pagtataya",
          "Christian Teaching 3"
        ],
      },
    ],
  },
  "Bachelor of Science in Information Systems": {
    duration: "4 years",
    description:
      "A 4-year program designed to build a strong foundation in information technology, programming, and systems management.",
    years: [
      {
        name: "Year 1",
        subjects: [
          "Introduction to Computing",
          "Computer Programming 1",
          "Fundamentals of Information Systems",
          "Professional Skills in ICT",
          "Mathematics in Modern World",
          "Philippine Literature",
          "Understanding the Self",
          "Physical Education 1",
          "Cristian Teaching 1"
        ],
      },
      {
        name: "Year 2",
        subjects: [
          "Web App Development 1",
          "Responsive Web Design",
          "Data Structures and Algorithm",
          "IS Infrastructure and Network Technologies",
          "Organization and Management",
          "Contemporary World",
          "Business and Technical Writing",
          "Pagtuturo at Pagtataya",
          "Christian Teaching 3"
        ],
      },
      {
        name: "Year 3",
        subjects: [
          "Application Development and Emerging Technologies",
          "Information Systems Project Management 1",
          "Statistical Analysis in Information Systems",
          "Business Process Mangement",
          "Financial Management",
          "Life and Works of Rizal",
          "Gender and Society",
          "Christian Teaching 5"
        ],
      },
      {
        name: "Year 4",
        subjects: [
          "Entreprenuerial Mind",
          "Capstone Project 1",
          "Enterprise Architecture",
          "Customer Relationship Management",
          "Ethics",
          "IS Strategy Management and Acquisition",
          "Christian Teaching 7"
        ],
      },
    ],
  },
};

const staticFiles = [
  { name: "Course Syllabus.pdf", size: "2.5 MB", uploadDate: "2024-12-15", downloads: 145 },
  { name: "Assignment Guidelines.docx", size: "1.8 MB", uploadDate: "2024-12-20", downloads: 89 },
  { name: "Lecture Notes - Week 1.pptx", size: "5.2 MB", uploadDate: "2025-01-08", downloads: 234 },
  { name: "Project Requirements.pdf", size: "3.1 MB", uploadDate: "2025-01-12", downloads: 167 },
];

const BreadcrumbNavigation = ({
  showAnalytics,
  setShowAnalytics,
  currentCourse,
  currentYear,
  handleCourseChange,
}) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:bg-blue-50 font-medium">
                  Resources
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                <DropdownMenuItem onClick={() => setShowAnalytics(true)}>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Book className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-gray-500">View resource statistics</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {Object.keys(courses).map((course) => (
                  <DropdownMenuItem
                    key={course}
                    onClick={() => {
                      handleCourseChange(course);
                      setShowAnalytics(false);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Book className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{course}</p>
                        <p className="text-sm text-gray-500">{courses[course].duration}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          {!showAnalytics && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:bg-blue-50 font-medium">
                      {currentCourse}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.keys(courses).map((course) => (
                      <DropdownMenuItem
                        key={course}
                        onClick={() => handleCourseChange(course)}
                      >
                        {course}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{currentYear}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

const AnalyticsView = ({ staticFiles }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Analytics</CardTitle>
          <CardDescription>Overview of resource usage and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsDisplay />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Latest learning materials and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staticFiles.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Book className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{file.downloads} downloads</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CourseView = ({
  currentCourse,
  currentYear,
  setCurrentYear,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  filteredSubjects,
  setSelectedSubject,
  setIsModalOpen,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentCourse}</CardTitle>
              <CardDescription>{courses[currentCourse].description}</CardDescription>
              <Badge variant="secondary" className="mt-2">
                Duration: {courses[currentCourse].duration}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex space-x-2 pb-4">
              {courses[currentCourse].years.map((year) => (
                <Button
                  key={year.name}
                  variant={currentYear === year.name ? "default" : "outline"}
                  onClick={() => setCurrentYear(year.name)}
                  className="px-6"
                >
                  {year.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search subjects..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
          className="px-4"
        >
          {viewMode === "grid" ? <List className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        </Button>
      </div>

      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {filteredSubjects.map((subject, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className={viewMode === "grid" ? "" : "py-3"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{subject}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSubject(subject);
                    setIsModalOpen(true);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FloatingUploadButton = ({ setIsModalOpen }) => {
  return (
    <div className="fixed bottom-6 right-6">
      <Button
        onClick={() => setIsModalOpen(true)}
        className="shadow-lg"
        size="lg"
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload File
      </Button>
    </div>
  );
};

export default function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentCourse, setCurrentCourse] = useState("Associate in Computer Technology");
  const [currentYear, setCurrentYear] = useState("Year 1");
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleUpload = useCallback((file, subject) => {
    console.log("Uploading:", file.name, "for subject:", subject);
    // Implement actual file upload logic here
  }, []);

  const handleCourseChange = useCallback((course) => {
    setCurrentCourse(course);
    setCurrentYear(courses[course].years[0].name);
    setShowAnalytics(false);
  }, []);

  const filteredSubjects = useMemo(() => {
    const currentYearData = courses[currentCourse]?.years?.find(
      (year) => year.name === currentYear
    );
    return currentYearData
      ? currentYearData.subjects.filter((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  }, [currentCourse, currentYear, searchTerm]);

  React.useEffect(() => {
    setSearchTerm("");
  }, [currentCourse, currentYear]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <BreadcrumbNavigation
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
          currentCourse={currentCourse}
          currentYear={currentYear}
          handleCourseChange={handleCourseChange}
        />

        {showAnalytics ? (
          <AnalyticsView staticFiles={staticFiles} />
        ) : (
          <CourseView
            currentCourse={currentCourse}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredSubjects={filteredSubjects}
            setSelectedSubject={setSelectedSubject}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        <UploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSubject(null);
          }}
          onUpload={handleUpload}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
        />

        <FloatingUploadButton setIsModalOpen={setIsModalOpen} />
      </div>
    </div>
  );
}