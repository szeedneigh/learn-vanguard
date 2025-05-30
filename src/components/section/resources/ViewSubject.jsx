import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROLES } from "@/lib/constants";
import { Search, List, Filter, Loader2, Download, Trash2, MessageSquare, PlusCircle, Edit3, Book } from "lucide-react";
import * as AlertDialog from '@radix-ui/react-dialog';

const ViewSubject = ({ 
  currentSubject, 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode, 
  resources, 
  resourcesLoading, 
  resourcesError, 
  handleDeleteResource,
  announcements,
  announcementsLoading,
  announcementsError,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  userRole
}) => {
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredResources = useMemo(() => {
    if (!resources) return []
    return resources.filter(resource => 
      resource.name && resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [resources, searchTerm])

  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      handleDeleteResource(resourceToDelete.id);
      setResourceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50 w-[90vw] max-w-[400px]">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Confirm Deletion
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{resourceToDelete?.name}&rdquo;? This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end space-x-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Card>
        <CardHeader>
          <CardTitle>{currentSubject?.name || 'Subject Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
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
        </CardContent>
      </Card>

      {resourcesLoading && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading Resources...</p>
        </div>
      )}
      {resourcesError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error Loading Resources</AlertTitle>
          <AlertDescription>
            {resourcesError?.message || "An unexpected error occurred while fetching resources."}
          </AlertDescription>
        </Alert>
      )}
      {!resourcesLoading && !resourcesError && filteredResources && filteredResources.length > 0 && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Book className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" className="mr-1">
                      <Download className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    {handleDeleteResource && (userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setResourceToDelete(resource)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Type: {resource.type || 'File'}</p>
                <p className="text-sm text-gray-500">Size: {resource.size || 'N/A'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!resourcesLoading && !resourcesError && (!filteredResources || filteredResources.length === 0) && (
        <p className="mt-4 text-center text-muted-foreground">
          {searchTerm ? `No resources found matching "${searchTerm}".` : "No resources found for this subject."}
        </p>
      )}

      {/* Announcements Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-xl font-semibold">Announcements</CardTitle>
          </div>
          {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
            <Button variant="outline" size="sm" onClick={onAddAnnouncement} className="whitespace-nowrap">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {announcementsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <p className="ml-3 text-muted-foreground">Loading Announcements...</p>
            </div>
          )}
          {announcementsError && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error Loading Announcements</AlertTitle>
              <AlertDescription>
                {announcementsError?.message || "An unexpected error occurred while fetching announcements."}
              </AlertDescription>
            </Alert>
          )}
          {!announcementsLoading && !announcementsError && announcements && announcements.length > 0 && (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 bg-purple-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{announcement.content}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-purple-700">
                      Posted: {new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString()}
                    </p>
                    {(userRole === ROLES.ADMIN || userRole === ROLES.PIO) && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600 hover:bg-purple-100" onClick={() => onEditAnnouncement(announcement)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-100" onClick={() => onDeleteAnnouncement(announcement.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!announcementsLoading && !announcementsError && (!announcements || announcements.length === 0) && (
            <p className="text-center text-muted-foreground py-8">No announcements for this subject yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

ViewSubject.propTypes = {
  currentSubject: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  setViewMode: PropTypes.func.isRequired,
  resources: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    size: PropTypes.string,
  })),
  resourcesLoading: PropTypes.bool,
  resourcesError: PropTypes.object,
  handleDeleteResource: PropTypes.func,
  announcements: PropTypes.arrayOf(PropTypes.shape({ 
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired, 
  })),
  announcementsLoading: PropTypes.bool, 
  announcementsError: PropTypes.object, 
  onAddAnnouncement: PropTypes.func, 
  onEditAnnouncement: PropTypes.func, 
  onDeleteAnnouncement: PropTypes.func, 
  userRole: PropTypes.string,
}

export default ViewSubject; 