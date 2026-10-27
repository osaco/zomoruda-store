import "server-only";
import { getRepos } from "@/lib/data";
import { normalizePsPhone } from "@/lib/phone";

/** Public tracking: an order is only revealed when number AND phone match. */
export async function findOrderForTracking(orderNumber: string, phone: string) {
  const normalized = normalizePsPhone(phone);
  if (!normalized) return null;
  const order = await getRepos().orders.getByNumber(orderNumber);
  return order && order.customerPhone === normalized ? order : null;
}
