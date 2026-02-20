import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Download,
  FileText,
  Settings,
  UserCog,
  Tags,
  HelpCircle,
  ShieldAlert,
  Building2
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { UserManagement } from "@/components/admin/UserManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { PriorityManagement } from "@/components/admin/PriorityManagement";
import DepartmentManagement from "@/components/admin/DepartmentManagement";
import UserTicketList from "@/components/admin/UserTicketList";

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function Admin() {
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const generateReport = trpc.admin.generateReport.useMutation();

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport.mutateAsync({
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
      });

      if (result.success) {
        toast.success(`Reporte generado: ${result.fileName}`);
      }
    } catch (error) {
      toast.error("Error al generar el reporte");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión avanzada del sistema y analítica</p>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-gray-100/80 dark:bg-slate-900 p-1 border dark:border-slate-800">
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <FileText className="w-4 h-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <UserCog className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <Tags className="w-4 h-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="priorities" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <ShieldAlert className="w-4 h-4" />
              Prioridades
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <Building2 className="w-4 h-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="ticket-users" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <UserCog className="w-4 h-4" />
              Usuarios de Tickets
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all">
              <Settings className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5text-blue-500" />
                  Generar Reportes Mensuales
                </CardTitle>
                <CardDescription>
                  Descarga reportes PDF con estadísticas y métricas de tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mes</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Año</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleGenerateReport}
                      disabled={generateReport.isPending}
                      className="w-full gap-2"
                    >
                      {generateReport.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <Download className="w-4 h-4" />
                      Generar Reporte
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p>
                    El reporte incluirá: total de tickets, tickets resueltos,
                    distribución por prioridad, estado, tiempo promedio de
                    resolución y más estadísticas relevantes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                  Ayuda y Documentación
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 dark:border-slate-800 rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <h4 className="font-semibold text-sm mb-1">Roles de Usuario</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cambia entre Usuario (crear tickets), Soporte Técnico (gestionar tickets) o Admin.
                  </p>
                </div>
                <div className="border border-gray-100 dark:border-slate-800 rounded-lg p-4 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                  <h4 className="font-semibold text-sm mb-1">Categorías</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Define las áreas problemáticas para que los usuarios clasifiquen sus peticiones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="priorities">
            <PriorityManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="ticket-users" className="space-y-6">
            <UserTicketList />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Ajustes generales de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre de la Aplicación
                    </label>
                    <input
                      type="text"
                      defaultValue="Servyre IT Ticket System"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Versión
                    </label>
                    <input
                      type="text"
                      defaultValue="1.0.0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    defaultValue="Sistema de gestión de tickets de soporte IT para Servyre"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg"
                    rows={3}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
