// ============================================================
// KL Lanka Natural (PVT) LTD — Currency & Pricing System
// ============================================================

export type CurrencyCode = 'USD' | 'LKR' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number;         // Conversion rate from base USD (e.g. 1 USD = X LKR)
  position: 'prefix' | 'suffix';
  decimalPlaces: number;
}

// Configured currencies: USD is base, other conversion rates are ready.
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, position: 'prefix', decimalPlaces: 2 },
  LKR: { code: 'LKR', symbol: 'Rs. ', rate: 300.0, position: 'prefix', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, position: 'prefix', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, position: 'prefix', decimalPlaces: 2 },
};

// Base active currency for the app (currently strict USD)
export const ACTIVE_CURRENCY: CurrencyCode = 'USD';

/**
 * Format a base price (assumed in USD) to the active currency.
 * Ready to support dynamic multi-currency display by changing ACTIVE_CURRENCY.
 */
export function formatPrice(priceUSD: number, targetCurrency: CurrencyCode = ACTIVE_CURRENCY): string {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const convertedPrice = priceUSD * config.rate;
  const formattedValue = convertedPrice.toFixed(config.decimalPlaces);

  return config.position === 'prefix'
    ? `${config.symbol}${formattedValue}`
    : `${formattedValue}${config.symbol}`;
}

/**
 * Convert USD amount to target currency raw number.
 */
export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  return amountUSD * config.rate;
}
