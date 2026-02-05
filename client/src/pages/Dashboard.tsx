import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Ticket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: allTickets } = trpc.tickets.getAll.useQuery();

  // Preparar datos para gráficos
  const ticketsByStatus = allTickets ? [
    { name: "Abiertos", value: allTickets.filter(t => t.statusId === 1).length },
    { name: "En Progreso", value: allTickets.filter(t => t.statusId === 2).length },
    { name: "Resueltos", value: allTickets.filter(t => t.statusId === 3).length },
    { name: "Cerrados", value: allTickets.filter(t => t.statusId === 4).length },
  ] : [];

  const ticketsByPriority = allTickets ? [
    { name: "Crítica", value: allTickets.filter(t => t.priorityId === 1).length },
    { name: "Alta", value: allTickets.filter(t => t.priorityId === 2).length },
    { name: "Media", value: allTickets.filter(t => t.priorityId === 3).length },
    { name: "Baja", value: allTickets.filter(t => t.priorityId === 4).length },
  ] : [];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Métricas y estadísticas del sistema de tickets</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTickets || 0}</div>
              <p className="text-xs text-gray-500">Todos los tickets creados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-gray-500">Pendientes de resolver</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolvedTickets || 0}</div>
              <p className="text-xs text-gray-500">Completados exitosamente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolutionRate}%</div>
              <p className="text-xs text-gray-500">Porcentaje resuelto</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets por Estado</CardTitle>
              <CardDescription>Distribución actual de tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tickets por Prioridad */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets por Prioridad</CardTitle>
              <CardDescription>Distribución por nivel de urgencia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets Recientes</CardTitle>
            <CardDescription>Últimos 5 tickets creados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allTickets && allTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ticket.title}</p>
                    <p className="text-xs text-gray-500">{ticket.ticketNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ticket.statusId === 1 ? "Abierto" : ticket.statusId === 2 ? "En Progreso" : ticket.statusId === 3 ? "Resuelto" : "Cerrado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
