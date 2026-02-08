import { trpc } from "@/lib/trpc";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldAlert, Plus, Trash2, Edit2, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function PriorityManagement() {
    const prioritiesQuery = trpc.admin.getAllPriorities.useQuery();
    const utils = trpc.useUtils();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPriority, setEditingPriority] = useState<{
        id: number;
        name: string;
        displayName: string;
        level: number;
        color: string;
    } | null>(null);

    const [newPriority, setNewPriority] = useState({
        name: "",
        displayName: "",
        level: 1,
        color: "#6B7280"
    });

    const createMutation = trpc.admin.createPriority.useMutation({
        onSuccess: () => {
            toast.success("Prioridad creada");
            utils.admin.getAllPriorities.invalidate();
            setIsDialogOpen(false);
            setNewPriority({ name: "", displayName: "", level: 1, color: "#6B7280" });
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear la prioridad");
        }
    });

    const updateMutation = trpc.admin.updatePriority.useMutation({
        onSuccess: () => {
            toast.success("Prioridad actualizada");
            utils.admin.getAllPriorities.invalidate();
            setEditingPriority(null);
            setIsEditDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar la prioridad");
        }
    });

    const deleteMutation = trpc.admin.deletePriority.useMutation({
        onSuccess: () => {
            toast.success("Prioridad eliminada");
            utils.admin.getAllPriorities.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Error al eliminar la prioridad");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createMutation.mutateAsync(newPriority);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPriority) {
            await updateMutation.mutateAsync({
                id: editingPriority.id,
                name: editingPriority.name,
                displayName: editingPriority.displayName,
                level: editingPriority.level,
                color: editingPriority.color,
            });
        }
    };

    const handleToggleActive = async (id: number, isActive: boolean) => {
        await updateMutation.mutateAsync({ id, isActive });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar la prioridad "${name}"?`)) {
            deleteMutation.mutate({ id });
        }
    };

    if (prioritiesQuery.isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        Gestión de Prioridades
                    </CardTitle>
                    <CardDescription>
                        Configura los niveles de urgencia para los tickets
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nueva Prioridad
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Prioridad</DialogTitle>
                            <DialogDescription>
                                Define un nuevo nivel de urgencia
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre Interno (slug)</label>
                                <Input
                                    value={newPriority.name}
                                    onChange={e => setNewPriority({ ...newPriority, name: e.target.value })}
                                    placeholder="Ej: urgente, alta, normal..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre a Mostrar</label>
                                <Input
                                    value={newPriority.displayName}
                                    onChange={e => setNewPriority({ ...newPriority, displayName: e.target.value })}
                                    placeholder="Ej: ¡Urgente!, Alta Prioridad..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nivel Numérico (1-100)</label>
                                <Input
                                    type="number"
                                    value={newPriority.level}
                                    onChange={e => setNewPriority({ ...newPriority, level: parseInt(e.target.value) })}
                                    placeholder="100 para más urgente"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color (HEX)</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={newPriority.color}
                                        onChange={e => setNewPriority({ ...newPriority, color: e.target.value })}
                                        className="w-12 h-10 p-1"
                                    />
                                    <Input
                                        value={newPriority.color}
                                        onChange={e => setNewPriority({ ...newPriority, color: e.target.value })}
                                        placeholder="#EF4444"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Crear Prioridad
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Nivel</TableHead>

                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(prioritiesQuery.data || []).slice().sort((a, b) => b.level - a.level).map((priority) => (
                            <TableRow key={priority.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: priority.color }}
                                        />
                                        {priority.displayName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="gap-1">
                                        <ArrowUpCircle className="w-3 h-3" />
                                        {priority.level}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {priority.isActive ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Activo
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            Inactivo
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingPriority({
                                                    id: priority.id,
                                                    name: priority.name,
                                                    displayName: priority.displayName,
                                                    level: priority.level,
                                                    color: priority.color
                                                });
                                                setIsEditDialogOpen(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(priority.id, priority.displayName)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Edit Priority Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Prioridad</DialogTitle>
                            <DialogDescription>
                                Modifica los detalles de la prioridad
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre Interno (slug)</label>
                                <Input
                                    value={editingPriority?.name || ""}
                                    onChange={e => setEditingPriority(editingPriority ?
                                        { ...editingPriority, name: e.target.value } : null)}
                                    placeholder="Ej: urgente, alta, normal..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre a Mostrar</label>
                                <Input
                                    value={editingPriority?.displayName || ""}
                                    onChange={e => setEditingPriority(editingPriority ?
                                        { ...editingPriority, displayName: e.target.value } : null)}
                                    placeholder="Ej: ¡Urgente!, Alta Prioridad..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nivel Numérico (1-100)</label>
                                <Input
                                    type="number"
                                    value={editingPriority?.level || 1}
                                    onChange={e => setEditingPriority(editingPriority ?
                                        { ...editingPriority, level: parseInt(e.target.value) } : null)}
                                    placeholder="100 para más urgente"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color (HEX)</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={editingPriority?.color || "#6B7280"}
                                        onChange={e => setEditingPriority(editingPriority ?
                                            { ...editingPriority, color: e.target.value } : null)}
                                        className="w-12 h-10 p-1"
                                    />
                                    <Input
                                        value={editingPriority?.color || "#6B7280"}
                                        onChange={e => setEditingPriority(editingPriority ?
                                            { ...editingPriority, color: e.target.value } : null)}
                                        placeholder="#EF4444"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
