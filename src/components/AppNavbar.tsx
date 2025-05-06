
import { Link } from "react-router-dom";
import { 
  PackageIcon, 
  ClipboardListIcon, 
  ShoppingCartIcon, 
  CalendarIcon, 
  FileTextIcon,
  Package,
  ListTodo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <FileTextIcon className="h-5 w-5" />
  },
  {
    name: "Ingredients",
    path: "/ingredients",
    icon: <PackageIcon className="h-5 w-5" />
  },
  {
    name: "Products",
    path: "/products",
    icon: <Package className="h-5 w-5" />
  },
  {
    name: "Orders",
    path: "/orders",
    icon: <ShoppingCartIcon className="h-5 w-5" />
  },
  {
    name: "Todo",
    path: "/todo",
    icon: <ListTodo className="h-5 w-5" />
  }
];

const AppNavbar = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">ProductEase</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <div className="container mx-auto px-4">
          <div className="flex justify-between py-3 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-w-[4rem]",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
