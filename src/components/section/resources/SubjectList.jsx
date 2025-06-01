import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Upload as UploadIcon, XCircle, Eye } from "lucide-react";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";

const SubjectList = ({ subjects, viewMode, setCurrentSubject, onDeleteSubject, setIsModalOpen }) => {
  const { hasPermission } = usePermission();
  
  const canDeleteSubject = hasPermission(PERMISSIONS.DELETE_SUBJECT);
  const canUploadLectures = hasPermission(PERMISSIONS.UPLOAD_LECTURES);

  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4" : "space-y-4 pt-4"}>
      {subjects.map((subject) => (
        <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-150 ease-in-out bg-white rounded-xl">
          <CardHeader className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-800 leading-tight">{subject.name}</CardTitle>
                </div>
                {canDeleteSubject && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
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
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm py-2"
                  onClick={() => {
                    setCurrentSubject(subject);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Subject
                </Button>
                {canUploadLectures && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-sm py-2"
                    onClick={() => {
                      setCurrentSubject(subject);
                      if (setIsModalOpen) setIsModalOpen(true);
                    }}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

SubjectList.propTypes = {
  subjects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  setCurrentSubject: PropTypes.func.isRequired,
  onDeleteSubject: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func,
}

export default SubjectList; 