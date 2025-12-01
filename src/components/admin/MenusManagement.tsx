import { useEffect, useState } from 'react';
import { getAllDishes, getAllMenus, createMenu, deleteMenu, updateMenu, updateMenuStock } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Trash2, Edit, Minus, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Dish {
  id: string;
  name: string;
  category: string;
}

export default function MenusManagement() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: '',
    appetizer_id: '',
    main_dish_id: '',
    drink_id: '',
    price: 0,
    stock: 30,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dishesData, menusData] = await Promise.all([
        getAllDishes(),
        getAllMenus()
      ]);

      // Filter only active dishes
      const activeDishes = dishesData.filter(d => d.is_active).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category
      }));

      setDishes(activeDishes);
      setMenus(menusData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.main_dish_id || formData.price <= 0) {
        toast.error('Por favor completa los campos requeridos');
        return;
      }

      if (editingMenu) {
        // Editar menú existente
        const cleanedData = {
          price: formData.price,
          stock: formData.stock,
          ...(formData.appetizer_id && { appetizer_id: formData.appetizer_id }),
          main_dish_id: formData.main_dish_id,
          ...(formData.drink_id && { drink_id: formData.drink_id }),
        };

        await updateMenu(editingMenu.id, cleanedData);
        toast.success('Menú actualizado correctamente');
      } else {
        // Crear nuevo menú
        if (!formData.date) {
          toast.error('Por favor selecciona una fecha');
          return;
        }

        // Verificar si ya existe un menú para esta fecha
        const existingMenu = menus.find(menu => menu.date === formData.date);
        if (existingMenu) {
          toast.error('Ya existe un menú para esta fecha. Por favor selecciona otra fecha.');
          return;
        }

        const cleanedData = {
          date: formData.date,
          main_dish_id: formData.main_dish_id,
          price: formData.price,
          stock: formData.stock,
          ...(formData.appetizer_id && { appetizer_id: formData.appetizer_id }),
          ...(formData.drink_id && { drink_id: formData.drink_id }),
        };

        await createMenu(cleanedData);
        toast.success('Menú creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving menu:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al guardar menú';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este menú?')) return;

    try {
      await deleteMenu(id);
      toast.success('Menú eliminado correctamente');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting menu:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar menú');
    }
  };

  const resetForm = () => {
    setEditingMenu(null);
    setFormData({
      date: '',
      appetizer_id: '',
      main_dish_id: '',
      drink_id: '',
      price: 0,
      stock: 30,
    });
  };

  const handleEdit = (menu: any) => {
    setEditingMenu(menu);
    setFormData({
      date: menu.date,
      appetizer_id: menu.appetizer?.id || '',
      main_dish_id: menu.main_dish?.id || '',
      drink_id: menu.drink?.id || '',
      price: typeof menu.price === 'string' ? parseFloat(menu.price) : menu.price,
      stock: menu.stock,
    });
    setIsDialogOpen(true);
  };

  const handleStockUpdate = async (menuId: string, currentStock: number, increment: number) => {
    const newStock = currentStock + increment;
    
    if (newStock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    try {
      const reason = increment > 0 
        ? `Incremento de stock: +${increment}` 
        : `Decremento de stock: ${increment}`;
      await updateMenuStock(menuId, newStock, reason);
      toast.success('Stock actualizado');
      fetchData();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al actualizar stock';
      toast.error(errorMessage);
    }
  };

  const getDishesByCategory = (category: string) => dishes.filter(d => d.category === category);

  if (loading) {
    return <div className="text-center py-8">Cargando menús...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Menús Diarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Menú
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMenu ? 'Editar Menú' : 'Crear Menú Diario'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={!!editingMenu}
                />
                {formData.date && !editingMenu && menus.find(m => m.date === formData.date) && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Ya existe un menú para esta fecha</p>
                )}
              </div>

              <div>
                <Label>Entrada</Label>
                <Select value={formData.appetizer_id || "none"} onValueChange={(value) => setFormData({ ...formData, appetizer_id: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {getDishesByCategory('appetizer').map(dish => (
                      <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plato Principal *</Label>
                <Select value={formData.main_dish_id} onValueChange={(value) => setFormData({ ...formData, main_dish_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getDishesByCategory('main').map(dish => (
                      <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Bebida</Label>
                <Select value={formData.drink_id || "none"} onValueChange={(value) => setFormData({ ...formData, drink_id: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {getDishesByCategory('drink').map(dish => (
                      <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Precio (S/) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {editingMenu ? 'Actualizar Menú' : 'Crear Menú'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <Card key={menu.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {format(new Date(menu.date), "EEEE, d 'de' MMMM", { locale: es })}
                </CardTitle>
                <p className="text-xl font-bold text-primary">S/ {typeof menu.price === 'string' ? parseFloat(menu.price).toFixed(2) : menu.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Stock:</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => handleStockUpdate(menu.id, menu.stock, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-medium px-2">{menu.stock}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => handleStockUpdate(menu.id, menu.stock, 1)}
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                {menu.appetizer && (
                  <p><strong>🥗 Entrada:</strong> {menu.appetizer.name}</p>
                )}
                {menu.main_dish && (
                  <p><strong>🍽️ Principal:</strong> {menu.main_dish.name}</p>
                )}
                {menu.drink && (
                  <p><strong>🥤 Bebida:</strong> {menu.drink.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(menu)} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(menu.id)} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
