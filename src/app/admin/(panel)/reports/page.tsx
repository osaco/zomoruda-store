import { Download } from "lucide-react";
import { getRepos } from "@/lib/data";
import { daysAgoIso } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS_AR, ORDER_STATUS_VALUES } from "@/types/enums";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/features/auth/session";
import { AdminPageTitle, StatCard, Table, Td } from "@/features/admin/components/ui";
import { SalesChart } from "@/features/reports/components/SalesChart";
import { summarizeSales } from "@/features/reports/lib/analytics";
import { Banknote, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "التقارير" };
const RANGES = [7, 30, 90, 365];

export default async function Reports({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin("admin");
  const requested = Number((await searchParams).days);
  const days = RANGES.includes(requested) ? requested : 30;
  const orders = await getRepos().orders.all({ from: daysAgoIso(days) });
  const s = summarizeSales(orders, days);

  return (
    <>
      <AdminPageTitle title="التقارير" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <Link key={r} href={`/admin/reports?days=${r}`} className={cn("rounded-full px-4 py-1.5 text-sm", r === days ? "bg-primary text-white" : "bg-surface shadow-soft")}>آخر {r} يوم</Link>
        ))}
        { }
        <a href={`/admin/reports/export?type=orders&days=${days}`} className="btn-secondary ms-auto !py-2 text-sm"><Download className="h-4 w-4" /> الطلبات CSV</a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download */}
        <a href="/admin/reports/export?type=customers" className="btn-secondary !py-2 text-sm"><Download className="h-4 w-4" /> الزبائن CSV</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="المبيعات" value={formatPrice(s.revenue)} icon={Banknote} />
        <StatCard label="الطلبات" value={String(s.orders)} icon={ShoppingCart} />
        <StatCard label="متوسط الطلب" value={formatPrice(s.averageOrder)} icon={TrendingUp} />
      </div>
      <section className="card mt-6 p-5"><SalesChart data={s.byDay} /></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-heading font-bold">الأكثر مبيعاً</h2>
          <Table head={["المنتج", "الكمية", "الإيراد"]} empty={s.topProducts.length === 0}>
            {s.topProducts.map((p) => <tr key={p.productId}><Td>{p.nameAr}</Td><Td>{p.quantity}</Td><Td className="font-bold">{formatPrice(p.revenue)}</Td></tr>)}
          </Table>
        </section>
        <section>
          <h2 className="mb-3 font-heading font-bold">الطلبات حسب الحالة</h2>
          <Table head={["الحالة", "العدد"]}>
            {ORDER_STATUS_VALUES.map((st) => <tr key={st}><Td>{ORDER_STATUS_LABELS_AR[st]}</Td><Td>{s.byStatus[st]}</Td></tr>)}
          </Table>
        </section>
      </div>
    </>
  );
}
