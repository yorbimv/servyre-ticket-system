import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Plus,
    Loader2,
    Building2,
    Trash2,
    Pencil,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function DepartmentManagement() {
    const [newName, setNewName] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const utils = trpc.useUtils();

    const { data: departments, isLoading } = trpc.admin.getAllDepartments.useQuery();

    const createMutation = trpc.admin.createDepartment.useMutation({
        onSuccess: () => {
            toast.success("Departamento creado exitosamente");
            utils.admin.getAllDepartments.invalidate();
            setNewName("");
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    const updateMutation = trpc.admin.updateDepartment.useMutation({
        onSuccess: () => {
            utils.admin.getAllDepartments.invalidate();
            toast.success("Departamento actualizado");
            setIsEditOpen(false);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const deleteMutation = trpc.admin.deleteDepartment.useMutation({
        onSuccess: () => {
            utils.admin.getAllDepartments.invalidate();
            toast.success("Departamento eliminado");
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate({ name: newName });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar el departamento "${name}"?`)) {
            deleteMutation.mutate({ id });
        }
    };

    const handleEdit = (dept: any) => {
        setEditingDept(dept);
        setEditName(dept.name);
        setEditIsActive(dept.isActive);
        setIsEditOpen(true);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editingDept) return;
        updateMutation.mutate({
            id: editingDept.id,
            name: editName,
            isActive: editIsActive
        });
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Building2 className="w-6 h-6 text-primary" />
                    Gestión de Departamentos
                </CardTitle>
                <CardDescription>
                    Administra los departamentos de la organización que estarán disponibles al crear tickets.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="flex gap-4 mb-8 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex-1">
                        <Input
                            placeholder="Nombre del departamento (ej: Recursos Humanos)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-background"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Agregar Departamento
                    </Button>
                </form>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[400px]">Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : departments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No se encontraron departamentos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departments?.map((dept) => (
                                    <TableRow key={dept.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                {dept.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dept.isActive ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Activo
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    Inactivo
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(dept)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(dept.id, dept.name)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateSubmit}>
                        <DialogHeader>
                            <DialogTitle>Editar Departamento</DialogTitle>
                            <DialogDescription>
                                Actualiza el nombre o el estado del departamento.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editName">Nombre del Departamento</Label>
                                <Input
                                    id="editName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nombre del departamento"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="editIsActive"
                                    checked={editIsActive}
                                    onCheckedChange={setEditIsActive}
                                />
                                <Label htmlFor="editIsActive">Estado Activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
