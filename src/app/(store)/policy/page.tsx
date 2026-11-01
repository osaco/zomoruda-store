import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RefreshCcw, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية والتوصيل",
  description: "سياسة الخصوصية، معلومات التوصيل، وسياسة الاستبدال والاسترجاع في متجر زُمُرّدة.",
  alternates: { canonical: "/policy" },
};

export default function PolicyPage() {
  return (
    <>
      <PageHeader
        title="سياسة الخصوصية والتوصيل"
        description="كل ما تحتاجين معرفته حول خصوصية بياناتك وتوصيل طلباتك"
      />
      <div className="container-page max-w-3xl space-y-6 py-8">
        {/* القسم الأول: سياسة الخصوصية */}
        <section className="card space-y-3 p-6" aria-labelledby="privacy-heading">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="privacy-heading" className="font-heading text-lg font-bold text-ink">
              سياسة الخصوصية
            </h2>
          </div>
          <p className="text-sm leading-7 text-ink/80">
            نحن في متجر زُمُرّدة نلتزم بحماية خصوصية بياناتك ومعاملاتها بسرية تامة. البيانات التي نقوم بجمعها تشمل:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink/80">
            <li><strong>الاسم الكامل ورقم الجوال:</strong> للتواصل معكِ وتأكيد تفاصيل الطلب وتسليمه.</li>
            <li><strong>تاريخ الميلاد (اختياري):</strong> لمفاجأتك بهدايا وعروض حصرية في يوم ميلادك.</li>
            <li><strong>العنوان وتفاصيل التوصيل:</strong> لإيصال الطلب بأمان وسرعة إلى باب بيتك.</li>
            <li><strong>صور إيصال التحويل وصور الهدايا المخصصة:</strong> للتحقق من عمليات الدفع البنكي وطباعة صورك الخاصة بجودة عالية.</li>
          </ul>
          <p className="text-xs text-muted">
            لا نشارك بياناتكِ مع أي طرف ثالث لأغراض إعلانية إطلاقاً.
          </p>
        </section>

        {/* القسم الثاني: سياسة التوصيل */}
        <section className="card space-y-3 p-6" aria-labelledby="delivery-heading">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="delivery-heading" className="font-heading text-lg font-bold text-ink">
              سياسة التوصيل
            </h2>
          </div>
          <p className="text-sm leading-7 text-ink/80">
            نوفر خدمة التوصيل لمختلف مناطق قطاع غزة وفق الآتي:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink/80">
            <li><strong>مناطق التغطية:</strong> مدينة غزة، الشمال، الوسطى، خانيونس ورفح حسب الظروف المتاحة.</li>
            <li><strong>رسوم التوصيل:</strong> تُحدد رسوم التوصيل تلقائياً حسب المنطقة المختارة أثناء إتمام الطلب وتُضاف إلى الإجمالي.</li>
            <li><strong>الحد الأدنى للطلب:</strong> قد تتطلب بعض المناطق حداً أدنى للطلب لتأكيد التوصيل، ويظهر ذلك بوضوح في ملخص السلة.</li>
            <li><strong>الاستلام من المحل:</strong> يمكنك دائماً اختيار الاستلام المجاني المباشر من متجرنا في غزة - الرمال.</li>
          </ul>
        </section>

        {/* القسم الثالث: الاستبدال والاسترجاع */}
        <section className="card space-y-3 p-6" aria-labelledby="returns-heading">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="returns-heading" className="font-heading text-lg font-bold text-ink">
              الاستبدال والاسترجاع
            </h2>
          </div>
          <p className="text-sm leading-7 text-ink/80">
            حرصاً على رضاكم وتقديم أفضل تجربة:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink/80">
            <li><strong>الهدايا والمنتجات العامة:</strong> يمكن طلب استبدالها خلال 24 ساعة من الاستلام بشرط أن تكون بحالتها وتغليفها الأصلي.</li>
            <li><strong>المنتجات المخصصة:</strong> المنتجات التي تحمل اسماً أو صورة شخصية أو رسالة كرت مخصصة لا يمكن استرجاعها إلا في حال وجود خطأ في التنفيذ من طرفنا.</li>
            <li><strong>الورد والشوكولاتة:</strong> نظراً لطبيعتها الحساسة، نرجو معاينتها عند الاستلام فوراً.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
