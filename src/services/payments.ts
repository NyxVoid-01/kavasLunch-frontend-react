import api from '@/lib/api';

// ============================================
// TIPOS PARA PAGOS
// ============================================

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  instructions?: string;
}

export interface ProcessPaymentData {
  reservation_id: string;
  payment_method: 'yape' | 'credit_card' | 'cash';
  payment_proof_url?: string; // Para Yape/Plin
  card_number?: string; // Para tarjeta
  card_expiry?: string; // Para tarjeta
  card_cvv?: string; // Para tarjeta
}

export interface ProcessPaymentResponse {
  reservation: {
    id: string;
    payment_status: string;
    payment_method: string;
  };
}

// ============================================
// ENDPOINTS DE PAGO
// ============================================

/**
 * Obtener métodos de pago disponibles
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/api/user/payment/methods');
  return response.data.data.methods;
};

/**
 * Procesar pago de una reserva
 */
export const processPayment = async (data: ProcessPaymentData): Promise<ProcessPaymentResponse> => {
  const response = await api.post('/api/user/payment/process', data);
  return response.data.data;
};
