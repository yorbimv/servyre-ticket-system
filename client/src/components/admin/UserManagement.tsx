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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCog, UserPlus, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function UserManagement() {
    const usersQuery = trpc.admin.getAllUsers.useQuery();
    const utils = trpc.useUtils();

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Form states
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "user" as "user" | "technician" | "admin",
        department: "",
    });

    const [editingUser, setEditingUser] = useState<{
        id: number;
        name: string;
        email: string;
        role: "user" | "technician" | "admin";
        department: string;
    } | null>(null);

    const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);

    // Mutations
    const createUserMutation = trpc.admin.createUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario creado correctamente");
            utils.admin.getAllUsers.invalidate();
            setIsDialogOpen(false);
            setNewUser({ name: "", email: "", role: "user", department: "" });
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear el usuario");
        },
    });

    const updateUserMutation = trpc.admin.updateUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario actualizado correctamente");
            utils.admin.getAllUsers.invalidate();
            if (isEditDialogOpen) {
                setIsEditDialogOpen(false);
                setEditingUser(null);
            }
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar el usuario");
        },
    });

    const deleteUserMutation = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            toast.success("Usuario eliminado correctamente");
            utils.admin.getAllUsers.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Error al eliminar el usuario");
        },
    });

    // Handlers
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        await createUserMutation.mutateAsync(newUser);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        await updateUserMutation.mutateAsync({
            userId: editingUser.id,
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role,
            department: editingUser.department,
        });
    };

    const handleRoleChange = async (userId: number, role: string) => {
        await updateUserMutation.mutateAsync({
            userId,
            role: role as "user" | "technician" | "admin",
        });
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        await deleteUserMutation.mutateAsync({ id: userToDelete.id });
        setUserToDelete(null);
    };

    const openEditDialog = (user: any) => {
        setEditingUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || "",
        });
        setIsEditDialogOpen(true);
    };

    if (usersQuery.isLoading) {
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
                        <UserCog className="w-5 h-5" />
                        Gestión de Usuarios
                    </CardTitle>
                    <CardDescription>
                        Administra los roles y el estado de acceso de los usuarios del sistema
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Nuevo Usuario
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Usuario</DialogTitle>
                            <DialogDescription>
                                Registra un nuevo técnico o administrador en el sistema
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="usuario@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rol</label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(val: any) => setNewUser({ ...newUser, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuario</SelectItem>
                                        <SelectItem value="technician">Soporte Técnico</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Departamento (Opcional)</label>
                                <Input
                                    value={newUser.department}
                                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                    placeholder="IT, Ventas, etc."
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createUserMutation.isPending}>
                                    {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Crear Usuario
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
                            <TableHead>Nombre / Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersQuery.data?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{user.name || "Sin nombre"}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={user.role}
                                        onValueChange={(val) => handleRoleChange(user.id, val)}
                                        disabled={updateUserMutation.isPending}
                                    >
                                        <SelectTrigger className="w-40 h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Usuario</SelectItem>
                                            <SelectItem value="technician">Soporte Técnico</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setUserToDelete({ id: user.id, name: user.name || "Usuario" })}
                                            disabled={deleteUserMutation.isPending}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modifica la información del usuario
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={editingUser.name}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    placeholder="usuario@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rol</label>
                                <Select
                                    value={editingUser.role}
                                    onValueChange={(val: any) => setEditingUser({ ...editingUser, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuario</SelectItem>
                                        <SelectItem value="technician">Técnico</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Departamento</label>
                                <Input
                                    value={editingUser.department}
                                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                                    placeholder="IT, Ventas, etc."
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={updateUserMutation.isPending}>
                                    {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                            <strong> {userToDelete?.name}</strong> y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
