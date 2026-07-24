export function getPaymentGatewayConfig() {
  const apiKey = process.env.PAYMENT_GATEWAY_API_KEY || '';
  const secret = process.env.PAYMENT_GATEWAY_SECRET || '';
  const merchantId = process.env.PAYMENT_GATEWAY_MERCHANT_ID || '';

  return {
    apiKey,
    secret,
    merchantId,
    isConfigured: Boolean(apiKey && secret && merchantId),
  };
}
