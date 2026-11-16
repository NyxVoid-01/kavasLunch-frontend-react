import api from '@/lib/api';
import type { PaymentMethod, PaymentRequest, ProcessPaymentData } from '@/types';

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
 * Generar la solicitud de pago de Yape/Plin o tarjeta (vence a los 3 minutos)
 * POST /api/user/payment/request
 */
export const requestPayment = async (reservationId: string, method: PaymentRequest['method']): Promise<PaymentRequest> => {
  const response = await api.post('/api/user/payment/request', { reservation_id: reservationId, payment_method: method });
  return response.data.data.payment_request;
};

/**
 * Confirmar el pago de una reserva (pasarela simulada)
 * POST /api/user/payment/process
 */
export const processPayment = async (data: ProcessPaymentData): Promise<ProcessPaymentResponse> => {
  const response = await api.post('/api/user/payment/process', data);
  return response.data.data;
};
