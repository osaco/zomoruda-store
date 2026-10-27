import Link from "next/link";
import { getRepos } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS_AR, ORDER_STATUS_VALUES, PAYMENT_METHOD_LABELS_AR, type OrderStatus } from "@/types/enums";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { AdminPageTitle, inputCls, Table, Td } from "@/features/admin/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";

export const metadata = { title: "الطلبات" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = ORDER_STATUS_VALUES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const result = await getRepos().orders.list({ status, search: sp.q, page: Number(sp.page) || 1, perPage: 20 });

  return (
    <>
      <AdminPageTitle title="الطلبات" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUS_VALUES].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={cn("rounded-full px-4 py-1.5 text-sm", s === status ? "bg-primary text-white" : "bg-surface shadow-soft")}>
            {s ? ORDER_STATUS_LABELS_AR[s] : "الكل"}
          </Link>
        ))}
      </div>
      <form className="mb-4 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={sp.q} placeholder="بحث برقم الطلب، الاسم أو الجوال" className={inputCls} />
        <button className="btn-secondary !py-2">بحث</button>
      </form>
      <Table head={["الرقم", "الزبون", "الجوال", "المنطقة", "الإجمالي", "الدفع", "الحالة", "التاريخ"]} empty={result.items.length === 0}>
        {result.items.map((o) => (
          <tr key={o.id} className="hover:bg-primary-light/30">
            <Td><Link href={`/admin/orders/${o.id}`} className="font-bold text-primary" dir="ltr">{o.orderNumber}</Link></Td>
            <Td>{o.customerName}</Td>
            <Td dir="ltr" className="text-end">{o.customerPhone}</Td>
            <Td>{o.zoneNameAr ?? "استلام"}</Td>
            <Td className="font-bold">{formatPrice(o.total)}</Td>
            <Td className="text-xs">{PAYMENT_METHOD_LABELS_AR[o.paymentMethod]}</Td>
            <Td><OrderStatusBadge status={o.status} /></Td>
            <Td className="text-muted">{formatDate(o.createdAt, true)}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={result.page} pageCount={result.pageCount} basePath="/admin/orders" params={{ status, q: sp.q }} />
    </>
  );
}
