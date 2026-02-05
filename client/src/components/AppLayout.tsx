import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Menu,
  X,
  LogOut,
  Bell,
  TicketIcon,
  BarChart3,
  Settings,
  Home,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();
  const { data: unreadNotifications } = trpc.notifications.getUnread.useQuery();

  const menuItems = [
    {
      label: "Inicio",
      icon: Home,
      href: "/",
      roles: ["user", "technician", "admin"],
    },
    {
      label: "Mis Tickets",
      icon: TicketIcon,
      href: "/my-tickets",
      roles: ["user", "technician", "admin"],
    },
    {
      label: "Todos los Tickets",
      icon: TicketIcon,
      href: "/all-tickets",
      roles: ["technician", "admin"],
    },
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      roles: ["admin", "technician"],
    },
    {
      label: "Administración",
      icon: Settings,
      href: "/admin",
      roles: ["admin"],
    },
  ];

  const visibleMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || "")
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div
            className={`flex items-center gap-2 ${!sidebarOpen && "justify-center w-full"}`}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              S
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Servyre</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleMenuItems.map(item => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                sidebarOpen ? "" : "justify-center"
              } hover:bg-slate-800 text-slate-300 hover:text-white`}
              title={!sidebarOpen ? item.label : ""}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <div
            className={`flex items-center gap-2 ${!sidebarOpen && "justify-center"}`}
          >
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications && unreadNotifications.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {unreadNotifications && unreadNotifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {unreadNotifications.map(notif => (
                      <DropdownMenuItem
                        key={notif.id}
                        className="flex flex-col items-start p-3 cursor-pointer"
                      >
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notif.message}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay notificaciones nuevas
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
