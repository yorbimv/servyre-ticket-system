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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function AllTickets() {
  const [, navigate] = useLocation();
  const { data: tickets, isLoading } = trpc.tickets.getAll.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filteredTickets =
    tickets?.filter(ticket => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || ticket.statusId.toString() === filterStatus;
      const matchesPriority =
        filterPriority === "all" ||
        ticket.priorityId.toString() === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];

  const getPriorityColor = (priorityId: number) => {
    const priorityMap: Record<number, string> = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-green-100 text-green-800",
    };
    return priorityMap[priorityId] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (statusId: number) => {
    const statusMap: Record<number, string> = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-purple-100 text-purple-800",
      3: "bg-green-100 text-green-800",
      4: "bg-red-100 text-red-800",
    };
    return statusMap[statusId] || "bg-gray-100 text-gray-800";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            Administra y resuelve todos los tickets del sistema
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título o número..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="1">Abierto</SelectItem>
                  <SelectItem value="2">En Progreso</SelectItem>
                  <SelectItem value="3">Resuelto</SelectItem>
                  <SelectItem value="4">Cerrado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="1">Crítica</SelectItem>
                  <SelectItem value="2">Alta</SelectItem>
                  <SelectItem value="3">Media</SelectItem>
                  <SelectItem value="4">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 text-center">
                No se encontraron tickets con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map(ticket => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {ticket.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {ticket.ticketNumber}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(ticket.statusId)}>
                          {ticket.statusId === 1
                            ? "Abierto"
                            : ticket.statusId === 2
                              ? "En Progreso"
                              : ticket.statusId === 3
                                ? "Resuelto"
                                : "Cerrado"}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priorityId)}>
                          {ticket.priorityId === 1
                            ? "Crítica"
                            : ticket.priorityId === 2
                              ? "Alta"
                              : ticket.priorityId === 3
                                ? "Media"
                                : "Baja"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 min-w-fit">
                      <p>
                        Creado:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
                      </p>
                      {ticket.assignedToUserId && (
                        <p className="text-blue-600">Asignado</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
