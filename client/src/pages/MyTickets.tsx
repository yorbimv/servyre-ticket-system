import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateTicketForm from "@/components/CreateTicketForm";

export default function MyTickets() {
  const [, navigate] = useLocation();
  const { data: tickets, isLoading } = trpc.tickets.getMyTickets.useQuery();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Tickets</h1>
            <p className="text-gray-600 mt-1">Visualiza y gestiona tus solicitudes de soporte</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                <DialogDescription>
                  Describe tu problema o solicitud de soporte
                </DialogDescription>
              </DialogHeader>
              <CreateTicketForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center">
                No tienes tickets aún. Crea uno para solicitar soporte.
              </p>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Primer Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                    <DialogDescription>
                      Describe tu problema o solicitud de soporte
                    </DialogDescription>
                  </DialogHeader>
                  <CreateTicketForm onSuccess={() => setShowCreateDialog(false)} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
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
                          Estado: {ticket.statusId === 1 ? "Abierto" : ticket.statusId === 2 ? "En Progreso" : ticket.statusId === 3 ? "Resuelto" : "Cerrado"}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priorityId)}>
                          Prioridad: {ticket.priorityId === 1 ? "Crítica" : ticket.priorityId === 2 ? "Alta" : ticket.priorityId === 3 ? "Media" : "Baja"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Creado: {new Date(ticket.createdAt).toLocaleDateString("es-ES")}</p>
                      {ticket.resolvedAt && (
                        <p className="text-green-600">
                          Resuelto: {new Date(ticket.resolvedAt).toLocaleDateString("es-ES")}
                        </p>
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
