import { getRepos } from "@/lib/data";
import { getActiveSession } from "@/features/auth/session";
import { toCsv } from "@/features/reports/lib/analytics";
import { FULFILLMENT_LABELS_AR, ORDER_STATUS_LABELS_AR, PAYMENT_METHOD_LABELS_AR } from "@/types/enums";

export async function GET(request: Request) {
  const session = await getActiveSession();
  if (!session || session.role !== "admin") return new Response("غير مصرح", { status: 401 });
  const url = new URL(request.url);
  const repos = getRepos();
  const customerExport = url.searchParams.get("type") === "customers";
  const requested = Number(url.searchParams.get("days"));
  const days = Number.isFinite(requested) && requested > 0 ? Math.min(3650, Math.trunc(requested)) : 30;
  const to = new Date().toISOString();
  const from = new Date(Date.now() - days * 86_400_000).toISOString();
  const size = 500;
  async function* chunks() {
    yield toCsv([customerExport
      ? ["الاسم", "الجوال", "عدد الطلبات", "إجمالي المشتريات", "عيد الميلاد", "ذكرى الزواج", "ملاحظات"]
      : ["رقم الطلب", "التاريخ", "الزبون", "الجوال", "المنطقة", "الاستلام", "المنتجات", "المجموع", "التوصيل", "الخصم", "الإجمالي", "الدفع", "الحالة"]]);
    for (let page = 1; ; page++) {
      const rows = customerExport
        ? (await repos.customers.list({ page, perPage: size })).items.map(c => [c.name,c.phone,c.ordersCount,c.totalSpent,c.birthday,c.anniversary,c.notes])
        : (await repos.orders.all({ from,to }, { offset: (page-1)*size, size })).map(o => [o.orderNumber,o.createdAt,o.customerName,o.customerPhone,o.zoneNameAr,FULFILLMENT_LABELS_AR[o.fulfillment],o.items.map(i => `${i.nameAr}×${i.quantity}`).join(" | "),o.subtotal,o.deliveryFee,o.discount,o.total,PAYMENT_METHOD_LABELS_AR[o.paymentMethod],ORDER_STATUS_LABELS_AR[o.status]]);
      if (rows.length) yield "\r\n" + toCsv(rows).slice(1);
      if (rows.length < size) break;
    }
  }
  const iterator = chunks();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      const next = await iterator.next();
      if (next.done) controller.close();
      else controller.enqueue(encoder.encode(next.value));
    },
    async cancel() { await iterator.return(undefined); },
  });
  const name = customerExport ? "customers" : `orders-${days}d`;
  return new Response(stream, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="zomoruda-${name}.csv"` },
  });
}
