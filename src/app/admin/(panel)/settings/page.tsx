import { isDemo } from "@/lib/env";
import { site } from "@/lib/site";
import { requireAdmin } from "@/features/auth/session";
import { AdminPageTitle, Checkbox, Field, inputCls } from "@/features/admin/components/ui";
import { getStoreSettings } from "@/features/settings/server/queries";
import { saveSettings } from "@/features/settings/server/actions";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ whatsapp?: string }> }) {
  await requireAdmin("admin");
  const [s, { whatsapp }] = await Promise.all([getStoreSettings(), searchParams]);
  return (
    <>
      <AdminPageTitle title="الإعدادات" />
      {whatsapp === "saved" && <p role="status" className="mb-3 text-success">تم حفظ الإعدادات.</p>}
      {whatsapp === "invalid" && <p role="alert" className="mb-3 text-danger">أدخلي رقم واتساب صحيحًا مع رمز الدولة.</p>}
      <form action={saveSettings} className="card max-w-2xl space-y-4 p-5">
        <Field label="رقم واتساب لاستقبال الطلبات" hint="أدخلي الرقم مع رمز الدولة، مثل ‎+970567812644">
          <input name="orderWhatsappNumber" type="tel" dir="ltr" required defaultValue={`+${s.orderWhatsappNumber}`} className={inputCls} />
        </Field>
        <Checkbox name="ordersPaused" label="إيقاف استقبال الطلبات مؤقتاً" defaultChecked={s.ordersPaused} />
        <Field label="رسالة إيقاف الطلبات"><input name="ordersPausedMessage" defaultValue={s.ordersPausedMessage} className={inputCls} /></Field>
        <Field label="شريط الإعلان أعلى المتجر" hint="اتركيه فارغاً لإخفائه"><input name="announcement" defaultValue={s.announcement} className={inputCls} /></Field>
        <Field label="تفاصيل التحويل البنكي / المحفظة"><textarea name="bankDetails" rows={3} defaultValue={s.bankDetails} className={inputCls} /></Field>
        <button className="btn-primary !py-2">حفظ الإعدادات</button>
      </form>
      <section className="card mt-6 max-w-2xl space-y-1 p-5 text-sm">
        <h2 className="mb-2 font-heading font-bold">معلومات المتجر</h2>
        <p>إنستغرام: @{site.instagram}</p>
        <p>العنوان: {site.addressAr}</p>
        <p>قاعدة البيانات: {isDemo ? "وضع تجريبي (بدون Supabase)" : "Supabase"}</p>
      </section>
    </>
  );
}
