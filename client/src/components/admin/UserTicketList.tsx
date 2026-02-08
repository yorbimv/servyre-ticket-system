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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Loader2, Pencil, Trash2, CheckCircle2, XCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function UserTicketList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();
    const createUser = trpc.admin.createUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario creado exitosamente");
            refetch();
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear usuario");
        },
    });

    const updateUser = trpc.admin.updateUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario actualizado exitosamente");
            refetch();
            setIsEditOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar usuario");
        },
    });

    const deleteUser = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario eliminado exitosamente");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Error al eliminar usuario");
        },
    });

    const resetForm = () => {
        setName("");
        setEmail("");
        setEditingUser(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        if (!/@servyre\./.test(email)) {
            toast.error("El correo debe ser del dominio @servyre (ej: usuario@servyre.com)");
            return;
        }

        // Generate a unique openId for the user
        const openId = `ticket-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        createUser.mutate({
            openId,
            name,
            email,
            role: "user",
            isActive: true,
        });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !editingUser) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        if (!/@servyre\./.test(email)) {
            toast.error("El correo debe ser del dominio @servyre (ej: usuario@servyre.com)");
            return;
        }

        updateUser.mutate({
            userId: editingUser.id,
            name,
            email,
        });
    };

    const handleDelete = (userId: number, userName: string) => {
        if (confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) {
            deleteUser.mutate({ id: userId });
        }
    };

    const openEditDialog = (user: any) => {
        setEditingUser(user);
        setName(user.name || "");
        setEmail(user.email);
        setIsEditOpen(true);
    };

    const filteredUsers = users?.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Usuarios de Tickets</CardTitle>
                            <CardDescription>
                                Gestiona los usuarios que pueden crear tickets
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                        <DialogDescription>
                                            Agrega un nuevo usuario para el sistema de tickets
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nombre Completo</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Juan Pérez"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="usuario@servyre.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={createUser.isPending}>
                                            {createUser.isPending && (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            Crear Usuario
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers && filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name || "Sin nombre"}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
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
                                                        onClick={() => openEditDialog(user)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id, user.name || user.email)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No se encontraron usuarios
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                            <DialogDescription>
                                Actualiza la información del usuario
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre Completo</Label>
                                <Input
                                    id="edit-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Correo Electrónico</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@servyre.com"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updateUser.isPending}>
                                {updateUser.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
