
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  tasks: Record<TaskStatus, Task[]>;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTask: (task: Partial<Task> & { id: string }) => void;
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteTask: (id: string) => void;
  orderId?: string;
}

const columns: { id: TaskStatus; title: string; color: string; dot: string; bg: string; dropBg: string }[] = [
  { id: "todo", title: "To Do", color: "border-t-violet-500", dot: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", dropBg: "bg-violet-100/50 dark:bg-violet-900/20" },
  { id: "in-progress", title: "In Progress", color: "border-t-amber-500", dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", dropBg: "bg-amber-100/50 dark:bg-amber-900/20" },
  { id: "completed", title: "Completed", color: "border-t-emerald-500", dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", dropBg: "bg-emerald-100/50 dark:bg-emerald-900/20" },
  { id: "cancelled", title: "Cancelled", color: "border-t-rose-500", dot: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", dropBg: "bg-rose-100/50 dark:bg-rose-900/20" }
];

export const KanbanBoard = ({ 
  tasks, 
  onUpdateTaskStatus, 
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  orderId
}: KanbanBoardProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Update the task's status
    onUpdateTaskStatus(draggableId, destination.droppableId as TaskStatus);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    onCreateTask({
      ...taskData as Omit<Task, "id" | "createdAt" | "updatedAt">,
      orderId: orderId,
    });
  };
  
  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (editingTask && taskData) {
      onUpdateTask({
        ...taskData,
        id: editingTask.id
      });
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tasks Board</h2>
        <TaskDialog 
          onSave={handleCreateTask} 
          open={isAddingTask}
          onOpenChange={setIsAddingTask}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          }
        />
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <div className={`border-t-[3px] ${column.color} rounded-t-lg p-3 ${column.bg} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">{column.title}</h3>
                  </div>
                  <span className="text-xs font-medium bg-background/70 rounded-full px-2 py-0.5 text-muted-foreground">
                    {tasks[column.id].length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-b-lg p-2 flex-grow overflow-y-auto max-h-[600px] transition-colors border border-t-0 border-border/50 ${
                      snapshot.isDraggingOver ? column.dropBg : "bg-muted/20"
                    }`}
                  >
                    {tasks[column.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onDelete={onDeleteTask}
                              onEdit={handleEditTask}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {tasks[column.id].length === 0 && (
                      <div className="text-center p-4 text-sm text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Edit task dialog */}
      <TaskDialog
        task={editingTask || undefined}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={handleUpdateTask}
      />
    </div>
  );
};
