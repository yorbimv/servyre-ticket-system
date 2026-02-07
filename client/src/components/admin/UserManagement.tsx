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
import { Loader2, UserCog, UserPlus } from "lucide-react";
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
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function UserManagement() {
    const usersQuery = trpc.admin.getAllUsers.useQuery();
    const utils = trpc.useUtils();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "user" as "user" | "technician" | "admin",
        department: "",
    });

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
        },
        onError: () => {
            toast.error("Error al actualizar el usuario");
        },
    });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        await createUserMutation.mutateAsync(newUser);
    };

    const handleRoleChange = async (userId: number, role: string) => {
        await updateUserMutation.mutateAsync({
            userId,
            role: role as "user" | "technician" | "admin",
        });
    };

    const handleToggleStatus = async (userId: number, isActive: boolean) => {
        await updateUserMutation.mutateAsync({
            userId,
            isActive,
        });
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
                                        <SelectItem value="technician">Técnico</SelectItem>
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
                                        <SelectTrigger className="w-32 h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Usuario</SelectItem>
                                            <SelectItem value="technician">Técnico</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {user.isActive ? (
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleStatus(user.id, !user.isActive)}
                                        disabled={updateUserMutation.isPending}
                                        className={user.isActive ? "text-red-600" : "text-green-600"}
                                    >
                                        {user.isActive ? "Desactivar" : "Activar"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
