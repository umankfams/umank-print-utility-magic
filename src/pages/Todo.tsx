
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTitle } from "@/hooks/useTitle";

import { useTasks } from "@/hooks/useTasks";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Todo = () => {
  useTitle("Todo | Product Management");
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId') || undefined;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | undefined>();
  
  // Get tasks from processing orders
  const { 
    tasks, 
    groupedTasks, 
    isLoading, 
    updateTaskStatus, 
    updateTask,
    createTask,
    deleteTask,
    error
  } = useTasks(["pending", "processing"]);
  
  // Log information for debugging
  console.log("Tasks:", tasks);
  console.log("Grouped Tasks:", groupedTasks);
  console.log("Loading:", isLoading);
  console.log("Error:", error);
  
  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    updateTaskStatus({ id, status });
  };
  
  // Filter tasks based on search query and priority
  const getFilteredTasks = () => {
    if (!groupedTasks) return {
      'todo': [], 
      'in-progress': [], 
      'completed': [], 
      'cancelled': []
    };
    
    const filtered = Object.entries(groupedTasks).reduce((acc, [status, statusTasks]) => {
      let filteredTasks = [...statusTasks];
      
      // Filter by search query
      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(lowercaseQuery) ||
          (task.description?.toLowerCase() || '').includes(lowercaseQuery) ||
          (task.productName?.toLowerCase() || '').includes(lowercaseQuery) ||
          (task.customerName?.toLowerCase() || '').includes(lowercaseQuery)
        );
      }
      
      // Filter by priority
      if (filterPriority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
      }
      
      // Filter by orderId if provided in URL
      if (orderId) {
        filteredTasks = filteredTasks.filter(task => task.orderId === orderId);
      }
      
      acc[status as TaskStatus] = filteredTasks;
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
    
    return filtered;
  };
  
  return (
    <div className="bg-background">

      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            {orderId 
              ? "Manage tasks for this order" 
              : "Manage tasks from all active orders"}
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={filterPriority} 
            onValueChange={setFilterPriority}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilterPriority(undefined);
            }}
          >
            Clear Filters
          </Button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
            <p className="font-medium">Error loading tasks</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
        
        {/* Progress Summary */}
        {!isLoading && tasks.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-semibold">
                {Math.round((groupedTasks?.completed?.length || 0) / tasks.length * 100)}%
              </span>
            </div>
            <Progress value={(groupedTasks?.completed?.length || 0) / tasks.length * 100} className="h-2 mb-3" />
            <div className="flex gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                <span>{tasks.length} Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{groupedTasks?.completed?.length || 0} Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>{(groupedTasks?.['in-progress']?.length || 0)} In Progress</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2">No tasks found for active orders</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        ) : (
          <KanbanBoard
            tasks={getFilteredTasks()}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTask={updateTask}
            onCreateTask={createTask}
            onDeleteTask={deleteTask}
            orderId={orderId}
          />
        )}
      </div>
    </div>
  );
};

export default Todo;
