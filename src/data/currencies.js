export const currencies = [
  {
    code: 'GEL',
    label: 'GEL',
    symbol: '₾',
    rateFromGel: 1,
    decimals: 0,
  },
  {
    code: 'USD',
    label: 'USD',
    symbol: '$',
    rateFromGel: 0.37,
    decimals: 2,
  },
  {
    code: 'EUR',
    label: 'EUR',
    symbol: '€',
    rateFromGel: 0.315,
    decimals: 2,
  },
];

export const defaultCurrencyCode = 'GEL';

export function formatPrice(priceGEL, currencyCode) {
  const currency = currencies.find((item) => item.code === currencyCode) || currencies[0];
  const converted = priceGEL * currency.rateFromGel;
  const amount = converted.toFixed(currency.decimals);

  return currency.code === 'GEL' ? `${amount} ${currency.symbol}` : `${currency.symbol}${amount}`;
}
