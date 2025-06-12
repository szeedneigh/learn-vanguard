import { useState, useCallback, useMemo, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
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
import toast from "react-hot-toast";
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
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [currentProgramName, setCurrentProgramName] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

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
      // Immediately refetch subjects to show the new subject
      refetchSubjects();

      // Add multiple delayed refetches to ensure data is up-to-date
      const refetchDelays = [500, 1500, 3000];

      refetchDelays.forEach((delay) => {
        setTimeout(() => {
          console.log(`Delayed refetch after subject creation (${delay}ms)`);
          refetchSubjects();
        }, delay);
      });

      // Remove toast notification from here as it's already shown in handleAddSubject
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add subject");
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
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

  // Topic mutations
  useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      refetchTopics();
      toast.success("Topic created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create topic");
    },
  });

  useMutation({
    mutationFn: ({ topicId, ...data }) => addActivity(topicId, data),
    onSuccess: () => {
      refetchTopics();
      refetchAnnouncements();
      toast.success("Activity added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add activity");
    },
  });

  // Add state for tracking the selected topic for upload
  const [selectedTopicForUpload, setSelectedTopicForUpload] = useState(null);

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
      onError = null
    ) => {
      if (!file || !subjectForUpload || !subjectForUpload.id) {
        toast.error("Cannot upload: File or Subject not specified.");
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

            toast.success(`File "${file.name}" uploaded successfully!`);
            if (onSuccess) onSuccess();
          }, 1500);
        },
        onError: (error) => {
          const errorMsg = `Error uploading file: ${
            error?.message || "Unknown error"
          }`;
          console.error(errorMsg);
          toast.error(errorMsg);
          if (onError) onError();
        },
      });
    },
    [uploadFile, refetchResources, refetchTopics]
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
    },
    [
      programsData,
      setCurrentProgramName,
      setCurrentYear,
      setCurrentSemester,
      setCurrentSubject,
    ]
  );

  const handleAddSubject = (subjectName) => {
    if (!selectedProgramId || !currentYear || !currentSemester) {
      toast.error(
        "Cannot add subject: Program, Year, or Semester not selected."
      );
      return;
    }

    // If subjectName is an object (from the modal's onSuccess), extract the name
    const name =
      typeof subjectName === "object" ? subjectName.name : subjectName;

    console.log(
      `Creating subject "${name}" for program ${selectedProgramId}, year ${currentYear}, semester ${currentSemester}`
    );

    // Ensure yearName is passed as a string to match the backend's expected format
    const yearLevelString = String(currentYear);

    createSubjectMutation.mutate(
      {
        name: name,
        programId: selectedProgramId,
        yearLevel: yearLevelString, // Use yearLevel instead of yearName to match backend
        semester: currentSemester, // Use semester instead of semesterName to match backend
      },
      {
        onSuccess: () => {
          console.log("Subject created successfully, triggering refetch");

          // Immediately refetch subjects to show the new subject
          refetchSubjects();

          // Add multiple delayed refetches to ensure data is up-to-date
          const refetchDelays = [500, 1500, 3000];

          refetchDelays.forEach((delay) => {
            setTimeout(() => {
              console.log(
                `Delayed refetch after subject creation (${delay}ms)`
              );
              refetchSubjects();
            }, delay);
          });

          toast.success(`Subject "${name}" added successfully!`);
        },
        onError: (error) => {
          console.error("Error creating subject:", error);
          toast.error(
            `Failed to add subject: ${error.message || "Unknown error"}`
          );
        },
      }
    );
  };

  const handleDeleteSubject = (subjectId) => {
    if (!selectedProgramId || !currentYear || !currentSemester) {
      toast.error(
        "Cannot delete subject: Program, Year, or Semester context is missing."
      );
      return;
    }

    // Ensure we have a valid ID
    if (!subjectId) {
      toast.error("Cannot delete subject: Invalid subject ID");
      return;
    }

    console.log(`Deleting subject with ID: ${JSON.stringify(subjectId)}`);

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

    // Enhanced validation for announcement ID
    if (!announcementId) {
      toast.error("Cannot delete announcement: Invalid announcement ID");
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
    if (!currentSubjectId) {
      toast.error("Cannot save announcement: Subject context is missing.");
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate(
        {
          announcementId: editingAnnouncement.id,
          content: values.content,
          title: values.title,
          priority: values.priority,
          type: values.type,
          subjectId: currentSubjectId,
        },
        {
          onSuccess: () => {
            setIsAddAnnouncementModalOpen(false);
            setEditingAnnouncement(null);
          },
        }
      );
    } else {
      createAnnouncementMutation.mutate(
        {
          content: values.content,
          title: values.title,
          priority: values.priority,
          type: values.type,
          subjectId: currentSubjectId,
        },
        {
          onSuccess: () => {
            setIsAddAnnouncementModalOpen(false);
          },
        }
      );
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
          onUpload={(file, subject, topic, onSuccess) => {
            handleUpload(file, subject, topic, () => {
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
                  console.log("Forcing ViewSubject to update with new data...");
                  // This will cause the component to re-render with fresh data
                  const updatedSubject = { ...currentSubject };
                  setCurrentSubject(null);
                  setTimeout(() => {
                    setCurrentSubject(updatedSubject);
                  }, 100);
                }

                if (onSuccess) onSuccess();
              }, 1500);
            });
          }}
          subject={currentSubject}
          isLoading={isCreatingResource}
          selectedTopic={selectedTopicForUpload}
        />

        {currentSubject &&
          (user?.role === ROLES.ADMIN || user?.role === ROLES.PIO) && (
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
          }}
          onSubmit={handleSaveAnnouncement}
          isLoading={
            createAnnouncementMutation.isPending ||
            updateAnnouncementMutation.isPending
          }
          announcement={editingAnnouncement}
          subjectName={currentSubject?.name}
          subjectId={currentSubjectId}
        />
      </div>
    </div>
  );
}
