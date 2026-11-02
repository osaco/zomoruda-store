import Link from "next/link";
import { Cake, MessageCircle } from "lucide-react";
import { getRepos } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { toInternational } from "@/lib/phone";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { AdminPageTitle, inputCls, Table, Td } from "@/features/admin/components/ui";
import { SEGMENT_LABELS_AR, segmentOf, upcomingDates } from "@/features/crm/lib/segments";

export const metadata = { title: "الزبائن" };

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const repos = getRepos();
  const [result, all] = await Promise.all([
    repos.customers.list({ search: sp.q, page: Number(sp.page) || 1 }),
    repos.customers.list({ perPage: 5000 }),
  ]);
  const upcoming = upcomingDates(all.items, 30);

  return (
    <>
      <AdminPageTitle title="الزبائن" />
      {upcoming.length > 0 && (
        <section className="card mb-6 p-5">
          <h2 className="mb-3 flex items-center gap-2 font-heading font-bold"><Cake className="h-5 w-5 text-accent" /> مناسبات خلال 30 يوم</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {upcoming.map(({ customer, kind, inDays }) => (
              <li key={`${customer.id}-${kind}`} className="flex items-center justify-between rounded-input bg-primary-light/40 px-3 py-2 text-sm">
                <span><Link href={`/admin/customers/${customer.id}`} className="font-bold">{customer.name}</Link> — {kind === "birthday" ? "عيد ميلاد" : "ذكرى زواج"} {inDays === 0 ? "اليوم 🎉" : `بعد ${inDays} يوم`}</span>
                <a
                  href={`https://wa.me/${toInternational(customer.phone)}?text=${encodeURIComponent(`مرحباً ${customer.name} 💜 مناسبتك قرّبت! جهّزنا لك هدايا مميزة في زُمُرّدة 🎁`)}`}
                  target="_blank" rel="noopener noreferrer" aria-label="مراسلة" className="text-emerald"><MessageCircle className="h-5 w-5" /></a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={sp.q} placeholder="بحث بالاسم أو الجوال" className={inputCls} /><button className="btn-secondary !py-2">بحث</button></form>
      <Table head={["الاسم", "الجوال", "الطلبات", "إجمالي المشتريات", "الفئة"]} empty={result.items.length === 0}>
        {result.items.map((c) => {
          const seg = segmentOf(c);
          return (
            <tr key={c.id} className="hover:bg-primary-light/30">
              <Td><Link href={`/admin/customers/${c.id}`} className="font-bold text-primary">{c.name}</Link></Td>
              <Td dir="ltr" className="text-end">{c.phone}</Td>
              <Td>{c.ordersCount}</Td>
              <Td className="font-bold">{formatPrice(c.totalSpent)}</Td>
              <Td><Badge variant={seg === "vip" ? "gold" : seg === "loyal" ? "neutral" : "success"}>{SEGMENT_LABELS_AR[seg]}</Badge></Td>
            </tr>
          );
        })}
      </Table>
      <Pagination page={result.page} pageCount={result.pageCount} basePath="/admin/customers" params={{ q: sp.q }} />
    </>
  );
}
