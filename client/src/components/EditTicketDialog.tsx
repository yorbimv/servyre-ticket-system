import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditTicketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: any; // Using any for flexibility with return types, could be strict
    onSuccess?: () => void;
}

export function EditTicketDialog({ open, onOpenChange, ticket, onSuccess }: EditTicketDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        statusId: "",
        priorityId: "",
        categoryId: ""
    });

    const { data: categories } = trpc.data.getCategories.useQuery();
    const { data: statuses } = trpc.data.getStatuses.useQuery();
    const { data: priorities } = trpc.data.getPriorities.useQuery();

    const updateTicketAdmin = trpc.tickets.updateTicketAdmin.useMutation();

    useEffect(() => {
        if (ticket) {
            setFormData({
                title: ticket.title,
                description: ticket.description,
                statusId: String(ticket.statusId),
                priorityId: String(ticket.priorityId),
                categoryId: String(ticket.categoryId),
            });
        }
    }, [ticket]);

    const handleUpdate = async () => {
        if (!ticket) return;
        try {
            await updateTicketAdmin.mutateAsync({
                ticketId: ticket.id,
                title: formData.title,
                description: formData.description,
                statusId: Number(formData.statusId),
                priorityId: Number(formData.priorityId),
                categoryId: Number(formData.categoryId),
            });
            toast.success("Ticket actualizado correctamente");
            onOpenChange(false);
            onSuccess?.();
        } catch (e: any) {
            toast.error(e.message || "Error al actualizar ticket");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título</label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estado</label>
                            <Select value={formData.statusId} onValueChange={(val) => setFormData({ ...formData, statusId: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.displayName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prioridad</label>
                            <Select value={formData.priorityId} onValueChange={(val) => setFormData({ ...formData, priorityId: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.displayName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoría</label>
                            <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleUpdate} disabled={updateTicketAdmin.isPending}>
                            {updateTicketAdmin.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
