import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Package, User, ClipboardList, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface OrderWithTasks {
  id: string;
  orderDate: string;
  deliveryDate?: string;
  status: string;
  totalAmount: number;
  notes?: string;
  customerName?: string;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  productNames: string[];
}

interface OrderTaskCardsProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrderTaskCards = ({ onSelectOrder }: OrderTaskCardsProps) => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders-with-tasks"],
    queryFn: async (): Promise<OrderWithTasks[]> => {
      // Get orders with pending/processing status
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          customers:customer_id (name)
        `)
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      if (!ordersData || ordersData.length === 0) return [];

      const result: OrderWithTasks[] = [];

      for (const order of ordersData) {
        // Get tasks for this order
        const { data: tasks } = await supabase
          .from("tasks")
          .select("status")
          .eq("order_id", order.id);

        // Get order items with product names
        const { data: items } = await supabase
          .from("order_items")
          .select("products:product_id (name)")
          .eq("order_id", order.id);

        const taskList = tasks || [];
        const stats = {
          total: taskList.length,
          todo: taskList.filter(t => t.status === "todo").length,
          inProgress: taskList.filter(t => t.status === "in-progress").length,
          completed: taskList.filter(t => t.status === "completed").length,
          cancelled: taskList.filter(t => t.status === "cancelled").length,
        };

        const productNames = (items || [])
          .map((i: any) => i.products?.name)
          .filter(Boolean);

        result.push({
          id: order.id,
          orderDate: order.order_date,
          deliveryDate: order.delivery_date,
          status: order.status,
          totalAmount: order.total_amount,
          notes: order.notes,
          customerName: (order.customers as any)?.name,
          taskStats: stats,
          productNames,
        });
      }

      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Tidak ada order aktif dengan tugas</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => {
        const progressPercent = order.taskStats.total > 0
          ? (order.taskStats.completed / order.taskStats.total) * 100
          : 0;

        return (
          <Card
            key={order.id}
            className="cursor-pointer group hover:shadow-lg hover:border-primary/50 transition-all duration-200"
            onClick={() => onSelectOrder(order.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  #{order.id.substring(0, 8).toUpperCase()}
                </CardTitle>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status === "pending" ? "Menunggu" : "Diproses"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Customer */}
              {order.customerName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}

              {/* Products */}
              {order.productNames.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {order.productNames.slice(0, 3).map((name, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                    {order.productNames.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{order.productNames.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery date */}
              {order.deliveryDate && (
                <div className="text-xs text-muted-foreground">
                  Pengiriman: {format(new Date(order.deliveryDate), "dd MMM yyyy")}
                </div>
              )}

              {/* Task Progress */}
              {order.taskStats.total > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress Tugas</span>
                    <span className="font-semibold">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      {order.taskStats.todo}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {order.taskStats.inProgress}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {order.taskStats.completed}
                    </span>
                  </div>
                </div>
              )}

              {order.taskStats.total === 0 && (
                <p className="text-xs text-muted-foreground italic">Belum ada tugas</p>
              )}

              {/* Arrow indicator */}
              <div className="flex justify-end pt-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
