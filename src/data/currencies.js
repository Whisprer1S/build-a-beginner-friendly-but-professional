export function formatPrice(priceGEL) {
  const amount = Number(priceGEL);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formattedAmount = Number.isInteger(safeAmount)
    ? String(safeAmount)
    : safeAmount.toFixed(2).replace(/\.?0+$/, '');

  return `${formattedAmount} GEL`;
}
