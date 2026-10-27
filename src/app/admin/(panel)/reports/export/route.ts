import { getRepos } from "@/lib/data";
import { getSession } from "@/features/auth/session";
import { toCsv } from "@/features/reports/lib/analytics";
import { FULFILLMENT_LABELS_AR, ORDER_STATUS_LABELS_AR, PAYMENT_METHOD_LABELS_AR } from "@/types/enums";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new Response("غير مصرح", { status: 401 });
  const url = new URL(request.url);
  const repos = getRepos();
  let csv: string;
  let name: string;

  if (url.searchParams.get("type") === "customers") {
    const customers = (await repos.customers.list({ perPage: 100000 })).items;
    csv = toCsv([["الاسم", "الجوال", "عدد الطلبات", "إجمالي المشتريات", "عيد الميلاد", "ذكرى الزواج", "ملاحظات"], ...customers.map((c) => [c.name, c.phone, c.ordersCount, c.totalSpent, c.birthday, c.anniversary, c.notes])]);
    name = "customers";
  } else {
    const days = Number(url.searchParams.get("days")) || 30;
    const orders = await repos.orders.all({ from: new Date(Date.now() - days * 86_400_000).toISOString() });
    csv = toCsv([
      ["رقم الطلب", "التاريخ", "الزبون", "الجوال", "المنطقة", "الاستلام", "المنتجات", "المجموع", "التوصيل", "الخصم", "الإجمالي", "الدفع", "الحالة"],
      ...orders.map((o) => [o.orderNumber, o.createdAt, o.customerName, o.customerPhone, o.zoneNameAr, FULFILLMENT_LABELS_AR[o.fulfillment], o.items.map((i) => `${i.nameAr}×${i.quantity}`).join(" | "), o.subtotal, o.deliveryFee, o.discount, o.total, PAYMENT_METHOD_LABELS_AR[o.paymentMethod], ORDER_STATUS_LABELS_AR[o.status]]),
    ]);
    name = `orders-${days}d`;
  }
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="zomoruda-${name}.csv"` },
  });
}
