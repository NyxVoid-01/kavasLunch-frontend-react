import api from '@/lib/api';
import type { PaymentMethod, ProcessPaymentData } from '@/types';

export interface ProcessPaymentResponse {
  reservation: {
    id: string;
    payment_status: 'pending' | 'paid' | 'failed';
    payment_method: string;
  };
}

/**
 * Obtener métodos de pago disponibles
 * GET /api/user/payment/methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/api/user/payment/methods');
  return response.data.data.methods;
};

/**
 * Procesar el pago de una reserva (pasarela simulada)
 * POST /api/user/payment/process
 */
export const processPayment = async (data: ProcessPaymentData): Promise<ProcessPaymentResponse> => {
  const response = await api.post('/api/user/payment/process', data);
  return response.data.data;
};
