import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Eye, Rocket, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createMenu, updateMenu, type DishCategory, type MenuPayload } from '@/services/admin';
import type { DailyMenu, Dish } from '@/services/menus';
import { getErrorMessage, getFieldErrors } from '@/lib/api';
import { parseLocalDate, todayISO } from '@/lib/dates';
import { zodFieldErrors } from '@/lib/validation';
import MenuCard from '@/components/menus/MenuCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// "Ninguna" no puede ser un valor vacío en el selector, por eso un valor propio
const NONE = 'none';

interface FormState {
  date: string;
  appetizer_id: string;
  main_dish_id: string;
  drink_id: string;
  price: string;
  stock: string;
}

const initialState = (menu: DailyMenu | null): FormState => ({
  date: menu?.date ?? '',
  appetizer_id: menu?.appetizer_id ?? NONE,
  main_dish_id: menu?.main_dish_id ?? '',
  drink_id: menu?.drink_id ?? NONE,
  price: menu ? String(Number(menu.price)) : '',
  stock: menu ? String(menu.stock) : '',
});

const buildSchema = (editing: boolean) =>
  z.object({
    date: z
      .string()
      .min(1, 'Selecciona una fecha')
      .refine((date) => editing || date >= todayISO(), 'La fecha no puede ser anterior a hoy')
      // Los menús son solo de lunes a viernes
      .refine((date) => editing || ![0, 6].includes(parseLocalDate(date).getDay()), 'Los menús son solo de lunes a viernes'),
    appetizer_id: z.string(),
    main_dish_id: z.string().min(1, 'Selecciona el plato principal'),
    drink_id: z.string(),
    price: z.coerce.number({ invalid_type_error: 'Ingresa un precio' }).gt(0, 'El precio debe ser mayor a 0'),
    stock: z.coerce
      .number({ invalid_type_error: 'Ingresa el stock' })
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo'),
  });

const Field = ({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error ? (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    ) : (
      hint && <p className="text-xs text-muted-foreground">{hint}</p>
    )}
  </div>
);

interface MenuFormDialogProps {
  // null: menú nuevo
  menu: DailyMenu | null;
  menus: DailyMenu[];
  dishes: Dish[];
  onClose: () => void;
}

// Alta y edición de un menú diario con vista previa antes de publicar (RF-010)
export default function MenuFormDialog({ menu, menus, dishes, onClose }: MenuFormDialogProps) {
  const queryClient = useQueryClient();
  const editing = !!menu;
  const [form, setForm] = useState<FormState>(() => initialState(menu));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'preview'>('form');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  // Solo platos activos de cada categoría; el que ya tiene el menú se mantiene aunque se haya desactivado
  const optionsFor = (category: DishCategory, currentId?: string | null) =>
    dishes.filter((dish) => dish.category === category && (dish.is_active || dish.id === currentId));

  const dishOf = (id: string) => dishes.find((dish) => dish.id === id) ?? null;

  const sameDayCount = menus.filter((m) => m.date === form.date && m.id !== menu?.id).length;

  const preview = useMemo<DailyMenu>(
    () => ({
      id: 'preview',
      date: form.date || todayISO(),
      price: String(Number(form.price) || 0),
      stock: Number(form.stock) || 0,
      is_active: true,
      appetizer: form.appetizer_id === NONE ? null : dishOf(form.appetizer_id),
      main_dish: dishOf(form.main_dish_id),
      drink: form.drink_id === NONE ? null : dishOf(form.drink_id),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, dishes]
  );

  const save = useMutation({
    mutationFn: (payload: MenuPayload) => {
      if (menu) {
        // La fecha de un menú publicado no se cambia: es lo que reservaron los usuarios
        const { date: _date, ...changes } = payload;
        return updateMenu(menu.id, changes);
      }
      return createMenu(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Menú actualizado' : 'Menú publicado');
      ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      onClose();
    },
    onError: (error) => {
      const fields = getFieldErrors(error);
      if (Object.keys(fields).length > 0) {
        setErrors(fields);
        setStep('form');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });

  const parse = () => {
    const parsed = buildSchema(editing).safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return null;
    }
    return parsed.data;
  };

  const goToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (parse()) setStep('preview');
  };

  const publish = () => {
    const data = parse();
    if (!data) {
      setStep('form');
      return;
    }
    save.mutate({
      date: data.date,
      appetizer_id: data.appetizer_id === NONE ? null : data.appetizer_id,
      main_dish_id: data.main_dish_id,
      drink_id: data.drink_id === NONE ? null : data.drink_id,
      price: data.price,
      stock: data.stock,
    });
  };

  const dishSelect = (field: 'appetizer_id' | 'main_dish_id' | 'drink_id', category: DishCategory, optional: boolean) => (
    <Select value={form[field] || undefined} onValueChange={(value) => set(field, value)}>
      <SelectTrigger id={`menu-${field}`}>
        <SelectValue placeholder="Seleccionar..." />
      </SelectTrigger>
      <SelectContent>
        {optional && <SelectItem value={NONE}>Ninguna</SelectItem>}
        {optionsFor(category, menu?.[field]).map((dish) => (
          <SelectItem key={dish.id} value={dish.id}>
            {dish.name}
            {dish.is_active ? '' : ' (inactivo)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>{step === 'preview' ? 'Vista previa del menú' : editing ? 'Editar Menú' : 'Crear Menú Diario'}</DialogTitle>
          <DialogDescription>
            {step === 'preview' ? 'Así lo verán los usuarios. Revisa los datos antes de confirmar.' : 'Combina platos del catálogo para un día.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={goToPreview} className="space-y-4" noValidate>
            <Field
              id="menu-date"
              label="Fecha *"
              error={errors.date}
              hint={editing ? 'La fecha de un menú publicado no se puede cambiar.' : undefined}
            >
              <Input
                id="menu-date"
                type="date"
                value={form.date}
                min={editing ? undefined : todayISO()}
                disabled={editing}
                onChange={(e) => set('date', e.target.value)}
              />
              {!editing && <p className="text-xs text-muted-foreground">Solo de lunes a viernes</p>}
              {!editing && sameDayCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-[#92400E]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Ya hay {sameDayCount} {sameDayCount === 1 ? 'menú' : 'menús'} ese día. Puedes publicar otro con una combinación distinta.
                </p>
              )}
            </Field>

            <Field id="menu-appetizer_id" label="Entrada" error={errors.appetizer_id}>
              {dishSelect('appetizer_id', 'appetizer', true)}
            </Field>
            <Field id="menu-main_dish_id" label="Plato Principal *" error={errors.main_dish_id}>
              {dishSelect('main_dish_id', 'main', false)}
            </Field>
            <Field id="menu-drink_id" label="Bebida" error={errors.drink_id}>
              {dishSelect('drink_id', 'drink', true)}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field id="menu-price" label="Precio (S/) *" error={errors.price}>
                <Input
                  id="menu-price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </Field>
              <Field id="menu-stock" label="Stock *" error={errors.stock}>
                <Input
                  id="menu-stock"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                />
              </Field>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold">
              <Eye className="w-4 h-4 mr-2" />
              Vista previa
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Solo para mirar: no se puede interactuar con la tarjeta de ejemplo */}
            <div className="pointer-events-none select-none" {...({ inert: '' } as object)}>
              <MenuCard menu={preview} onReserve={() => undefined} onDetail={() => undefined} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11 font-semibold" onClick={() => setStep('form')} disabled={save.isPending}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a editar
              </Button>
              <Button className="h-11 font-semibold" onClick={publish} disabled={save.isPending}>
                {editing ? <Save className="w-4 h-4 mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                {save.isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Publicar menú'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
