import Link from "next/link";
import { getRepos } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS_AR, ORDER_STATUS_VALUES, PAYMENT_METHOD_LABELS_AR, type OrderStatus } from "@/types/enums";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { AdminPageTitle, inputCls, Table, Td } from "@/features/admin/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { unconfirmedOrderAgeLabel } from "@/features/orders/lib/order-retention";
import { toInternational } from "@/lib/phone";

export const metadata = { title: "الطلبات" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; archive?: string }> }) {
  const sp = await searchParams;
  const status = ORDER_STATUS_VALUES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const archive = sp.archive === "1";
  const result = await getRepos().orders.list({ status, search: sp.q, archive, page: Number(sp.page) || 1, perPage: 20 });

  return (
    <>
      <AdminPageTitle title="الطلبات" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={cn("rounded-full px-4 py-1.5 text-sm", !archive ? "bg-primary text-white" : "bg-surface shadow-soft")}>الطلبات الحالية</Link>
        <Link href="/admin/orders?archive=1" className={cn("rounded-full px-4 py-1.5 text-sm", archive ? "bg-primary text-white" : "bg-surface shadow-soft")}>الأرشيف (بعد شهرين)</Link>
        {!archive && [undefined, ...ORDER_STATUS_VALUES].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={cn("rounded-full px-4 py-1.5 text-sm", s === status ? "bg-primary text-white" : "bg-surface shadow-soft")}>
            {s ? ORDER_STATUS_LABELS_AR[s] : "كل الحالات"}
          </Link>
        ))}
      </div>
      {archive && <p className="mb-4 rounded-input bg-primary-light p-3 text-sm text-muted">يعرض الأرشيف الطلبات المسلّمة والملغاة الأقدم من 60 يوماً. تبقى محفوظة في قاعدة البيانات لاسترجاعها، لذلك الأرشفة تنظّم القائمة ولا تقلّل مساحة التخزين.</p>}
      <form className="mb-4 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        {archive && <input type="hidden" name="archive" value="1" />}
        <input name="q" defaultValue={sp.q} placeholder="بحث برقم الطلب، الاسم أو الجوال" className={inputCls} />
        <button className="btn-secondary !py-2">بحث</button>
      </form>
      {!archive && <p className="mb-4 text-xs text-muted">الطلبات الجديدة التي لا تُؤكَّد خلال 24 ساعة تُلغى تلقائياً مرة يومياً، مع إعادة المخزون والكوبون وبيانات CRM.</p>}
      <Table head={["الرقم", "الزبون", "الجوال", "المنطقة", "الإجمالي", "الدفع", "الحالة", "التاريخ"]} empty={result.items.length === 0}>
        {result.items.map((o) => (
          <tr key={o.id} className="hover:bg-primary-light/30">
            <Td><Link href={`/admin/orders/${o.id}`} className="font-bold text-primary" dir="ltr">{o.orderNumber}</Link></Td>
            <Td>{o.customerName}</Td>
            <Td dir="ltr" className="text-end"><a href={`https://wa.me/${toInternational(o.customerPhone)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-emerald/50 underline-offset-2">{o.customerPhone}</a></Td>
            <Td>{o.zoneNameAr ?? "استلام"}</Td>
            <Td className="font-bold">{formatPrice(o.total)}</Td>
            <Td className="text-xs">{PAYMENT_METHOD_LABELS_AR[o.paymentMethod]}</Td>
            <Td><OrderStatusBadge status={o.status} />{o.status === "new" && (() => {
              const ageLabel = unconfirmedOrderAgeLabel(o.createdAt);
              return ageLabel ? <p className="mt-1 text-xs font-semibold text-warning">{ageLabel}</p> : null;
            })()}</Td>
            <Td className="text-muted">{formatDate(o.createdAt, true)}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={result.page} pageCount={result.pageCount} basePath="/admin/orders" params={{ status, q: sp.q, archive: archive ? "1" : undefined }} />
    </>
  );
}
