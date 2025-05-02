
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppNavbar from "@/components/AppNavbar";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useIngredients } from "@/hooks/useIngredients";
import { ShoppingCartIcon, PackageIcon, WarehouseIcon, PlusIcon, ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();

  // Count stats
  const pendingOrders = orders?.filter(order => order.status === "pending").length || 0;
  const processingOrders = orders?.filter(order => order.status === "processing").length || 0;
  const lowStockIngredients = ingredients?.filter(ingredient => ingredient.stock < 10).length || 0;
  const lowStockProducts = products?.filter(product => product.stock < 5).length || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {productsLoading ? "..." : products.length}
                </div>
                <PackageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {ingredientsLoading ? "..." : ingredients.length}
                </div>
                <WarehouseIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {ordersLoading ? "..." : pendingOrders}
                </div>
                <ShoppingCartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Processing Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {ordersLoading ? "..." : processingOrders}
                </div>
                <ShoppingCartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders in your system</CardDescription>
                  </div>
                  <Link to="/orders">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      View All
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-1">No Orders Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't created any orders yet.
                    </p>
                    <Link to="/orders">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create First Order
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">${order.totalAmount.toFixed(2)}</p>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <Link to="/orders">
                            <Button variant="ghost" size="sm">
                              <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Alerts</CardTitle>
                    <CardDescription>Items that need attention</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ingredientsLoading || productsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading inventory...</p>
                ) : lowStockIngredients === 0 && lowStockProducts === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">All inventory levels are healthy.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lowStockIngredients > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-yellow-800">Low Stock Ingredients</p>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">
                            {lowStockIngredients}
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Some ingredients are running low on stock.
                        </p>
                        <Link to="/ingredients" className="mt-2 inline-block">
                          <Button variant="outline" size="sm" className="border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                            View Ingredients
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    {lowStockProducts > 0 && (
                      <div className="p-3 bg-red-50 rounded-md border border-red-200">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-red-800">Low Stock Products</p>
                          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">
                            {lowStockProducts}
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Some products need to be restocked soon.
                        </p>
                        <Link to="/products" className="mt-2 inline-block">
                          <Button variant="outline" size="sm" className="border-red-200 text-red-800 hover:bg-red-100">
                            View Products
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operations you might need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/ingredients">
                    <Button variant="outline" className="w-full justify-start">
                      <PackageIcon className="h-4 w-4 mr-2" />
                      Manage Ingredients
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button variant="outline" className="w-full justify-start">
                      <WarehouseIcon className="h-4 w-4 mr-2" />
                      Manage Products
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      View Orders
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button className="w-full justify-start">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ProductEase | All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default Index;
