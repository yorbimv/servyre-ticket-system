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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");

  const { data: categories } = trpc.data.getCategories.useQuery();
  const { data: priorities } = trpc.data.getPriorities.useQuery();
  const createTicket = trpc.tickets.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !categoryId || !priorityId) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await createTicket.mutateAsync({
        title,
        description,
        categoryId: parseInt(categoryId),
        priorityId: parseInt(priorityId),
      });

      toast.success("Ticket creado exitosamente");
      setTitle("");
      setDescription("");
      setCategoryId("");
      setPriorityId("");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al crear el ticket");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <Input
          placeholder="Describe brevemente tu problema"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          minLength={5}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          placeholder="Proporciona detalles completos de tu problema"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={10}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prioridad</label>
          <Select value={priorityId} onValueChange={setPriorityId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona prioridad" />
            </SelectTrigger>
            <SelectContent>
              {priorities?.map((pri) => (
                <SelectItem key={pri.id} value={pri.id.toString()}>
                  {pri.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={createTicket.isPending}>
          {createTicket.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Crear Ticket
        </Button>
      </div>
    </form>
  );
}
