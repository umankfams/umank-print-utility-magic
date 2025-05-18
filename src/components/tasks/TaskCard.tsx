
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, TaskPriority } from "@/types";
import { CalendarIcon, Edit as EditIcon, Trash as TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isDragging?: boolean;
}

export const TaskCard = ({ task, onDelete, onEdit, isDragging = false }: TaskCardProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const getPriorityColor = (priority?: TaskPriority): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      className={cn(
        "mb-3 cursor-grab transition-all", 
        isDragging && "shadow-lg scale-105", 
        isHovering && "border-primary"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
        <CardTitle className="text-sm font-medium line-clamp-1">{task.title}</CardTitle>
        {isHovering && (
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                    <EditIcon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1">
          {task.priority && (
            <Badge variant={getPriorityColor(task.priority as TaskPriority)}>
              {task.priority}
            </Badge>
          )}
          
          {task.productName && (
            <Badge variant="outline" className="text-xs">
              {task.productName}
            </Badge>
          )}
          
          {task.ingredientName && (
            <Badge variant="outline" className="text-xs bg-background/50">
              {task.ingredientName}
            </Badge>
          )}
        </div>
        
        {task.deadline && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{format(task.deadline, 'MMM d, yyyy')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
