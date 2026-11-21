import "server-only";
import { getRepos } from "@/lib/data";

export async function giftBoxProducts(includeInactive = false, allowed?: string[] | null) {
  const products = getRepos().products;
  if (allowed) {
    const selected = [];
    for (let i = 0; i < allowed.length; i += 50) {
      selected.push(...await products.getManyByIds(allowed.slice(i, i + 50)));
    }
    return selected.filter(p => p.allowInGiftBox && !p.isGiftBox && (includeInactive || p.isActive));
  }
  const query = { giftBoxEligible: true, includeInactive, perPage: 100 };
  const first = await products.list(query);
  const items = first.items;
  for (let page = 2; page <= first.pageCount; page++) {
    items.push(...(await products.list({ ...query, page })).items);
  }
  return items.filter(product => !product.isGiftBox);
}
