import { useState, useCallback, useMemo, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
import { UploadModal } from "@/components/modal/UploadModal";
import { AddSubjectModal } from "@/components/modal/AddSubjectModal";
import { AddEditAnnouncementModal } from "@/components/modal/AddEditAnnouncementModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useResourcesPage } from "@/hooks/useResourcesQuery";
import { 
  getPrograms,
  getSubjects,
  createSubject,
  deleteSubject,
} from "@/services/programService.js";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/announcementService.js";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import toast from "react-hot-toast";
import BreadcrumbNavigation from "@/components/section/resources/BreadcrumbNavigation";
import AnalyticsView from "@/components/section/resources/AnalyticsView";
import CourseView from "@/components/section/resources/CourseView";
import SubjectList from "@/components/section/resources/SubjectList";
import ViewSubject from "@/components/section/resources/ViewSubject";
import FloatingUploadButton from "@/components/section/resources/FloatingUploadButton";

const staticFiles = [
  {
    name: "Course Syllabus.pdf",
    size: "2.5 MB",
    uploadDate: "2024-12-15",
    downloads: 145,
  },
  {
    name: "Assignment Guidelines.docx",
    size: "1.8 MB",
    uploadDate: "2024-12-20",
    downloads: 89,
  },
  {
    name: "Lecture Notes - Week 1.pptx",
    size: "5.2 MB",
    uploadDate: "2025-01-08",
    downloads: 234,
  },
  {
    name: "Project Requirements.pdf",
    size: "3.1 MB",
    uploadDate: "2025-01-12",
    downloads: 167,
  },
];

export default function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] =
    useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [currentProgramName, setCurrentProgramName] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  // Programs query
  const {
    data: programsData = [],
    isLoading: programsLoading,
    isError: programsIsError,
    error: programsError,
  } = useQuery({
    queryKey: ["programs"],
    queryFn: getPrograms,
  });

  const selectedProgramId = useMemo(() => {
    if (Array.isArray(programsData)) {
      return programsData.find((p) => p.name === currentProgramName)?.id;
    }
    return undefined;
  }, [programsData, currentProgramName]);

  // Subjects query  
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsIsError,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ["subjects", selectedProgramId, currentYear, currentSemester],
    queryFn: () => {
      if (!selectedProgramId || !currentYear || !currentSemester) {
        return Promise.resolve([]);
      }
      return getSubjects({
        programId: selectedProgramId,
        year: currentYear,
        semester: currentSemester,
      });
    },
    enabled: !!selectedProgramId && !!currentYear && !!currentSemester,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  const currentSubjectId = useMemo(() => {
    return currentSubject?.id;
  }, [currentSubject]);

  // Resources using React Query hooks
  const {
    resources: resourcesData,
    isLoading: resourcesLoading,
    isError: resourcesIsError,
    error: resourcesError,
    refetch: refetchResources,
    createResource,
    deleteResource,
    uploadFile,
    isCreating: isCreatingResource,
    isDeleting: isDeletingResource,
    isUploading,
  } = useResourcesPage(currentSubjectId);

  // Announcements query
  const {
    data: announcementsData,
    isLoading: announcementsLoading,
    isError: announcementsIsError,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useQuery({
    queryKey: ["announcements", currentSubjectId],
    queryFn: () => {
      if (!currentSubjectId) return Promise.resolve([]);
      return getAnnouncements({ subjectId: currentSubjectId });
    },
    enabled: !!currentSubjectId,
    staleTime: 1000 * 60 * 1,
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      refetchSubjects();
      toast.success("Subject added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add subject");
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      refetchSubjects();
      toast.success("Subject deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete subject");
    },
  });

  // Announcement mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      refetchAnnouncements();
      toast.success("Announcement created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create announcement");
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateAnnouncement(id, data),
    onSuccess: () => {
      refetchAnnouncements();
      toast.success("Announcement updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      refetchAnnouncements();
      toast.success("Announcement deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  useEffect(() => {
    console.log(
      "Resources.jsx: Initial selection useEffect - programsData:",
      JSON.stringify(programsData),
      "currentProgramName:",
      currentProgramName
    );
    if (programsData && programsData.length > 0 && !currentProgramName) {
      const firstProgram = programsData[0];
      console.log(
        "Resources.jsx: Initial selection useEffect - Setting initial program:",
        JSON.stringify(firstProgram)
      );
      setCurrentProgramName(firstProgram.name);
      if (firstProgram.years && firstProgram.years.length > 0) {
        const firstYear = firstProgram.years[0];
        setCurrentYear(firstYear.year);
        if (firstYear.semesters && firstYear.semesters.length > 0) {
          setCurrentSemester(firstYear.semesters[0]);
        }
      }
    } else {
      console.log(
        "Resources.jsx: Initial selection useEffect - Conditions NOT met or program already selected."
      );
    }
  }, [programsData, currentProgramName]);

  useEffect(() => {
    if (selectedProgramId && currentYear && currentSemester) {
      refetchSubjects();
    }
    if (!currentYear || !currentSemester) {
      setCurrentSubject(null);
    }
  }, [selectedProgramId, currentYear, currentSemester, refetchSubjects]);

  useEffect(() => {
    setSearchTerm("");
  }, [currentYear, currentSemester]);

  useEffect(() => {
    if (currentSubjectId) {
      refetchResources();
      if (refetchAnnouncements) refetchAnnouncements();
    }
  }, [currentSubjectId, refetchResources, refetchAnnouncements]);

  const handleUpload = useCallback(
    (file, subjectForUpload) => {
      if (!file || !subjectForUpload || !subjectForUpload.id) {
        toast.error("Cannot upload: File or Subject not specified.");
        return;
      }

      const fileType =
        file.type ||
        (file.name.includes(".")
          ? file.name.split(".").pop()
          : "application/octet-stream");

      console.log(
        "Uploading:",
        file.name,
        "for subject:",
        subjectForUpload.name,
        "Type:",
        fileType
      );
      
      uploadFile({
        file: file,
        resourceData: {
          subjectId: subjectForUpload.id,
          name: file.name,
          type: fileType,
        },
        onProgress: (percentCompleted) => {
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
    },
    [uploadFile]
  );

  const handleProgramChange = useCallback(
    (programName) => {
      setCurrentProgramName(programName);
      const selectedProg = programsData?.find((p) => p.name === programName);
      if (selectedProg && selectedProg.years && selectedProg.years.length > 0) {
        const firstYear = selectedProg.years[0];
        setCurrentYear(firstYear.year);
        if (firstYear.semesters && firstYear.semesters.length > 0) {
          setCurrentSemester(firstYear.semesters[0]);
        } else {
          setCurrentSemester(null);
        }
      } else {
        setCurrentYear(null);
        setCurrentSemester(null);
      }
      setCurrentSubject(null);
      setShowAnalytics(false);
    },
    [
      programsData,
      setCurrentProgramName,
      setCurrentYear,
      setCurrentSemester,
      setCurrentSubject,
      setShowAnalytics,
    ]
  );

  const handleAddSubject = (subjectName) => {
    if (!selectedProgramId || !currentYear || !currentSemester) {
      toast.error(
        "Cannot add subject: Program, Year, or Semester not selected."
      );
      return;
    }
    createSubjectMutation.mutate({
      name: subjectName,
      programId: selectedProgramId,
      yearName: currentYear,
      semesterName: currentSemester,
    });
  };

  const handleDeleteSubject = (subjectId) => {
    if (!selectedProgramId || !currentYear || !currentSemester) {
      toast.error(
        "Cannot delete subject: Program, Year, or Semester context is missing."
      );
      return;
    }
    deleteSubjectMutation.mutate({
      subjectId,
      programId: selectedProgramId,
      yearName: currentYear,
      semesterName: currentSemester,
    });
  };

  const handleAddAnnouncementClick = () => {
    setEditingAnnouncement(null);
    setIsAddAnnouncementModalOpen(true);
  };

  const handleEditAnnouncementClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsAddAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = (announcementId) => {
    if (!currentSubjectId) {
      toast.error("Cannot delete announcement: Subject context is missing.");
      return;
    }
    deleteAnnouncementMutation.mutate({
      announcementId,
      subjectId: currentSubjectId,
    });
  };

  const handleSaveAnnouncement = (values) => {
    if (!currentSubjectId) {
      toast.error("Cannot save announcement: Subject context is missing.");
      return;
    }
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({
        announcementId: editingAnnouncement.id,
        content: values.content,
        subjectId: currentSubjectId,
      });
    } else {
      createAnnouncementMutation.mutate({
        content: values.content,
        subjectId: currentSubjectId,
      });
    }
  };

  if (programsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg font-medium text-muted-foreground">
          Loading Programs...
        </p>
      </div>
    );
  }

  if (programsIsError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Programs</AlertTitle>
          <AlertDescription>
            {programsError?.message ||
              "An unexpected error occurred. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedProgramData = Array.isArray(programsData)
    ? programsData.find((p) => p.name === currentProgramName)
    : undefined;

  console.log(
    "Resources.jsx: currentProgramName:",
    currentProgramName,
    "selectedProgramData:",
    selectedProgramData
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {programsData && programsData.length > 0 && (
          <BreadcrumbNavigation
            setShowAnalytics={setShowAnalytics}
            currentProgram={currentProgramName}
            currentYear={currentYear}
            currentSemester={currentSemester}
            currentSubject={currentSubject}
            handleProgramChange={handleProgramChange}
            setCurrentYear={setCurrentYear}
            setCurrentSemester={setCurrentSemester}
            setCurrentSubject={setCurrentSubject}
            programsData={programsData}
            subjectsData={subjectsData}
          />
        )}

        {showAnalytics ? (
          <AnalyticsView staticFiles={staticFiles} />
        ) : currentSubject ? (
          <ViewSubject
            currentSubject={currentSubject}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            resources={resourcesData?.data || []}
            resourcesLoading={resourcesLoading}
            resourcesError={resourcesIsError ? resourcesError : null}
            handleDeleteResource={(resourceId) =>
              deleteResourceMutation.mutate(resourceId)
            }
            announcements={Array.isArray(announcementsData) ? announcementsData : []}
            announcementsLoading={announcementsLoading}
            announcementsError={
              announcementsIsError ? announcementsError : null
            }
            onAddAnnouncement={handleAddAnnouncementClick}
            onEditAnnouncement={handleEditAnnouncementClick}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            userRole={user?.role}
          />
        ) : selectedProgramData ? (
          <CourseView
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            currentSemester={currentSemester}
            setCurrentSemester={setCurrentSemester}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            setCurrentSubject={setCurrentSubject}
            programData={selectedProgramData}
            subjects={subjectsData}
            subjectsLoading={subjectsLoading}
            subjectsError={
              subjectsError || (subjectsIsError ? subjectsError : null)
            }
            onAddSubjectClick={() => setIsAddSubjectModalOpen(true)}
            userRole={user?.role}
            onDeleteSubject={handleDeleteSubject}
            SubjectListComponent={SubjectList}
            setIsModalOpen={setIsModalOpen}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-muted-foreground">
              Please select a program to view resources.
            </p>
          </div>
        )}

        <UploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onUpload={handleUpload}
          subject={currentSubject}
          isLoading={createResourceMutation.isPending}
        />

        {currentSubject &&
          (user?.role === ROLES.ADMIN || user?.role === ROLES.PIO) && (
            <FloatingUploadButton setIsModalOpen={setIsModalOpen} />
          )}

        <AddSubjectModal
          isOpen={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          onSubmit={handleAddSubject}
          isLoading={createSubjectMutation.isPending}
          programName={currentProgramName}
          yearName={currentYear}
          semesterName={currentSemester}
        />

        <AddEditAnnouncementModal
          isOpen={isAddAnnouncementModalOpen}
          onClose={() => {
            setIsAddAnnouncementModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleSaveAnnouncement}
          isLoading={
            createAnnouncementMutation.isPending ||
            updateAnnouncementMutation.isPending
          }
          announcement={editingAnnouncement}
          subjectName={currentSubject?.name}
        />
      </div>
    </div>
  );
}
