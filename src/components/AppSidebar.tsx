import {
  PackageIcon,
  ClipboardListIcon,
  ShoppingCartIcon,
  FileTextIcon,
  Package,
  ListTodo,
  Users,
  DollarSign,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { name: "Beranda", path: "/", icon: FileTextIcon },
  { name: "Bahan", path: "/ingredients", icon: PackageIcon },
  { name: "Produk", path: "/products", icon: Package },
  { name: "Pesanan", path: "/orders", icon: ShoppingCartIcon },
  { name: "Pelanggan", path: "/customers", icon: Users },
  { name: "Keuangan", path: "/finance", icon: DollarSign },
  { name: "Tugas", path: "/todo", icon: ListTodo },
  { name: "Kategori", path: "/categories", icon: ClipboardListIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-bold text-lg text-primary">ProductEase</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
