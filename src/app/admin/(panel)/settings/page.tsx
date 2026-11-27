import { isDemo } from "@/lib/env";
import { requireAdmin } from "@/features/auth/session";
import { AdminPageTitle, Checkbox, Field, inputCls } from "@/features/admin/components/ui";
import { getStoreSettings } from "@/features/settings/server/queries";
import { saveSettings } from "@/features/settings/server/actions";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ whatsapp?: string; contact?: string }> }) {
  await requireAdmin("admin");
  const [s, { whatsapp, contact }] = await Promise.all([getStoreSettings(), searchParams]);
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
        <fieldset id="contact" className="space-y-4 border-t border-primary/10 pt-4">
          <legend className="font-heading font-bold">تواصل معنا</legend>
          {contact === "invalid" && <p role="alert" className="text-danger">أدخلي اسم مستخدم إنستغرام ورابط خريطة يبدأ بـ https://.</p>}
          <Field label="اسم مستخدم إنستغرام"><input name="contactInstagram" dir="ltr" maxLength={30} defaultValue={s.contactInstagram} className={inputCls} /></Field>
          <Field label="عنوان المحل"><input name="contactAddress" maxLength={180} defaultValue={s.contactAddress} className={inputCls} /></Field>
          <Field label="أوقات العمل"><input name="contactHours" maxLength={180} defaultValue={s.contactHours} className={inputCls} /></Field>
          <Field label="رابط الخريطة"><input name="contactMapUrl" type="url" dir="ltr" maxLength={500} defaultValue={s.contactMapUrl} className={inputCls} /></Field>
        </fieldset>
        <button className="btn-primary !py-2">حفظ الإعدادات</button>
      </form>
      <section className="card mt-6 max-w-2xl space-y-1 p-5 text-sm">
        <h2 className="mb-2 font-heading font-bold">معلومات المتجر</h2>
        <p>قاعدة البيانات: {isDemo ? "وضع تجريبي (بدون Supabase)" : "Supabase"}</p>
      </section>
    </>
  );
}
