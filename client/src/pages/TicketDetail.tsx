import { useRoute } from "wouter";
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
import { EditTicketDialog } from "@/components/EditTicketDialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, ArrowLeft, MessageSquare, Paperclip, Pencil, Trash } from "lucide-react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TicketDetail() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/tickets/:id");
  const ticketId = params?.id ? parseInt(params.id) : 0;
  const utils = trpc.useUtils();

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery({
    ticketId,
  });
  const { data: comments } = trpc.tickets.getComments.useQuery({ ticketId });
  const { data: history } = trpc.tickets.getHistory.useQuery({ ticketId });



  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Admin State
  const [editingComment, setEditingComment] = useState<{ id: number, content: string } | null>(null);
  const [isEditingTicket, setIsEditingTicket] = useState(false);

  const addComment = trpc.tickets.addComment.useMutation();
  const updateComment = trpc.tickets.updateComment.useMutation();
  const deleteComment = trpc.tickets.deleteComment.useMutation();
  const updateTicketAdmin = trpc.tickets.updateTicketAdmin.useMutation();
  const deleteTicketAdmin = trpc.tickets.deleteTicketAdmin.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("El archivo no debe superar 2MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;
    try {
      await deleteComment.mutateAsync({ commentId });
      toast.success("Comentario eliminado");
      utils.tickets.getComments.invalidate({ ticketId });
      utils.tickets.getHistory.invalidate({ ticketId });
    } catch (e) { toast.error("Error al eliminar comentario"); }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    try {
      await updateComment.mutateAsync({
        commentId: editingComment.id,
        content: editingComment.content
      });
      toast.success("Comentario actualizado");
      setEditingComment(null);
      utils.tickets.getComments.invalidate({ ticketId });
    } catch (e) { toast.error("Error al actualizar comentario"); }
  };

  const handleDeleteTicket = async () => {
    if (!confirm("¿Estás seguro de eliminar este ticket y todo su historial? Esta acción no se puede deshacer.")) return;
    try {
      await deleteTicketAdmin.mutateAsync({ ticketId });
      toast.success("Ticket eliminado");
      navigate("/all-tickets");
    } catch (e) { toast.error("Error al eliminar ticket"); }
  };



  const handleAddComment = async () => {
    if (!commentText.trim() && !selectedFile) {
      toast.error("Debes escribir un comentario o agregar un archivo");
      return;
    }

    try {
      let attachment = undefined;

      if (selectedFile) {
        const reader = new FileReader();
        attachment = await new Promise<{ name: string, base64: string }>((resolve, reject) => {
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              resolve({
                name: selectedFile.name,
                base64: e.target.result
              });
            } else {
              reject(new Error("Error reading file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      await addComment.mutateAsync({
        ticketId,
        content: commentText,
        isInternal: false,
        attachment,
      });
      setCommentText("");
      setSelectedFile(null);
      toast.success("Comentario agregado");
      utils.tickets.getComments.invalidate({ ticketId });
      utils.tickets.getHistory.invalidate({ ticketId });
    } catch (error: any) {
      toast.error(error.message || "Error al agregar comentario");
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
          <Button
            variant="ghost"
            onClick={() => navigate("/my-tickets")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {ticket.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Ticket: {ticket.ticketNumber}
              </p>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setIsEditingTicket(true);
                }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteTicket}>
                  <Trash className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            )}
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
                    {ticket.statusId === 1
                      ? "Abierto"
                      : ticket.statusId === 2
                        ? "En Progreso"
                        : ticket.statusId === 3
                          ? "Resuelto"
                          : "Cerrado"}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priorityId)}>
                    Prioridad:{" "}
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
              <div className="text-right text-sm text-gray-500">
                <p>
                  Creado:{" "}
                  {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
                </p>
                {ticket.resolvedAt && (
                  <p className="text-green-600">
                    Resuelto:{" "}
                    {new Date(ticket.resolvedAt).toLocaleDateString("es-ES")}
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
            <p className="text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </CardContent>
        </Card>

        {/* Technical Report */}
        {ticket.technicalReport && (
          <Card>
            <CardHeader>
              <CardTitle>Reporte Técnico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.technicalReport}
              </p>
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
            <div className="space-y-4">
              <Textarea
                placeholder="Agregar un comentario..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    {selectedFile ? selectedFile.name : "Adjuntar archivo"}
                  </label>
                  {selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      ✕
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleAddComment}
                  disabled={addComment.isPending}
                >
                  {addComment.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 border-t pt-4">
              {comments && comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{comment.userName || "Usuario"}</p>
                        {comment.userRole === 'admin' && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">Admin</Badge>}
                        {comment.userRole === 'technician' && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-blue-100 text-blue-800">Soporte Técnico</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "es-ES", { hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                        {user?.role === 'admin' && (
                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200" onClick={() => setEditingComment({ id: comment.id, content: comment.content || "" })}>
                              <Pencil className="w-3 h-3 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 text-red-500" onClick={() => handleDeleteComment(comment.id)}>
                              <Trash className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingComment?.id === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingComment.content}
                          onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Cancelar</Button>
                          <Button size="sm" onClick={handleUpdateComment}>Guardar</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                    )}

                    {comment.attachmentUrl && (
                      <div className="mt-3 border-t pt-2">
                        <a
                          href={comment.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                        >
                          <Paperclip className="w-3 h-3" />
                          {comment.attachmentName || "Ver archivo adjunto"}
                        </a>
                        {comment.attachmentName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                          <div className="mt-2">
                            <img
                              src={comment.attachmentUrl}
                              alt="Adjunto"
                              className="max-w-full max-h-64 rounded-lg border shadow-sm object-contain bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}
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
                history.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 pb-2 border-b last:border-0"
                  >
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
                <p className="text-gray-500 text-sm">
                  No hay cambios registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <EditTicketDialog
        open={isEditingTicket}
        onOpenChange={setIsEditingTicket}
        ticket={ticket}
        onSuccess={() => {
          utils.tickets.getById.invalidate({ ticketId });
          utils.tickets.getHistory.invalidate({ ticketId });
        }}
      />
    </AppLayout>
  );
}
