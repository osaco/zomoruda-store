import Link from "next/link";
import { Banknote, Clock, ShoppingCart, TrendingUp } from "lucide-react";
import { getRepos } from "@/lib/data";
import { daysAgoIso } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { AdminPageTitle, StatCard, Table, Td } from "@/features/admin/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { SalesChart } from "@/features/reports/components/SalesChart";
import { summarizeSales } from "@/features/reports/lib/analytics";

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const repos = getRepos();
  const since = daysAgoIso(30);
  const [orders, latest, products] = await Promise.all([
    repos.orders.all({ from: since }),
    repos.orders.list({ perPage: 8 }),
    repos.products.list({ perPage: 200, includeInactive: true }),
  ]);
  const summary = summarizeSales(orders, 30);
  const lowStock = products.items.filter((p) => p.availability === "in_stock" && p.stockQty <= 5);
  const pending = summary.byStatus.new + summary.byStatus.confirmed + summary.byStatus.preparing;

  return (
    <>
      {denied && <p className="mb-4 rounded-input bg-warning/15 p-3 text-sm">هذه الصفحة للمدير فقط.</p>}
      <AdminPageTitle title="نظرة عامة" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="مبيعات آخر 30 يوم" value={formatPrice(summary.revenue)} icon={Banknote} />
        <StatCard label="عدد الطلبات" value={String(summary.orders)} icon={ShoppingCart} />
        <StatCard label="متوسط الطلب" value={formatPrice(summary.averageOrder)} icon={TrendingUp} />
        <StatCard label="بانتظار التنفيذ" value={String(pending)} icon={Clock} hint={`${summary.byStatus.new} جديد`} />
      </div>
      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-heading font-bold">المبيعات اليومية</h2>
        <SalesChart data={summary.byDay} />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <div className="mb-3 flex justify-between"><h2 className="font-heading font-bold">أحدث الطلبات</h2><Link href="/admin/orders" className="text-sm text-primary">الكل</Link></div>
          <Table head={["الرقم", "الزبون", "الإجمالي", "الحالة", "التاريخ"]} empty={latest.items.length === 0}>
            {latest.items.map((o) => (
              <tr key={o.id} className="hover:bg-primary-light/30">
                <Td><Link href={`/admin/orders/${o.id}`} className="font-bold text-primary" dir="ltr">{o.orderNumber}</Link></Td>
                <Td>{o.customerName}</Td>
                <Td>{formatPrice(o.total)}</Td>
                <Td><OrderStatusBadge status={o.status} /></Td>
                <Td className="text-muted">{formatDate(o.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-heading font-bold">مخزون منخفض</h2>
          {lowStock.length === 0 ? <p className="text-sm text-muted">كل المنتجات متوفرة بكمية جيدة ✓</p> : (
            <ul className="space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between"><Link href={`/admin/products/${p.id}`} className="hover:text-primary">{p.nameAr}</Link><span className="font-bold text-danger">{p.stockQty}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
