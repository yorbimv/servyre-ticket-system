import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, MessageSquare, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { EditTicketDialog } from "@/components/EditTicketDialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function AllTickets() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: tickets, isLoading } = trpc.tickets.getAll.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const deleteTicketAdmin = trpc.tickets.deleteTicketAdmin.useMutation();

  const handleDeleteTicket = async (e: React.MouseEvent, ticketId: number) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm("¿Estás seguro de eliminar este ticket y todo su historial?")) return;
    try {
      await deleteTicketAdmin.mutateAsync({ ticketId });
      toast.success("Ticket eliminado");
      utils.tickets.getAll.invalidate();
    } catch (e) { toast.error("Error al eliminar ticket"); }
  };

  const handleEditClick = (e: React.MouseEvent, ticket: any) => {
    e.stopPropagation(); // Prevent row click
    setEditingTicket(ticket);
    setIsEditing(true);
  };

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
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Folio</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead className="text-center">Comentarios</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                  {user?.role === 'admin' && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-mono font-medium text-blue-600">
                      {ticket.folio}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate font-medium">
                        {ticket.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {ticket.description.substring(0, 50)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.statusId)}>
                        {ticket.statusId === 1
                          ? "Abierto"
                          : ticket.statusId === 2
                            ? "En Progreso"
                            : ticket.statusId === 3
                              ? "Resuelto"
                              : "Cerrado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priorityId)}>
                        {ticket.priorityId === 1
                          ? "Crítica"
                          : ticket.priorityId === 2
                            ? "Alta"
                            : ticket.priorityId === 3
                              ? "Media"
                              : "Baja"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.userName || "Admin"}
                    </TableCell>
                    <TableCell className="text-center">
                      {ticket.commentCount > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">{ticket.commentCount}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleEditClick(e, ticket)}>
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600" onClick={(e) => handleDeleteTicket(e, ticket.id)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <EditTicketDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        ticket={editingTicket}
        onSuccess={() => utils.tickets.getAll.invalidate()}
      />
    </AppLayout>
  );
}
