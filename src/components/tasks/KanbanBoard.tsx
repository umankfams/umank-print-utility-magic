
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

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
  { id: "cancelled", title: "Cancelled" }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="bg-muted p-3 rounded-t-md mb-2">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <div className="text-xs text-muted-foreground mt-1">
                  {tasks[column.id].length} {tasks[column.id].length === 1 ? "task" : "tasks"}
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`bg-muted/30 p-2 rounded-b-md flex-grow overflow-y-auto max-h-[600px] ${
                      snapshot.isDraggingOver ? "bg-muted/50" : ""
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
