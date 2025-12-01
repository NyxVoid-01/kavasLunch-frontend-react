import { useEffect, useState } from 'react';
import { getAllDishes, createDish, updateDish, deleteDish } from '@/services/admin';
import type { Dish } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function DishesManagement() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'appetizer' | 'main' | 'drink'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main' as 'appetizer' | 'main' | 'drink',
    price: 0,
    image_url: '',
  });

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, categoryFilter, currentPage]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const data = await getAllDishes();
      setDishes(data);
    } catch (error: any) {
      console.error('Error fetching dishes:', error);
      toast.error('Error al cargar platos');
    } finally {
      setLoading(false);
    }
  };

  const filterDishes = () => {
    let filtered = dishes;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dish => dish.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setFilteredDishes(filtered.slice(startIndex, endIndex));
  };

  const getTotalPages = () => {
    let filtered = dishes;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dish => dish.category === categoryFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || formData.price <= 0) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      if (editingDish) {
        await updateDish(editingDish.id, formData);
        toast.success('Plato actualizado correctamente');
      } else {
        await createDish(formData);
        toast.success('Plato creado correctamente');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchDishes();
    } catch (error: any) {
      console.error('Error saving dish:', error);
      toast.error(error.response?.data?.message || 'Error al guardar plato');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plato?')) return;

    try {
      await deleteDish(id);
      toast.success('Plato eliminado correctamente');
      fetchDishes();
    } catch (error: any) {
      console.error('Error deleting dish:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar plato');
    }
  };

  const handleToggleActive = async (dish: Dish) => {
    try {
      await updateDish(dish.id, { is_active: !dish.is_active });
      toast.success(`Plato ${!dish.is_active ? 'activado' : 'desactivado'}`);
      fetchDishes();
    } catch (error: any) {
      console.error('Error toggling dish:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      category: dish.category,
      price: dish.price,
      image_url: dish.image_url || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      category: 'main',
      price: 0,
      image_url: '',
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      appetizer: 'bg-blue-500',
      main: 'bg-green-500',
      drink: 'bg-purple-500',
    };
    const labels = {
      appetizer: 'Entrada',
      main: 'Principal',
      drink: 'Bebida',
    };
    return <Badge className={colors[category as keyof typeof colors]}>{labels[category as keyof typeof labels]}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando platos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Platos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDish ? 'Editar Plato' : 'Nuevo Plato'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Lomo Saltado"
                />
              </div>
              <div>
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Entrada</SelectItem>
                    <SelectItem value="main">Plato Principal</SelectItem>
                    <SelectItem value="drink">Bebida</SelectItem>
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
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del plato..."
                  rows={3}
                />
              </div>
              <div>
                <Label>URL de Imagen</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {editingDish ? 'Actualizar' : 'Crear'} Plato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setCategoryFilter('all');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={categoryFilter === 'appetizer' ? 'default' : 'outline'}
            onClick={() => {
              setCategoryFilter('appetizer');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Entradas
          </Button>
          <Button
            variant={categoryFilter === 'main' ? 'default' : 'outline'}
            onClick={() => {
              setCategoryFilter('main');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Principales
          </Button>
          <Button
            variant={categoryFilter === 'drink' ? 'default' : 'outline'}
            onClick={() => {
              setCategoryFilter('drink');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Bebidas
          </Button>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className={!dish.is_active ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{dish.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getCategoryBadge(dish.category)}
                    <Badge variant={dish.is_active ? 'default' : 'secondary'}>
                      {dish.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <p className="text-xl font-bold text-primary">S/ {typeof dish.price === 'string' ? parseFloat(dish.price).toFixed(2) : dish.price.toFixed(2)}</p>
              </div>
            </CardHeader>
            <CardContent>
              {dish.image_url && (
                <img src={dish.image_url} alt={dish.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              {dish.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{dish.description}</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(dish)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(dish)}>
                  {dish.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(dish.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {getTotalPages() > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {getTotalPages()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
            disabled={currentPage >= getTotalPages()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {filteredDishes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron platos con los filtros seleccionados
        </div>
      )}
    </div>
  );
}