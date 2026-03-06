import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTitle } from "@/hooks/useTitle";
import { useTasks } from "@/hooks/useTasks";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { OrderTaskCards } from "@/components/tasks/OrderTaskCards";
import { Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, CheckCircle2, Clock, ListTodo, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Todo = () => {
  useTitle("Todo | Product Management");

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId") || undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | undefined>();

  const handleSelectOrder = (id: string) => {
    navigate(`/todo?orderId=${id}`);
  };

  const handleBack = () => {
    navigate("/todo");
  };

  // If no orderId, show the order cards view
  if (!orderId) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Manajemen Tugas</h1>
            <p className="text-muted-foreground">
              Pilih order untuk melihat dan mengelola tugas
            </p>
          </div>
          <OrderTaskCards onSelectOrder={handleSelectOrder} />
        </div>
      </div>
    );
  }

  // Show kanban board for selected order
  return <TodoBoard orderId={orderId} onBack={handleBack} />;
};

// Separate component for the kanban board view
const TodoBoard = ({ orderId, onBack }: { orderId: string; onBack: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | undefined>();

  const {
    tasks,
    groupedTasks,
    isLoading,
    updateTaskStatus,
    updateTask,
    createTask,
    deleteTask,
    error,
  } = useTasks(["pending", "processing"]);

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    updateTaskStatus({ id, status });
  };

  // Filter tasks for this specific order
  const getFilteredTasks = () => {
    if (!groupedTasks)
      return { todo: [], "in-progress": [], completed: [], cancelled: [] };

    const filtered = Object.entries(groupedTasks).reduce(
      (acc, [status, statusTasks]) => {
        let filteredTasks = statusTasks.filter((t) => t.orderId === orderId);

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filteredTasks = filteredTasks.filter(
            (task) =>
              task.title.toLowerCase().includes(q) ||
              (task.description?.toLowerCase() || "").includes(q) ||
              (task.productName?.toLowerCase() || "").includes(q) ||
              (task.customerName?.toLowerCase() || "").includes(q)
          );
        }

        if (filterPriority) {
          filteredTasks = filteredTasks.filter((t) => t.priority === filterPriority);
        }

        acc[status as TaskStatus] = filteredTasks;
        return acc;
      },
      {} as Record<TaskStatus, Task[]>
    );

    return filtered;
  };

  const orderTasks = tasks.filter((t) => t.orderId === orderId);
  const orderCompleted = groupedTasks?.completed?.filter((t) => t.orderId === orderId)?.length || 0;
  const orderInProgress = groupedTasks?.["in-progress"]?.filter((t) => t.orderId === orderId)?.length || 0;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Daftar Order
          </Button>
          <h1 className="text-2xl font-bold">Tugas Order</h1>
          <p className="text-muted-foreground font-mono text-sm">
            #{orderId.substring(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari tugas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="medium">Sedang</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilterPriority(undefined);
            }}
          >
            Reset
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
            <p className="font-medium">Error memuat tugas</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Progress Summary */}
        {!isLoading && orderTasks.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-semibold">
                {Math.round((orderCompleted / orderTasks.length) * 100)}%
              </span>
            </div>
            <Progress value={(orderCompleted / orderTasks.length) * 100} className="h-2 mb-3" />
            <div className="flex gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                <span>{orderTasks.length} Tugas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{orderCompleted} Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>{orderInProgress} Dikerjakan</span>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orderTasks.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2">Belum ada tugas untuk order ini</p>
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
