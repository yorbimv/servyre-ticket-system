import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Ticket, BarChart3, FileText, Bell } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Servyre IT</h1>
            <p className="text-lg text-gray-600">
              Sistema de Gestión de Tickets
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle>Bienvenido</CardTitle>
              <CardDescription>
                Inicia sesión con tu cuenta @servyre.com para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full h-10 text-base"
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3 text-left">
            <h3 className="font-semibold text-gray-900">Características:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-600" />
                Crear y gestionar tickets de soporte
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Dashboard con métricas en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Reportes PDF mensuales
              </li>
              <li className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Notificaciones de actualizaciones
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado - redirigir según su rol
  if (user?.role === "admin" || user?.role === "technician") {
    navigate("/dashboard");
  } else {
    navigate("/my-tickets");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8" />
    </div>
  );
}
