import { useState, useCallback, useMemo, useEffect, useContext } from "react";
import { Loader2, Lock } from "lucide-react";
import { UploadModal } from "@/components/modal/UploadModal";
import { AddSubjectModal } from "@/components/modal/AddSubjectModal";
import { AddEditAnnouncementModal } from "@/components/modal/AddEditAnnouncementModal";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  getTopicsBySubject,
  createTopic,
  addActivity,
} from "@/services/topicService.js";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import BreadcrumbNavigation from "@/components/section/resources/BreadcrumbNavigation";
import CourseView from "@/components/section/resources/CourseView";
import SubjectList from "@/components/section/resources/SubjectList";
import ViewSubject from "@/components/section/resources/ViewSubject";
import FloatingUploadButton from "@/components/section/resources/FloatingUploadButton";

export default function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] =
    useState(false);
  const [selectedSubjectForAnnouncement, setSelectedSubjectForAnnouncement] =
    useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Subject deletion confirmation dialog state
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleteSubjectDialogOpen, setIsDeleteSubjectDialogOpen] =
    useState(false);

  const [currentProgramName, setCurrentProgramName] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  // Check user role and get assigned class info for PIO users
  const isPIO = user?.role === ROLES.PIO;
  const isAdmin = user?.role === ROLES.ADMIN;

  // Parse PIO assigned class information
  const assignedClassInfo = useMemo(() => {
    if (!isPIO || !user?.assignedClass) return null;

    const parts = user.assignedClass.split(" - ");
    if (parts.length !== 2) return null;

    const [course, yearLevel] = parts;

    // Map course names to programId
    const courseToProgram = {
      "Associate in Computer Technology": "act",
      "Bachelor of Science in Information Systems": "bsis",
    };

    // Map year level to numeric value
    const yearLevelToNumber = {
      "First Year": 1,
      "Second Year": 2,
      "Third Year": 3,
      "Fourth Year": 4,
    };

    return {
      course,
      yearLevel,
      programId: courseToProgram[course],
      yearLevelNumber: yearLevelToNumber[yearLevel],
    };
  }, [isPIO, user?.assignedClass]);

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

  // Check if user can edit content in the current context
  const canEditInCurrentContext = useMemo(() => {
    // Admin can edit everything
    if (isAdmin) return true;

    // Students cannot edit anything
    if (user?.role === ROLES.STUDENT) return false;

    // PIO users can only edit content in their assigned class
    if (isPIO && assignedClassInfo) {
      const currentProgramId = programsData?.find(
        (p) => p.name === currentProgramName
      )?.id;
      return (
        currentProgramId === assignedClassInfo.programId &&
        currentYear === assignedClassInfo.yearLevelNumber
      );
    }

    // Default to false for safety
    return false;
  }, [
    isAdmin,
    isPIO,
    assignedClassInfo,
    currentProgramName,
    currentYear,
    programsData,
    user?.role,
  ]);

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
    deleteResource,
    uploadFile,
    isCreating: isCreatingResource,
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

  // Topics query
  const {
    data: topicsData,
    isLoading: topicsLoading,
    isError: topicsIsError,
    error: topicsError,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ["topics", currentSubjectId],
    queryFn: () => {
      if (!currentSubjectId) return Promise.resolve([]);
      return getTopicsBySubject(currentSubjectId);
    },
    enabled: !!currentSubjectId,
    staleTime: 1000 * 60 * 5,
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      // Single refetch to avoid race conditions and duplicate cards
      refetchSubjects();

      // Add one delayed refetch to ensure data consistency
      setTimeout(() => {
        console.log("Final refetch after subject creation");
        refetchSubjects();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Subject",
        description:
          error.message || "An error occurred while adding the subject",
        variant: "destructive",
      });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: (data, variables) => {
      // Get the subject name from the context for the success message
      const deletedSubjectName = subjectToDelete?.name || "Subject";

      // Immediately refetch subjects
      refetchSubjects();

      // Add delayed refetches to ensure UI is updated
      setTimeout(() => {
        console.log("Delayed refetch after subject deletion (500ms)");
        refetchSubjects();
      }, 500);

      setTimeout(() => {
        console.log("Delayed refetch after subject deletion (1500ms)");
        refetchSubjects();
      }, 1500);

      // Show success toast with subject name
      toast({
        title: "Subject Deleted",
        description: `Subject "${deletedSubjectName}" has been deleted successfully!`,
        variant: "default",
      });

      // Clear the deletion state
      setSubjectToDelete(null);
      setIsDeleteSubjectDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to delete subject";
      toast({
        title: "Deletion Failed",
        description: `${errorMessage}. Please try again or contact support if the problem persists.`,
        variant: "destructive",
      });

      // Clear the deletion state on error as well
      setSubjectToDelete(null);
      setIsDeleteSubjectDialogOpen(false);
    },
  });

  // Announcement mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      refetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement created successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ announcementId, ...data }) =>
      updateAnnouncement({ announcementId, ...data }),
    onSuccess: () => {
      refetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement updated successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      refetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement deleted successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  // Topic mutations
  useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      refetchTopics();
      toast({
        title: "Success",
        description: "Topic created successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic",
        variant: "destructive",
      });
    },
  });

  useMutation({
    mutationFn: ({ topicId, ...data }) => addActivity(topicId, data),
    onSuccess: () => {
      refetchTopics();
      refetchAnnouncements();
      toast({
        title: "Success",
        description: "Activity added successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add activity",
        variant: "destructive",
      });
    },
  });

  // Add state for tracking the selected topic for upload
  const [selectedTopicForUpload, setSelectedTopicForUpload] = useState(null);

  useEffect(() => {
    console.log(
      "Resources.jsx: Initial selection useEffect - programsData:",
      JSON.stringify(programsData),
      "currentProgramName:",
      currentProgramName,
      "isPIO:",
      isPIO,
      "assignedClassInfo:",
      assignedClassInfo
    );

    if (programsData && programsData.length > 0 && !currentProgramName) {
      // All users get the first available program (no restrictions on navigation)
      const targetProgram = programsData[0];

      console.log(
        "Resources.jsx: Initial selection useEffect - Setting initial program:",
        JSON.stringify(targetProgram)
      );

      setCurrentProgramName(targetProgram.name);

      if (targetProgram.years && targetProgram.years.length > 0) {
        // All users get the first available year (no restrictions on navigation)
        const targetYear = targetProgram.years[0];
        setCurrentYear(targetYear.year);

        if (targetYear.semesters && targetYear.semesters.length > 0) {
          setCurrentSemester(targetYear.semesters[0]);
        }
      }
    } else {
      console.log(
        "Resources.jsx: Initial selection useEffect - Conditions NOT met or program already selected."
      );
    }
  }, [programsData, currentProgramName, isPIO, assignedClassInfo]);

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
      if (refetchTopics) refetchTopics();
      console.log("Refetching data for subject:", currentSubjectId);
    }
  }, [currentSubjectId, refetchResources, refetchAnnouncements, refetchTopics]);

  const handleUpload = useCallback(
    (
      file,
      subjectForUpload,
      topic = null,
      onSuccess = null,
      onError = null,
      onProgress = null
    ) => {
      if (!file || !subjectForUpload || !subjectForUpload.id) {
        toast({
          title: "Upload Error",
          description: "Cannot upload: File or Subject not specified.",
          variant: "destructive",
        });
        if (onError) onError();
        return;
      }

      const fileType =
        file.type ||
        (file.name.includes(".")
          ? file.name.split(".").pop()
          : "application/octet-stream");

      const topicId = topic ? topic.id || topic._id : null;

      console.log(
        "Uploading:",
        file.name,
        "for subject:",
        subjectForUpload.name,
        "subjectId:",
        subjectForUpload.id,
        topic ? `and topic: ${topic.name} (id: ${topicId})` : "",
        "Type:",
        fileType
      );

      uploadFile({
        file: file,
        resourceData: {
          subjectId: subjectForUpload.id,
          topicId: topicId,
          name: file.name,
          type: fileType,
          isPublic: true, // Ensure files are publicly accessible
        },
        onSuccess: () => {
          // Refetch resources and topics after successful upload
          console.log("Upload successful - refetching data...");

          // Always refetch resources
          refetchResources();

          // Always refetch topics after upload, as it may affect topic content
          if (refetchTopics) {
            console.log("Refetching topics after upload");
            refetchTopics();
          }

          // Add a single delayed refetch to ensure data is up-to-date
          setTimeout(() => {
            console.log("Final delayed refetch after upload...");
            refetchResources();
            if (refetchTopics) refetchTopics();

            // Force the component to re-render with updated data
            if (currentSubject) {
              console.log("Forcing ViewSubject to update with new data...");
              // This will cause the component to re-render with fresh data
              const updatedSubject = { ...currentSubject };
              setCurrentSubject(null);
              setTimeout(() => {
                setCurrentSubject(updatedSubject);
              }, 100);
            }

            toast({
              title: "Upload Success",
              description: `File "${file.name}" uploaded successfully!`,
              variant: "default",
            });
            if (onSuccess) onSuccess();
          }, 1500);
        },
        onError: (error) => {
          const errorMsg = `Error uploading file: ${
            error?.message || "Unknown error"
          }`;
          console.error(errorMsg);
          toast({
            title: "Upload Error",
            description: errorMsg,
            variant: "destructive",
          });
          if (onError) onError(error);
        },
        onProgress: onProgress, // Pass through the progress callback
      });
    },
    [uploadFile, refetchResources, refetchTopics]
  );

  const handleProgramChange = useCallback(
    (programName) => {
      // All users can navigate to any program (no restrictions)
      setCurrentProgramName(programName);
      const selectedProg = programsData?.find((p) => p.name === programName);
      if (selectedProg && selectedProg.years && selectedProg.years.length > 0) {
        // All users get the first available year (no restrictions)
        const targetYear = selectedProg.years[0];
        setCurrentYear(targetYear.year);
        if (targetYear.semesters && targetYear.semesters.length > 0) {
          setCurrentSemester(targetYear.semesters[0]);
        } else {
          setCurrentSemester(null);
        }
      } else {
        setCurrentYear(null);
        setCurrentSemester(null);
      }
      setCurrentSubject(null);
    },
    [
      programsData,
      setCurrentProgramName,
      setCurrentYear,
      setCurrentSemester,
      setCurrentSubject,
    ]
  );

  const handleAddSubject = (result) => {
    // This function is called when AddSubjectModal successfully creates a subject
    // We don't need to create another subject, just handle the success response

    if (result && result.name) {
      console.log(
        "Subject created successfully via AddSubjectModal:",
        result.name
      );

      // Show success toast
      toast({
        title: "Subject Added",
        description: `Subject "${result.name}" added successfully!`,
        variant: "default",
      });

      // Manually trigger refetch since we're not using createSubjectMutation
      refetchSubjects();

      // Add one delayed refetch to ensure data consistency
      setTimeout(() => {
        console.log("Final refetch after subject creation via AddSubjectModal");
        refetchSubjects();
      }, 1000);
    } else {
      console.error("Invalid result from AddSubjectModal:", result);
    }
  };

  const handleDeleteSubject = (subjectId) => {
    if (!selectedProgramId || !currentYear || !currentSemester) {
      toast({
        title: "Cannot Delete Subject",
        description: "Program, Year, or Semester context is missing.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a valid ID
    if (!subjectId) {
      toast({
        title: "Cannot Delete Subject",
        description: "Invalid subject ID",
        variant: "destructive",
      });
      return;
    }

    // Find the subject to get its name for the confirmation dialog
    const subject = subjectsData?.find((s) => s.id === subjectId);
    if (!subject) {
      toast({
        title: "Cannot Delete Subject",
        description: "Subject not found",
        variant: "destructive",
      });
      return;
    }

    // Set the subject to delete and show confirmation dialog
    setSubjectToDelete(subject);
    setIsDeleteSubjectDialogOpen(true);
  };

  // Handle the actual deletion after confirmation
  const handleConfirmDeleteSubject = () => {
    if (!subjectToDelete) return;

    console.log(
      `Deleting subject with ID: ${JSON.stringify(subjectToDelete.id)}`
    );

    deleteSubjectMutation.mutate({
      subjectId: subjectToDelete.id,
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
    // Validate announcement data before setting it for editing
    if (!announcement) {
      toast({
        title: "Cannot Edit Announcement",
        description: "No announcement data provided.",
        variant: "destructive",
      });
      console.error(
        "handleEditAnnouncementClick: announcement is null/undefined"
      );
      return;
    }

    const announcementId = announcement.id || announcement._id;
    if (!announcementId) {
      toast({
        title: "Cannot Edit Announcement",
        description: "Invalid announcement ID.",
        variant: "destructive",
      });
      console.error(
        "handleEditAnnouncementClick: Missing announcement ID:",
        announcement
      );
      return;
    }

    console.log(
      "handleEditAnnouncementClick: Setting announcement for editing:",
      {
        id: announcementId,
        title: announcement.title,
        content: announcement.content?.substring(0, 50) + "...",
      }
    );

    setEditingAnnouncement(announcement);
    setIsAddAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = (announcementId) => {
    if (!currentSubjectId) {
      toast({
        title: "Cannot Delete Announcement",
        description: "Subject context is missing.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced validation for announcement ID
    if (!announcementId) {
      toast({
        title: "Cannot Delete Announcement",
        description: "Invalid announcement ID",
        variant: "destructive",
      });
      return;
    }

    // Convert to string if it's an object ID
    const idToDelete =
      typeof announcementId === "object" && announcementId._id
        ? announcementId._id
        : announcementId;

    console.log(`Deleting announcement with ID: ${idToDelete}`);

    deleteAnnouncementMutation.mutate({
      announcementId: idToDelete,
      subjectId: currentSubjectId,
    });
  };

  const handleSaveAnnouncement = (values) => {
    const subjectId = currentSubjectId || selectedSubjectForAnnouncement?.id;

    if (!subjectId) {
      toast({
        title: "Cannot Save Announcement",
        description: "Subject context is missing.",
        variant: "destructive",
      });
      return;
    }

    if (editingAnnouncement) {
      // Validate that we have a valid announcement with an ID
      const announcementId = editingAnnouncement.id || editingAnnouncement._id;

      if (!announcementId) {
        toast({
          title: "Cannot Update Announcement",
          description: "Invalid announcement data.",
          variant: "destructive",
        });
        console.error("Missing announcement ID:", editingAnnouncement);
        return;
      }

      updateAnnouncementMutation.mutate(
        {
          announcementId: announcementId,
          content: values.content,
          title: values.title,
          priority: values.priority,
          type: values.type,
          dueDate: values.dueDate,
          subjectId: subjectId,
        },
        {
          onSuccess: () => {
            setIsAddAnnouncementModalOpen(false);
            setEditingAnnouncement(null);
            setSelectedSubjectForAnnouncement(null);
          },
        }
      );
    } else {
      // Prepare announcement data
      const announcementData = {
        content: values.content,
        title: values.title,
        priority: values.priority,
        type: values.type,
        dueDate: values.dueDate,
        subjectId: subjectId,
      };

      // Only include activityData if it's provided and is a valid object
      if (values.activityData && typeof values.activityData === "object") {
        announcementData.activityData = values.activityData;
      }

      createAnnouncementMutation.mutate(announcementData, {
        onSuccess: () => {
          setIsAddAnnouncementModalOpen(false);
          setSelectedSubjectForAnnouncement(null);
          // Refetch both announcements and topics since we might have created an activity
          refetchAnnouncements();
          refetchTopics();
        },
      });
    }
  };

  // Add topic handler
  const handleTopicAdded = () => {
    refetchTopics();
  };

  // Add activity handler
  const handleActivityAdded = () => {
    refetchTopics();
    refetchAnnouncements();
  };

  // Handle announcement button click from ViewSubject (enhanced modal)
  const handleAnnouncementClick = (subject) => {
    setSelectedSubjectForAnnouncement(subject);
    setEditingAnnouncement(null); // Ensure we're creating a new announcement
    setIsAddAnnouncementModalOpen(true); // Use the existing modal
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

        {currentSubject ? (
          <ViewSubject
            currentSubject={currentSubject}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            resources={resourcesData?.data || []}
            resourcesLoading={resourcesLoading}
            resourcesError={resourcesIsError ? resourcesError : null}
            handleDeleteResource={(resourceId) => deleteResource(resourceId)}
            announcements={
              Array.isArray(announcementsData) ? announcementsData : []
            }
            announcementsLoading={announcementsLoading}
            announcementsError={
              announcementsIsError ? announcementsError : null
            }
            onAddAnnouncement={handleAddAnnouncementClick}
            onEditAnnouncement={handleEditAnnouncementClick}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onAnnouncementClick={handleAnnouncementClick}
            userRole={user?.role}
            topics={topicsData?.data || []}
            topicsLoading={topicsLoading}
            topicsError={topicsIsError ? topicsError : null}
            onTopicAdded={handleTopicAdded}
            onActivityAdded={handleActivityAdded}
            setIsModalOpen={(topic) => {
              if (topic && typeof topic === "object" && topic.id) {
                setSelectedTopicForUpload(topic);
              } else {
                setSelectedTopicForUpload(null);
              }
              setIsModalOpen(true);
            }}
            refetchAll={() => {
              console.log("ViewSubject: Triggering refetchAll");
              refetchResources();
              refetchTopics();
              refetchAnnouncements();
            }}
            canEditInCurrentContext={canEditInCurrentContext}
            isPIO={isPIO}
            assignedClassInfo={assignedClassInfo}
            isStudent={user?.role === ROLES.STUDENT}
            isAdmin={isAdmin}
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
            canEditInCurrentContext={canEditInCurrentContext}
            isPIO={isPIO}
            assignedClassInfo={assignedClassInfo}
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
            setSelectedTopicForUpload(null);
          }}
          onUpload={(file, subject, topic, onSuccess, onError, onProgress) => {
            handleUpload(
              file,
              subject,
              topic,
              () => {
                console.log(
                  "Upload success callback triggered, refreshing resources..."
                );

                // Immediately refetch resources
                refetchResources();

                // Also refetch topics as they might contain resources
                if (refetchTopics) refetchTopics();

                // Add a single delayed refetch to ensure data is up-to-date
                setTimeout(() => {
                  console.log("Final delayed refetch after upload...");
                  refetchResources();
                  if (refetchTopics) refetchTopics();

                  // Force the component to re-render with updated data
                  if (currentSubject) {
                    console.log(
                      "Forcing ViewSubject to update with new data..."
                    );
                    // This will cause the component to re-render with fresh data
                    const updatedSubject = { ...currentSubject };
                    setCurrentSubject(null);
                    setTimeout(() => {
                      setCurrentSubject(updatedSubject);
                    }, 100);
                  }

                  if (onSuccess) onSuccess();
                }, 1500);
              },
              onError,
              onProgress
            );
          }}
          subject={currentSubject}
          isLoading={isCreatingResource}
          selectedTopic={selectedTopicForUpload}
        />

        {currentSubject && canEditInCurrentContext && (
          <FloatingUploadButton setIsModalOpen={setIsModalOpen} />
        )}

        <AddSubjectModal
          isOpen={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          onSuccess={handleAddSubject}
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
            setSelectedSubjectForAnnouncement(null);
          }}
          onSubmit={handleSaveAnnouncement}
          isLoading={
            createAnnouncementMutation.isPending ||
            updateAnnouncementMutation.isPending
          }
          announcement={editingAnnouncement}
          subjectName={
            currentSubject?.name || selectedSubjectForAnnouncement?.name
          }
          subjectId={currentSubjectId || selectedSubjectForAnnouncement?.id}
        />

        {/* Subject Deletion Confirmation Dialog */}
        <AlertDialog
          open={isDeleteSubjectDialogOpen}
          onOpenChange={setIsDeleteSubjectDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Subject Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the subject{" "}
                <strong>"{subjectToDelete?.name}"</strong>?
                <br />
                <br />
                This action will permanently remove the subject and all its
                associated resources, announcements, topics, and activities.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteSubjectMutation.isPending}
                onClick={() => {
                  setSubjectToDelete(null);
                  setIsDeleteSubjectDialogOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteSubject}
                disabled={deleteSubjectMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
              >
                {deleteSubjectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Subject"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
