import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, FileText } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

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
        // En una aplicación real, aquí descargarías el PDF desde el servidor
        toast.success(`Reporte generado: ${result.fileName}`);
      }
    } catch (error) {
      toast.error("Error al generar el reporte");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-600 mt-1">Gestión y reportería del sistema</p>
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
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
                    {months.map((month) => (
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
                    {years.map((year) => (
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
                  {generateReport.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Download className="w-4 h-4" />
                  Generar Reporte
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p>
                El reporte incluirá: total de tickets, tickets resueltos, distribución por prioridad,
                estado, tiempo promedio de resolución y más estadísticas relevantes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
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
                <label className="block text-sm font-medium mb-2">Nombre de la Aplicación</label>
                <input
                  type="text"
                  defaultValue="Servyre IT Ticket System"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Versión</label>
                <input
                  type="text"
                  defaultValue="1.0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                defaultValue="Sistema de gestión de tickets de soporte IT para Servyre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ayuda y Documentación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-sm">Creación de Tickets</h4>
              <p className="text-sm text-gray-600">
                Los usuarios finales pueden crear tickets desde la sección "Mis Tickets"
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-medium text-sm">Gestión de Tickets</h4>
              <p className="text-sm text-gray-600">
                Los técnicos pueden ver, asignar y actualizar todos los tickets desde "Todos los Tickets"
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-medium text-sm">Dashboard</h4>
              <p className="text-sm text-gray-600">
                Visualiza métricas y estadísticas en tiempo real en el Dashboard
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <h4 className="font-medium text-sm">Reportes</h4>
              <p className="text-sm text-gray-600">
                Genera reportes PDF mensuales con estadísticas completas del departamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
