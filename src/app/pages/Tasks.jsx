import {
  PlusCircle,
  Search,
  CheckCircle2,
  ArrowUpCircle,
  Clock,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TaskModal from "@/components/modal/AddTaskModal";
import { useTasks } from "@/hooks/useTasks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Tasks = () => {
  const { toast } = useToast();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    // priorityFilter, // Removed from top bar display based on new design
    // setPriorityFilter,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    handleTaskSubmit,
    handleDeleteTask,
    handleStatusChange, // This function in useTasks is key for drag and drop persistence
    filteredTasks,
    stats,
  } = useTasks(toast);

  const taskStatusColumns = ["Not Started", "In Progress", "On Hold"];

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same column and same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // If dropped in a different column (status change)
    if (source.droppableId !== destination.droppableId) {
      const taskId = draggableId; // draggableId is a string
      const newApiStatus = destination.droppableId; // This is the API status string (e.g., "not-started")
      
      // Call the function from useTasks to update the task's status.
      // This function MUST update the underlying tasks array immutably
      // for the change to persist visually.
      handleStatusChange(taskId, newApiStatus);
    } else {
      // Dropped in the same column but different position (reordering)
      // This requires specific logic in useTasks to reorder tasks within that status group.
      // For now, we are primarily focused on status change.
      // If reordering is needed, handleStatusChange or another function in useTasks
      // would need to handle this.
      console.log("Reordering within the same column. Ensure useTasks handles this if required.");
      // Example of how you might call it if you had a reorder function:
      // handleReorderTask(draggableId, source.droppableId, source.index, destination.index);
    }
  };

  const StatCard = ({ title, value, icon }) => {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-1 rounded-full">{icon}</div>
        </div>
      </div>
    );
  };

  const TaskCard = ({ task, onEdit, onDelete }) => {
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
    // task.status here is already the display status passed from the mapping
    const currentStatus = statusDisplayInfo[task.status] || { text: task.status, bg: "bg-gray-400", textColor: "text-white"};

    return (
      <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-800 text-md">{task.name}</h3>
            <div className="flex gap-2">
              <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit size={18} />
              </button>
              <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {task.priority && (
             <div className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
                {currentPriority.text}
            </div>
          )}
          
          <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
          
          <div className="flex items-center text-gray-500 text-xs mt-1">
            <CalendarIcon size={14} className="mr-1.5 text-gray-400" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
          </div>
        </div>
        <div className={`w-full py-2 text-center text-xs font-semibold ${currentStatus.bg} ${currentStatus.textColor}`}>
          {currentStatus.text}
        </div>
      </div>
    );
  };

  const mapStatusForDisplay = (apiStatus) => {
    if (!apiStatus) return "Unknown";
    const statusMap = {
      "not-started": "Not Started",
      "in-progress": "In Progress",
      "on-hold": "On Hold",
      "completed": "Completed" 
    };
    return statusMap[apiStatus.toLowerCase()] || apiStatus;
  };

  const mapStatusForAPI = (displayStatus) => {
    if (!displayStatus) return "unknown";
    const statusMap = {
      "Not Started": "not-started",
      "In Progress": "in-progress",
      "On Hold": "on-hold",
      "Completed": "completed"
    };
    return statusMap[displayStatus] || displayStatus;
  };

  const getTasksForColumn = (columnDisplayStatus) => {
    return filteredTasks.filter(task => 
      mapStatusForDisplay(task.status) === columnDisplayStatus
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-6 md:p-8 bg-gray-100">
        <div className="max-w-full mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon={<CheckCircle2 size={24} className="text-gray-400" />}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircle2 size={24} className="text-green-500" />}
            />
            <StatCard
              title="Overdue"
              value={stats.overdue}
              icon={<ArrowUpCircle size={24} className="text-red-500" />} 
            />
            <StatCard
              title="High Priority"
              value={stats.highPriority}
              icon={<Clock size={24} className="text-yellow-500" />}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-1 w-full md:w-auto md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white shadow-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto md:w-[180px] bg-white shadow-sm rounded-md border-gray-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {taskStatusColumns.map((statusColumnDisplay) => (
              <Droppable droppableId={mapStatusForAPI(statusColumnDisplay)} key={statusColumnDisplay}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`bg-gray-200/70 rounded-lg p-4 min-h-[300px] transition-colors duration-200 ease-in-out
                                ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
                  >
                    <div className="flex items-center mb-5">
                      <h2 className="text-base font-semibold text-gray-700">
                        {statusColumnDisplay}
                      </h2>
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        {getTasksForColumn(statusColumnDisplay).length}
                      </span>
                    </div>
                    
                    {getTasksForColumn(statusColumnDisplay).length === 0 && !snapshot.isDraggingOver && (
                         <div className="text-center text-sm text-gray-400 mt-10">
                            No tasks here.
                         </div>
                    )}

                    {getTasksForColumn(statusColumnDisplay).map((task, index) => (
                      <Draggable 
                        key={String(task.id)} // Ensure key is unique and string
                        draggableId={String(task.id)} // Ensure draggableId is a string
                        index={index}
                      >
                        {(providedDraggable, snapshotDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            style={{
                              ...providedDraggable.draggableProps.style,
                              boxShadow: snapshotDraggable.isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                            }}
                          >
                            <TaskCard
                              task={{...task, status: mapStatusForDisplay(task.status)}}
                              onEdit={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              onDelete={() => handleDeleteTask(task.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>

          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleTaskSubmit}
            editTask={editingTask}
            mapStatusForAPI={mapStatusForAPI} 
            mapStatusForDisplay={mapStatusForDisplay}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default Tasks;