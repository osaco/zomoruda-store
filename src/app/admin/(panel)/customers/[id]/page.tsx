import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getRepos } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { toInternational } from "@/lib/phone";
import { AdminPageTitle, Field, inputCls, Table, Td } from "@/features/admin/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { SEGMENT_LABELS_AR, segmentOf } from "@/features/crm/lib/segments";
import { updateCustomer } from "@/features/crm/server/actions";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repos = getRepos();
  const customer = await repos.customers.getById(id);
  if (!customer) notFound();
  const orders = await repos.orders.list({ customerPhone: customer.phone, perPage: 50 });

  return (
    <>
      <AdminPageTitle title={customer.name} />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="card space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-muted">الطلبات: </span><strong>{customer.ordersCount}</strong></p>
            <p><span className="text-muted">المشتريات: </span><strong>{formatPrice(customer.totalSpent)}</strong></p>
            <p><span className="text-muted">الفئة: </span>{SEGMENT_LABELS_AR[segmentOf(customer)]}</p>
            <p dir="ltr" className="text-end">{customer.phone}</p>
          </div>
          <a href={`https://wa.me/${toInternational(customer.phone)}`} target="_blank" rel="noopener noreferrer" className="btn w-full bg-emerald !py-2 text-white"><MessageCircle className="h-4 w-4" /> واتساب</a>
          <form action={updateCustomer} className="space-y-3">
            <input type="hidden" name="id" value={customer.id} />
            <Field label="الاسم"><input name="name" defaultValue={customer.name} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="عيد الميلاد"><input type="date" name="birthday" defaultValue={customer.birthday ?? ""} className={inputCls} /></Field>
              <Field label="ذكرى الزواج"><input type="date" name="anniversary" defaultValue={customer.anniversary ?? ""} className={inputCls} /></Field>
            </div>
            <Field label="ملاحظات"><textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} className={inputCls} /></Field>
            <button className="btn-primary w-full !py-2">حفظ</button>
          </form>
        </section>
        <section>
          <h2 className="mb-3 font-heading font-bold">سجل الطلبات</h2>
          <Table head={["الرقم", "الإجمالي", "الحالة", "التاريخ"]} empty={orders.items.length === 0}>
            {orders.items.map((o) => (
              <tr key={o.id}>
                <Td><Link href={`/admin/orders/${o.id}`} className="font-bold text-primary" dir="ltr">{o.orderNumber}</Link></Td>
                <Td>{formatPrice(o.total)}</Td>
                <Td><OrderStatusBadge status={o.status} /></Td>
                <Td className="text-muted">{formatDate(o.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        </section>
      </div>
    </>
  );
}
