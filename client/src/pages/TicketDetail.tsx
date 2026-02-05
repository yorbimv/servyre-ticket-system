import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TicketDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/tickets/:id");
  const ticketId = params?.id ? parseInt(params.id) : 0;

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery({ ticketId });
  const { data: comments } = trpc.tickets.getComments.useQuery({ ticketId });
  const { data: history } = trpc.tickets.getHistory.useQuery({ ticketId });
  const [commentText, setCommentText] = useState("");
  const addComment = trpc.tickets.addComment.useMutation();

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    try {
      await addComment.mutateAsync({
        ticketId,
        content: commentText,
        isInternal: false,
      });
      setCommentText("");
      toast.success("Comentario agregado");
    } catch (error) {
      toast.error("Error al agregar comentario");
    }
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

  const getPriorityColor = (priorityId: number) => {
    const priorityMap: Record<number, string> = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-green-100 text-green-800",
    };
    return priorityMap[priorityId] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate("/my-tickets")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <p className="mt-4 text-gray-600">Ticket no encontrado</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate("/my-tickets")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
              <p className="text-gray-600 mt-1">Ticket: {ticket.ticketNumber}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(ticket.statusId)}>
                    {ticket.statusId === 1 ? "Abierto" : ticket.statusId === 2 ? "En Progreso" : ticket.statusId === 3 ? "Resuelto" : "Cerrado"}
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

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Technical Report */}
        {ticket.technicalReport && (
          <Card>
            <CardHeader>
              <CardTitle>Reporte Técnico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.technicalReport}</p>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentarios ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Agregar un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={addComment.isPending}
                className="w-full"
              >
                {addComment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar Comentario
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 border-t pt-4">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">Usuario</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay comentarios aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history && history.length > 0 ? (
                history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 pb-2 border-b last:border-0">
                    <div className="text-xs text-gray-500 min-w-fit">
                      {new Date(entry.createdAt).toLocaleDateString("es-ES")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      {entry.oldValue && entry.newValue && (
                        <p className="text-xs text-gray-600">
                          De: {entry.oldValue} → A: {entry.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay cambios registrados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
