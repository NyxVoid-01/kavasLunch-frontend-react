import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createDish, updateDish, type DishCategory, type DishPayload } from '@/services/admin';
import type { Dish } from '@/services/menus';
import { getErrorMessage, getFieldErrors } from '@/lib/api';
import { DISH_CATEGORY_LABELS } from '@/lib/labels';
import { zodFieldErrors } from '@/lib/validation';
import DishImage from '@/components/DishImage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const dishSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.enum(['appetizer', 'main', 'drink'], { errorMap: () => ({ message: 'Selecciona la categoría' }) }),
  price: z.coerce.number({ invalid_type_error: 'Ingresa un precio' }).gt(0, 'El precio debe ser mayor a 0'),
  description: z.string().trim(),
  image_url: z
    .string()
    .trim()
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), 'La imagen debe ser un enlace válido (https://...)'),
});

interface FormState {
  name: string;
  category: DishCategory;
  price: string;
  description: string;
  image_url: string;
}

const initialState = (dish: Dish | null): FormState => ({
  name: dish?.name ?? '',
  category: dish?.category ?? 'main',
  price: dish ? String(Number(dish.price)) : '',
  description: dish?.description ?? '',
  image_url: dish?.image_url ?? '',
});

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);

interface DishFormDialogProps {
  // null: plato nuevo
  dish: Dish | null;
  onClose: () => void;
}

// Alta y edición de un plato. La imagen se indica con una URL (decisión del proyecto: no se almacenan archivos).
export default function DishFormDialog({ dish, onClose }: DishFormDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => initialState(dish));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editing = !!dish;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const save = useMutation({
    mutationFn: (payload: DishPayload) => (dish ? updateDish(dish.id, payload) : createDish(payload)),
    onSuccess: () => {
      toast.success(editing ? 'Plato actualizado' : 'Plato creado');
      // Los menús muestran los datos del plato: también se refrescan
      ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      onClose();
    },
    onError: (error) => {
      const fields = getFieldErrors(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      else toast.error(getErrorMessage(error));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = dishSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    const { name, category, price, description, image_url } = parsed.data;
    save.mutate({ name, category, price, description, image_url: image_url || null });
  };

  const previewUrl = /^https?:\/\/\S+$/i.test(form.image_url.trim()) ? form.image_url.trim() : '';

  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>{editing ? 'Editar Plato' : 'Nuevo Plato'}</DialogTitle>
          <DialogDescription>Los cambios se reflejan de inmediato en los menús que lo usan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field id="dish-name" label="Nombre *" error={errors.name}>
            <Input id="dish-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Lomo Saltado" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="dish-category" label="Categoría *" error={errors.category}>
              <Select value={form.category} onValueChange={(value) => set('category', value as DishCategory)}>
                <SelectTrigger id="dish-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DISH_CATEGORY_LABELS) as DishCategory[]).map((category) => (
                    <SelectItem key={category} value={category}>
                      {DISH_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="dish-price" label="Precio (S/) *" error={errors.price}>
              <Input
                id="dish-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0.00"
              />
            </Field>
          </div>

          <Field id="dish-description" label="Descripción" error={errors.description}>
            <Textarea
              id="dish-description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripción del plato..."
            />
          </Field>

          <Field id="dish-image" label="URL de la imagen" error={errors.image_url}>
            <Input
              id="dish-image"
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {previewUrl && (
              <DishImage dish={{ name: form.name || 'Plato', image_url: previewUrl }} className="h-24 mt-2" />
            )}
          </Field>

          <Button type="submit" className="w-full h-11 font-semibold" disabled={save.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {save.isPending ? 'Guardando...' : editing ? 'Actualizar Plato' : 'Crear Plato'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
