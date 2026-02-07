import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateTicketFormProps {
  onSuccess?: () => void;
}

export default function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [failureId, setFailureId] = useState("");
  const [description, setDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [branch, setBranch] = useState("SRV");

  const { data: categories } = trpc.data.getCategories.useQuery();
  const { data: priorities } = trpc.data.getPriorities.useQuery();
  const { data: failures } = trpc.data.getCategoryFailures.useQuery(
    { categoryId: parseInt(categoryId) },
    { enabled: !!categoryId }
  );
  const { data: departments } = trpc.data.getDepartments.useQuery();
  const createTicket = trpc.tickets.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId || !priorityId || !failureId || !description || !userName || !userEmail || !departmentId) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!/@servyre\./.test(userEmail)) {
      toast.error("El correo debe ser del dominio @servyre (ej: usuario@servyre.com)");
      return;
    }

    // El título ahora será el nombre de la falla seleccionada
    const selectedFailure = failures?.find(f => f.id.toString() === failureId);
    if (!selectedFailure) return;

    try {
      await createTicket.mutateAsync({
        title: selectedFailure.name,
        description,
        categoryId: parseInt(categoryId),
        priorityId: parseInt(priorityId),
        departmentId: parseInt(departmentId),
        userName,
        userEmail,
        branch: branch as "SRV" | "NAUC",
      });

      toast.success("Ticket creado exitosamente");
      setCategoryId("");
      setPriorityId("");
      setFailureId("");
      setDescription("");
      setUserName("");
      setUserEmail("");
      setDepartmentId("");
      setBranch("SRV");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el ticket");
    }
  };

  const selectedPriorityColor = priorities?.find(p => p.id.toString() === priorityId)?.color;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre Solicitante</label>
          <Input
            placeholder="Tu nombre completo"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correo (@servyre)</label>
          <Input
            placeholder="usuario@servyre"
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Departamento</label>
          <Select value={departmentId} onValueChange={setDepartmentId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map(dept => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <Select value={categoryId} onValueChange={(val) => {
            setCategoryId(val);
            setFailureId(""); // Reset failure when category changes
          }} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridad con Color */}
        <div>
          <label className="block text-sm font-medium mb-1">Prioridad</label>
          <Select value={priorityId} onValueChange={setPriorityId} required>
            <SelectTrigger className={selectedPriorityColor ? "font-bold" : ""} style={{ color: selectedPriorityColor }}>
              <SelectValue placeholder="Selecciona prioridad" />
            </SelectTrigger>
            <SelectContent>
              {priorities?.map(pri => (
                <SelectItem key={pri.id} value={pri.id.toString()} style={{ color: pri.color }}>
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pri.color }} />
                    {pri.displayName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sucursal</label>
          <Select value={branch} onValueChange={setBranch} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SRV">SERVYRE (SRV)</SelectItem>
              <SelectItem value="NAUC">NAUCALPAN (NAUC)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fallas Basadas en Categoría (Cascading) */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Falla</label>
        <Select value={failureId} onValueChange={setFailureId} required disabled={!categoryId}>
          <SelectTrigger>
            <SelectValue placeholder={categoryId ? "Selecciona el problema específico" : "Primero selecciona una categoría"} />
          </SelectTrigger>
          <SelectContent>
            {failures?.map(f => (
              <SelectItem key={f.id} value={f.id.toString()}>
                {f.name}
              </SelectItem>
            ))}
            {failures?.length === 0 && (
              <div className="p-2 text-sm text-gray-500 text-center">No hay fallas predefinidas</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción Detallada</label>
        <Textarea
          placeholder="Proporciona detalles adicionales de tu problema"
          value={description}
          onChange={e => setDescription(e.target.value)}
          minLength={10}
          rows={4}
          required
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={createTicket.isPending}>
          {createTicket.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Crear Ticket
        </Button>
      </div>
    </form>
  );
}
