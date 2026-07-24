export type PaymentMethodType = 'COD' | 'CARD' | 'BANK_TRANSFER';

export type PaymentStatusType = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface PaymentInitParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customer: PaymentCustomerInfo;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentInitResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: PaymentStatusType;
  transactionId?: string;
  rawResponse?: unknown;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyPayment(orderId: string, transactionId?: string): Promise<PaymentVerifyResult>;
  handleWebhook(body?: unknown, signature?: string): Promise<PaymentVerifyResult>;
}
