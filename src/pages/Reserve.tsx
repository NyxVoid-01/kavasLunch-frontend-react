import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserMenuById } from '@/services/menus';
import { createReservation, getAvailableSlots } from '@/services/reservations';
import { getPaymentMethods, processPayment } from '@/services/payments';
import type { DailyMenu, TimeSlot, PaymentMethod, Reservation } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationSuccessModal from '@/components/ReservationSuccessModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreditCard, Smartphone, Banknote, Check, ArrowLeft, Clock, Receipt } from 'lucide-react';

export default function Reserve() {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMenu();
    fetchPaymentMethods();
  }, [menuId, user]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const methods = await getPaymentMethods();
      
      if (methods && Array.isArray(methods)) {
        setPaymentMethods(methods);
        
        // Seleccionar el primer método habilitado por defecto
        const firstEnabled = methods.find(m => m.enabled);
        if (firstEnabled) {
          setPaymentMethod(firstEnabled.id);
        }
      } else {
        // Si no hay métodos o no es un array, usar fallback vacío
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Si falla, usar array vacío para que el fallback hardcodeado se muestre
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      if (!menuId) {
        toast.error('ID de menú inválido');
        navigate('/menus/user');
        return;
      }

      const menuData = await getUserMenuById(menuId);
      setMenu(menuData);

      // Formatear fecha a YYYY-MM-DD para el backend
      const dateStr = menuData.date.split('T')[0]; // Por si viene con timestamp
      
      // Obtener slots disponibles para la fecha del menú
      try {
        const slots = await getAvailableSlots(menuId, dateStr);
        
        if (slots && Array.isArray(slots) && slots.length > 0) {
          setTimeSlots(slots);
          
          // Seleccionar el primer slot disponible
          const firstAvailable = slots.find(s => s.available);
          if (firstAvailable) {
            setTimeSlot(firstAvailable.value);
          } else if (slots.length > 0) {
            // Si ninguno está disponible pero hay slots, seleccionar el primero
            setTimeSlot(slots[0].value);
          }
        } else {
          // Si no hay slots, crear slots por defecto
          throw new Error('No hay slots disponibles');
        }
      } catch (slotsError) {
        console.error('Error loading time slots:', slotsError);
        // Si falla, crear slots por defecto
        const defaultSlots: TimeSlot[] = [
          { value: '11:00-12:00', label: '11:00 - 12:00', available: true },
          { value: '12:00-13:00', label: '12:00 - 13:00', available: true },
          { value: '13:00-14:00', label: '13:00 - 14:00', available: true },
        ];
        setTimeSlots(defaultSlots);
        setTimeSlot(defaultSlots[0].value);
      }
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      toast.error('Error al cargar el menú');
      navigate('/menus/user');
    } finally {
      setLoading(false);
    }
  };

