import { getPaymentGatewayConfig } from './config';
import {
  PaymentProvider,
  PaymentInitParams,
  PaymentInitResult,
  PaymentVerifyResult,
} from './types';

class DefaultPaymentProvider implements PaymentProvider {
  name = 'GenericPaymentGateway';

  isConfigured(): boolean {
    const config = getPaymentGatewayConfig();
    return config.isConfigured;
  }

  async createPayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Online card payment gateway is currently not configured.',
      };
    }
    // Future Gateway API call implementation goes here
    return {
      success: false,
      error: `Payment initialization for order ${params.orderNumber} is pending gateway connection.`,
    };
  }

  async verifyPayment(orderId: string): Promise<PaymentVerifyResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'PENDING',
        error: 'Payment gateway configuration missing.',
      };
    }
    return {
      success: false,
      status: 'PENDING',
      error: `Verification for order ${orderId} is pending gateway response.`,
    };
  }

  async handleWebhook(body?: unknown): Promise<PaymentVerifyResult> {
    if (body) {
      // Future Webhook body handling logic
    }
    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'PENDING',
        error: 'Payment gateway webhook unconfigured.',
      };
    }
    return {
      success: false,
      status: 'PENDING',
      error: 'Unprocessed webhook payload.',
    };
  }
}

export const paymentProvider: PaymentProvider = new DefaultPaymentProvider();
