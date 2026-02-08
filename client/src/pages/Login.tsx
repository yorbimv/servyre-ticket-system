import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Shield, User, Wrench } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
    const [, navigate] = useLocation();
    const utils = trpc.useUtils();

    const loginMutation = trpc.auth.devLogin.useMutation({
        onSuccess: async () => {
            // Invalidate queries to refetch user state
            await utils.auth.me.invalidate();
            // Redirect to home/dashboard
            navigate("/");
        },
        onError: (error) => {
            alert("Error al iniciar sesión: " + error.message);
        },
    });

    const handleLogin = (role: "admin" | "technician" | "user") => {
        loginMutation.mutate({ role });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Bienvenido a Servyre</CardTitle>
                    <CardDescription>
                        Modo de Desarrollo Local
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                        Selecciona un rol para iniciar sesión:
                    </p>

                    <Button
                        variant="outline"
                        className="w-full h-14 justify-start px-4 gap-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                        onClick={() => handleLogin("admin")}
                        disabled={loginMutation.isPending}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Administrador</div>
                            <div className="text-xs text-muted-foreground">Acceso total al sistema</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full h-14 justify-start px-4 gap-4 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                        onClick={() => handleLogin("technician")}
                        disabled={loginMutation.isPending}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-800 transition-colors">
                            <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Técnico</div>
                            <div className="text-xs text-muted-foreground">Gestión de tickets y reportes</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full h-14 justify-start px-4 gap-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                        onClick={() => handleLogin("user")}
                        disabled={loginMutation.isPending}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-800 transition-colors">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Usuario Final</div>
                            <div className="text-xs text-muted-foreground">Crear y ver mis tickets</div>
                        </div>
                    </Button>

                    {loginMutation.isPending && (
                        <p className="text-center text-xs text-muted-foreground animate-pulse mt-4">
                            Iniciando sesión...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