const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu || !user) return;

    if (!timeSlot) {
      toast.error('Por favor selecciona un horario de recojo');
      return;
    }

    try {
      setSubmitting(true);

      // Formatear fecha a YYYY-MM-DD
      const dateStr = menu.date.split('T')[0];

      const reservationData = {
        menu_id: menu.id,
        reservation_date: dateStr,
        payment_method: paymentMethod,
      };

      // Paso 1: Crear la reserva
      toast.loading('Creando tu reserva...', { id: 'reservation-process' });
      const reservation = await createReservation(reservationData);
      
      toast.success('¡Reserva creada!', { 
        id: 'reservation-process',
        description: 'Procesando pago...',
        duration: 2000,
      });

      // Paso 2: Procesar el pago
      try {
        const paymentData: any = {
          reservation_id: reservation.id,
          payment_method: paymentMethod,
        };

        await processPayment(paymentData);

        // Actualizar estado de pago en la reserva local
        const updatedReservation = {
          ...reservation,
          payment_status: 'paid' as const,
        };

        setCreatedReservation(updatedReservation);
        setShowSuccessModal(true);

        toast.success('¡Todo listo!', {
          description: '✉️ Correo de confirmación enviado',
          duration: 4000,
        });
      } catch (paymentError: any) {
        console.error('Error processing payment:', paymentError);
        
        // Aunque falle el pago, mostrar la reserva creada
        setCreatedReservation(reservation);
        setShowSuccessModal(true);
        
        toast.warning('Reserva creada - Pago pendiente', {
          description: 'Completa el pago desde Mis Reservas',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      
      toast.dismiss('reservation-process');
      
      // Mostrar errores de validación si existen
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        const errorMsg = error.response?.data?.message || 'Error al procesar la reserva';
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Esperar un momento antes de redirigir para que se vea la animación de cierre
    setTimeout(() => {
      navigate('/reservations');
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex items-center justify-center py-20 flex-grow">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!menu) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
        <Button
          variant="ghost"
          onClick={() => navigate('/menus/user')}
          className="mb-6 text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Menús
        </Button>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Menu Details - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border-b-2 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl text-primary">Detalles del Menú</CardTitle>
                </div>
                <CardDescription className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {(() => {
                    try {
                      const dateStr = menu.date.split('T')[0];
                      return format(new Date(dateStr), "EEEE, d 'de' MMMM", { locale: es });
                    } catch (e) {
                      return menu.date;
                    }
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Main Dish Hero Image */}
                {menu.main_dish?.image_url && (
                  <div className="relative overflow-hidden rounded-xl shadow-2xl border-2 border-primary/30">
                    <img 
                      src={menu.main_dish.image_url} 
                      alt={menu.main_dish.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                      <p className="text-white text-2xl font-bold">{menu.main_dish.name}</p>
                    </div>
                  </div>
                )}

                {/* Menu Items List */}
                <div className="space-y-3">
                  {menu.appetizer && (
                    <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                        <span className="text-2xl">🥗</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase mb-1">Entrada</p>
                        <p className="font-bold">{menu.appetizer.name}</p>
                        <p className="text-xs text-muted-foreground">{menu.appetizer.description}</p>
                      </div>
                    </div>
                  )}

                  {menu.main_dish && (
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase mb-1">Plato Principal</p>
                        <p className="font-bold">{menu.main_dish.name}</p>
                        <p className="text-xs text-muted-foreground">{menu.main_dish.description}</p>
                      </div>
                    </div>
                  )}

                  {menu.drink && (
                    <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                        <span className="text-2xl">🥤</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase mb-1">Bebida</p>
                        <p className="font-bold">{menu.drink.name}</p>
                        <p className="text-xs text-muted-foreground">{menu.drink.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t-2 border-dashed">
                  <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl">
                    <span className="text-xl font-semibold">Precio Total:</span>
                    <span className="text-4xl font-bold text-primary">S/ {typeof menu.price === 'number' ? menu.price.toFixed(2) : menu.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-accent/30 shadow-2xl sticky top-4">
              <CardHeader className="bg-gradient-to-br from-accent/10 to-primary/5 border-b-2 border-accent/20">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Check className="w-6 h-6" />
                  Confirmar Reserva
                </CardTitle>
                <CardDescription>Completa los detalles</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleReservation} className="space-y-6">
                  {/* Pickup Time */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horario de Recojo
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => slot.available && setTimeSlot(slot.value)}
                          disabled={!slot.available}
                          className={`
                            relative p-3 rounded-lg border-2 font-semibold text-sm transition-all
                            ${timeSlot === slot.value && slot.available
                              ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                              : slot.available
                                ? 'border-border bg-card hover:border-primary hover:bg-accent/10 hover:scale-105'
                                : 'border-muted bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{slot.label.split(' - ')[0]}</span>
                          </div>
                          {timeSlot === slot.value && slot.available && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          {!slot.available && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded">
                                No disp.
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Método de Pago
                    </Label>
                    {loadingPaymentMethods ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-3">
                          {paymentMethods.length > 0 ? (
                            paymentMethods.map((method) => (
                              <div 
                                key={method.id} 
                                className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors ${
                                  method.enabled 
                                    ? 'border-border hover:border-primary cursor-pointer bg-card hover:bg-accent/5' 
                                    : 'border-muted bg-muted/50 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <RadioGroupItem value={method.id} id={method.id} disabled={!method.enabled} />
                                <Label htmlFor={method.id} className={`flex items-center gap-3 flex-1 ${method.enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    {method.id === 'yape' && <Smartphone className="w-5 h-5 text-primary" />}
                                    {method.id === 'credit_card' && <CreditCard className="w-5 h-5 text-primary" />}
                                    {method.id === 'cash' && <Banknote className="w-5 h-5 text-primary" />}
                                  </div>
                                  <div>
                                    <p className="font-bold">{method.name}</p>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                  </div>
                                </Label>
                              </div>
                            ))
                          ) : (
                            // Fallback si no hay métodos del backend
                            <>
                              <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-card hover:bg-accent/5">
                                <RadioGroupItem value="yape" id="yape" />
                                <Label htmlFor="yape" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    <Smartphone className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-bold">Yape / Plin</p>
                                    <p className="text-xs text-muted-foreground">Pago móvil instantáneo</p>
                                  </div>
                                </Label>
                              </div>

                              <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-card hover:bg-accent/5">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-bold">Tarjeta</p>
                                    <p className="text-xs text-muted-foreground">Crédito/Débito</p>
                                  </div>
                                </Label>
                              </div>

                              <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-card hover:bg-accent/5">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    <Banknote className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-bold">Efectivo</p>
                                    <p className="text-xs text-muted-foreground">Pago en caja</p>
                                  </div>
                                </Label>
                              </div>
                            </>
                          )}
                        </div>
                      </RadioGroup>
                    )}
                  </div>

                  {/* Instrucciones específicas del método de pago */}
                  {paymentMethods?.find(m => m.id === paymentMethod)?.instructions && (
                    <div className="space-y-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <p className="text-sm font-bold">Instrucciones:</p>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.id === paymentMethod)?.instructions}
                      </p>
                    </div>
                  )}
                  
                  {/* Fallback para métodos hardcodeados si no hay instrucciones del backend */}
                  {!paymentMethods?.find(m => m.id === paymentMethod)?.instructions && paymentMethod === 'yape' && (
                    <div className="space-y-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <p className="text-sm font-bold">Número de Yape:</p>
                      <p className="text-2xl font-bold text-primary">987-654-321</p>
                      <p className="text-xs text-muted-foreground">Realiza la transferencia y confirma tu reserva</p>
                    </div>
                  )}

                  {!paymentMethods?.find(m => m.id === paymentMethod)?.instructions && paymentMethod === 'cash' && (
                    <div className="space-y-2 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <p className="text-sm font-bold text-primary">Pago en Caja del Comedor</p>
                      <p className="text-xs text-muted-foreground">
                        Pagarás al momento de recoger tu pedido
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-7 shadow-lg font-bold" 
                    disabled={submitting || menu.stock === 0}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirmar Reserva
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal de Confirmación */}
      {createdReservation && (
        <ReservationSuccessModal
          open={showSuccessModal}
          onClose={handleCloseSuccessModal}
          reservation={createdReservation}
          userEmail={user?.email || ''}
        />
      )}
      <Footer />
    </div>
  );
}