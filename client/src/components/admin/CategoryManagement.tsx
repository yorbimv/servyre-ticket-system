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
import { Loader2, Tags, Plus, Trash2, Edit2, ListTree, AlertCircle } from "lucide-react";
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

export function CategoryManagement() {
    const categoriesQuery = trpc.data.getCategories.useQuery();
    const utils = trpc.useUtils();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{ id: number, name: string, description: string, color: string } | null>(null);

    const [newCat, setNewCat] = useState({ name: "", description: "", color: "#3B82F6" });

    const createMutation = trpc.admin.createCategory.useMutation({
        onSuccess: () => {
            toast.success("Categoría creada");
            utils.data.getCategories.invalidate();
            setIsDialogOpen(false);
            setNewCat({ name: "", description: "", color: "#3B82F6" });
        },
    });

    const updateMutation = trpc.admin.updateCategory.useMutation({
        onSuccess: () => {
            toast.success("Categoría actualizada");
            utils.data.getCategories.invalidate();
            setEditingCategory(null);
            setIsEditDialogOpen(false);
        },
    });

    const deleteMutation = trpc.admin.deleteCategory.useMutation({
        onSuccess: () => {
            toast.success("Categoría eliminada");
            utils.data.getCategories.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Error al eliminar la categoría");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createMutation.mutateAsync(newCat);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            await updateMutation.mutateAsync({
                id: editingCategory.id,
                name: editingCategory.name,
                description: editingCategory.description,
                color: editingCategory.color,
            });
        }
    };


    if (categoriesQuery.isLoading) {
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
                        <Tags className="w-5 h-5" />
                        Gestión de Categorías
                    </CardTitle>
                    <CardDescription>
                        Configura las tipologías de tickets disponibles para los usuarios
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nueva Categoría
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Categoría</DialogTitle>
                            <DialogDescription>
                                Crea una nueva categoría para organizar los tickets
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={newCat.name}
                                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                                    placeholder="Ej: Hardware, Software, Redes..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <Input
                                    value={newCat.description}
                                    onChange={e => setNewCat({ ...newCat, description: e.target.value })}
                                    placeholder="Descripción breve de la categoría"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color (HEX)</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={newCat.color}
                                        onChange={e => setNewCat({ ...newCat, color: e.target.value })}
                                        className="w-12 h-10 p-1"
                                    />
                                    <Input
                                        value={newCat.color}
                                        onChange={e => setNewCat({ ...newCat, color: e.target.value })}
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Crear Categoría
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoriesQuery.data?.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        {cat.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {cat.description || "Sin descripción"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <FailureManagementDialog categoryId={cat.id} categoryName={cat.name} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingCategory({
                                                    id: cat.id,
                                                    name: cat.name,
                                                    description: cat.description || "",
                                                    color: cat.color
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMutation.mutate({ id: cat.id });
                                            }}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categoriesQuery.data?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No hay categorías configuradas
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Edit Category Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Categoría</DialogTitle>
                            <DialogDescription>
                                Modifica el nombre y descripción de la categoría
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={editingCategory?.name || ""}
                                    onChange={e => setEditingCategory(editingCategory ? { ...editingCategory, name: e.target.value } : null)}
                                    placeholder="Ej: Hardware, Software, Redes..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <Input
                                    value={editingCategory?.description || ""}
                                    onChange={e => setEditingCategory(editingCategory ? { ...editingCategory, description: e.target.value } : null)}
                                    placeholder="Descripción breve de la categoría"
                                />
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

function FailureManagementDialog({ categoryId, categoryName }: { categoryId: number, categoryName: string }) {
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const utils = trpc.useUtils();

    const failuresQuery = trpc.data.getCategoryFailures.useQuery({ categoryId });

    const createMutation = trpc.admin.createCategoryFailure.useMutation({
        onSuccess: () => {
            toast.success("Falla agregada");
            utils.data.getCategoryFailures.invalidate({ categoryId });
            setNewName("");
        },
    });

    const updateMutation = trpc.admin.updateCategoryFailure.useMutation({
        onSuccess: () => {
            utils.data.getCategoryFailures.invalidate({ categoryId });
        },
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate({ categoryId, name: newName });
    };

    const toggleStatus = (id: number, isActive: boolean) => {
        updateMutation.mutate({ id, isActive });
    };

    return (
        <Dialog open={isInternalOpen} onOpenChange={setIsInternalOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                    <ListTree className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        Fallas: {categoryName}
                    </DialogTitle>
                    <DialogDescription>
                        Define las fallas comunes para esta categoría que aparecerán al crear un ticket.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAdd} className="flex gap-2 py-4">
                    <Input
                        placeholder="Nueva falla (ej: No enciende)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <Button type="submit" size="sm" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </form>

                <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Nombre</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {failuresQuery.data?.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className={`text-center ${f.isActive ? "" : "text-gray-400 line-through"}`}>
                                        {f.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatus(f.id, !f.isActive)}
                                            className={f.isActive ? "text-red-500" : "text-green-500"}
                                        >
                                            {f.isActive ? "Desactivar" : "Activar"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {failuresQuery.data?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-4 text-gray-500 text-sm">
                                        No hay fallas definidas
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
