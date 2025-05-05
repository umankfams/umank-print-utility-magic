
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTitle } from "@/hooks/useTitle";
import AppNavbar from "@/components/AppNavbar";
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
import { Loader2, Search } from "lucide-react";

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
    deleteTask
  } = useTasks("processing");
  
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
          (task.ingredientName?.toLowerCase() || '').includes(lowercaseQuery)
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
    <div className="min-h-screen bg-background">
      <AppNavbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            {orderId 
              ? "Manage tasks for this order" 
              : "Manage tasks from all processing orders"}
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
        
        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
