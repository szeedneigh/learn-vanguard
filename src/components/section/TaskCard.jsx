import { motion } from "framer-motion";
import { CheckCircle, CheckCircle2, Calendar, Edit, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/lib/constants";
import PropTypes from 'prop-types';

const TaskCard = ({ task, onEdit, onDelete, onArchive }) => {
  const { hasPermission } = usePermission();
  
  const priorityDisplay = {
    "High": { text: "High Priority", color: "text-red-600", bg: "bg-red-100" },
    "Medium": { text: "Medium Priority", color: "text-blue-600", bg: "bg-blue-100" },
    "Low": { text: "Low Priority", color: "text-green-600", bg: "bg-green-100" },
  };

  const statusDisplayInfo = {
    "Not Started": { text: "Not Started", bg: "bg-gray-500", textColor: "text-white" },
    "In Progress": { text: "In Progress", bg: "bg-blue-500", textColor: "text-white" },
    "On Hold": { text: "On Hold", bg: "bg-amber-500", textColor: "text-white" },
    "Completed": { text: "Completed", bg: "bg-green-500", textColor: "text-white" },
  };
  
  const currentPriority = priorityDisplay[task.priority] || { text: task.priority, color: "text-gray-700", bg: "bg-gray-100" };
  const currentStatus = statusDisplayInfo[task.status] || { text: task.status, bg: "bg-gray-400", textColor: "text-white"};
  const isCompleted = task.status === "Completed";

  // Permission checks
  const canEditTask = hasPermission(PERMISSIONS.EDIT_TASK);
  const canDeleteTask = hasPermission(PERMISSIONS.DELETE_TASK);
  const canManageArchive = hasPermission(PERMISSIONS.MANAGE_ARCHIVE);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg shadow mb-4 overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <h3 className={`font-semibold text-gray-800 text-md ${isCompleted ? 'line-through' : ''}`}>
              {task.name}
            </h3>
          </div>
        </div>

        {task.priority && (
          <div className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
            {currentPriority.text}
          </div>
        )}
        
        <p className={`text-sm text-gray-600 line-clamp-3 ${isCompleted ? 'line-through' : ''}`}>
          {task.description}
        </p>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar size={14} className="mr-1.5 text-gray-400" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
          </div>
          {isCompleted && task.completedAt && (
            <div className="flex items-center text-green-600 text-xs">
              <CheckCircle2 size={14} className="mr-1.5" />
              <span>Completed: {new Date(task.completedAt).toLocaleDateString("en-US", { 
                month: "short", 
                day: "2-digit", 
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</span>
            </div>
          )}
        </div>

        {(canEditTask || canDeleteTask || canManageArchive) && (
          <div className="flex justify-end pt-2 border-t mt-3">
            {isCompleted && canManageArchive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onArchive}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-full justify-center"
              >
                <Archive className="w-4 h-4 mr-2" />
                Move to Archive
              </Button>
            ) : (
              <div className="flex gap-2">
                {canEditTask && (
                  <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit size={18} />
                  </button>
                )}
                {canDeleteTask && (
                  <button 
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`w-full py-2 text-center text-xs font-semibold ${currentStatus.bg} ${currentStatus.textColor} ${isCompleted ? 'bg-opacity-75' : ''}`}>
        {currentStatus.text}
      </div>
    </motion.div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
    completedAt: PropTypes.string,
    isArchived: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
};

export default TaskCard;