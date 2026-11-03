export const MAX_UNCONFIRMED_ORDERS_PER_PHONE = 2;

export function canPlaceUnconfirmedOrder(currentCount: number): boolean {
  return Number.isInteger(currentCount) && currentCount >= 0 && currentCount < MAX_UNCONFIRMED_ORDERS_PER_PHONE;
}
