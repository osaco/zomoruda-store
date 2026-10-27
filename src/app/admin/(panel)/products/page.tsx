import Image from "next/image";
import Link from "next/link";
import { getRepos } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { AVAILABILITY_LABELS_AR } from "@/types/enums";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { AdminPageTitle, inputCls, Table, Td } from "@/features/admin/components/ui";

export const metadata = { title: "المنتجات" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; saved?: string }> }) {
  const sp = await searchParams;
  const repos = getRepos();
  const [result, categories] = await Promise.all([
    repos.products.list({ search: sp.q, page: Number(sp.page) || 1, perPage: 20, includeInactive: true }),
    repos.categories.list({ includeInactive: true }),
  ]);
  const categoryName = new Map(categories.map((c) => [c.id, c.nameAr]));
  return (
    <>
      <AdminPageTitle title="المنتجات" action={{ href: "/admin/products/new", label: "+ منتج جديد" }} />
      {sp.saved && <p className="mb-4 rounded-input bg-success/10 p-3 text-sm text-success">تم الحفظ ✓</p>}
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={sp.q} placeholder="بحث بالاسم" className={inputCls} /><button className="btn-secondary !py-2">بحث</button></form>
      <Table head={["", "المنتج", "القسم", "السعر", "المخزون", "التوفر", "الحالة", "المبيعات"]} empty={result.items.length === 0}>
        {result.items.map((p) => (
          <tr key={p.id} className="hover:bg-primary-light/30">
            <Td>{p.images[0] && <Image src={p.images[0].url} alt="" width={40} height={40} className="rounded-lg" />}</Td>
            <Td><Link href={`/admin/products/${p.id}`} className="font-bold text-primary">{p.nameAr}</Link></Td>
            <Td>{categoryName.get(p.categoryId)}</Td>
            <Td>{formatPrice(p.price)}</Td>
            <Td className={p.stockQty <= 5 ? "font-bold text-danger" : ""}>{p.stockQty}</Td>
            <Td className="text-xs">{AVAILABILITY_LABELS_AR[p.availability]}</Td>
            <Td>{p.isActive ? <Badge variant="success">ظاهر</Badge> : <Badge variant="danger">مخفي</Badge>}</Td>
            <Td>{p.soldCount}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={result.page} pageCount={result.pageCount} basePath="/admin/products" params={{ q: sp.q }} />
    </>
  );
}
