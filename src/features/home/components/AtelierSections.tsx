import Link from "next/link";
import { site, whatsappLink, defaultWhatsappMessage } from "@/lib/site";
import { SpreadWordmark } from "./SpreadWordmark";

export function AtelierHero() {
  return (
    <section id="atelier-hero" className="atelier-hero" aria-labelledby="atelier-hero-title">
      <div className="atelier-wrap atelier-hero-content">
        <div className="atelier-hero-copy">
          <p className="atelier-kicker" dir="ltr">ATELIER ZOMORUDA // GAZA — AL-RIMAL</p>
          <h1 id="atelier-hero-title">
            هديةٌ تُصاغُ <em>على مهل.</em>
          </h1>
          <p className="atelier-copy atelier-hero-lede">
            بوكسات هدايا، زهور، وعطور نرتّبها بعناية لتصل إلى من تحبّينها بلمسة تشبهها.
          </p>
          <div className="atelier-hero-actions">
            <Link className="atelier-button atelier-button-primary" href="/search">تصفّحي التشكيلة <span aria-hidden="true">↖</span></Link>
            <a className="atelier-button" href={whatsappLink(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer">اسألي عبر واتساب</a>
          </div>
        </div>

        <div className="atelier-hero-specs" aria-label="معلومات المتجر">
          <div><span className="atelier-kicker">LOCATION</span><span>غزة — الرمال</span></div>
          <div><span className="atelier-kicker">OPEN</span><span dir="ltr">{site.hoursCode}</span></div>
          <div><span className="atelier-kicker">MADE FOR</span><span>لحظاتك الخاصة</span></div>
        </div>
      </div>

      <SpreadWordmark />
      <span className="atelier-hero-index atelier-kicker" dir="ltr">01 — 06</span>
    </section>
  );
}

export function AtelierCraftArgument() {
  const rows = [
    { code: "01 / THE WRAP", title: "تغليف مرتب بعناية", value: "حسب اختيارك" },
    { code: "02 / THE FLOWER", title: "تنسيق يليق بالمناسبة", value: "حسب التشكيلة" },
    { code: "03 / THE NOTE", title: "كلماتك ترافق الهدية", value: "إضافة اختيارية" },
  ];

  return (
    <section id="craft" className="atelier-section atelier-craft" aria-labelledby="craft-heading">
      <div className="atelier-wrap atelier-two-col">
        <div className="atelier-section-intro">
          <p className="atelier-kicker">02 / A THOUGHTFUL GESTURE</p>
          <h2 id="craft-heading">الهدية ليست شيئاً،<br /><em>بل طريقة وصول.</em></h2>
          <p className="atelier-copy">نختار تفاصيلها معك، ونرتّبها لتصل جاهزة للمشاركة. أنتِ تختارين المناسبة والرسالة؛ ونحن نهتمّ بأن تبدو الهدية على قدرها.</p>
        </div>
        <div className="atelier-ruled-list">
          {rows.map((row) => (
            <div className="atelier-ruled-row" key={row.code}>
              <span className="atelier-kicker atelier-row-code">{row.code}</span>
              <span className="atelier-row-title">{row.title}</span>
              <span className="atelier-row-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AtelierMaterials() {
  const items = [
    { number: "01", title: "اختيار القطعة", body: "ابدئي من المناسبة أو من الشيء الذي تعرفين أنها ستحبّه." },
    { number: "02", title: "لمسة الترتيب", body: "اختاري طريقة التقديم المتاحة، وأضيفي بطاقة بكلماتك إن رغبتِ." },
    { number: "03", title: "موعد الوصول", body: "تواصلي معنا لتأكيد التوفّر وتفاصيل الاستلام أو التوصيل." },
  ];

  return (
    <section id="materials" className="atelier-section atelier-materials" aria-labelledby="materials-heading">
      <div className="atelier-wrap atelier-two-col">
        <div className="atelier-section-intro">
          <p className="atelier-kicker">04 / THE DETAILS THAT MATTER</p>
          <h2 id="materials-heading">من أول اختيار،<br /><em>إلى آخر عقدة.</em></h2>
          <p className="atelier-copy">تبدئين بما يعبّر عن الشخص، ثم تضيفين التفاصيل التي تجعلها هديته هو.</p>
        </div>
        <div className="atelier-material-list">
          {items.map((item) => (
            <article className="atelier-material-row" key={item.number}>
              <span className="atelier-kicker">{item.number} / THE PROCESS</span>
              <h3>{item.title}</h3>
              <p className="atelier-copy">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
      <BotanicalLine />
    </section>
  );
}

function BotanicalLine() {
  return (
    <svg className="atelier-botanical" viewBox="0 0 640 150" aria-hidden="true" focusable="false">
      <path d="M14 128c127-3 192-32 270-78 74-44 155-42 217-8 50 28 88 30 125 20M184 84c-4-33-31-47-49-34-14 11-3 32 19 37 12 3 22 2 30-3Zm32-18c7-31 34-42 50-26 13 13-1 33-22 35-11 1-21-2-28-9Zm119-27c2 34 22 55 53 57-3-28-21-50-53-57Zm12 10c16-28 43-32 55-14 9 13-5 29-25 29-12 0-22-5-30-15Zm94 13c-3 32 13 54 43 63 2-29-12-50-43-63Zm9 10c18-23 43-23 52-5 6 13-8 27-27 24-11-2-20-8-25-19Z" fill="none" stroke="var(--atelier-purple)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AtelierMeasurements() {
  const rows = [
    { label: "مقاس الصندوق", description: "تختلف الأبعاد بحسب القطعة المختارة.", value: "بحسب المنتج" },
    { label: "عدد سيقان الباقة", description: "يتبع التنسيق والتشكيلة المتاحة.", value: "بحسب الباقة" },
    { label: "وزن ورق البطاقة", description: "تُؤكّد المواصفة عند تحديد نوع البطاقة.", value: "عند الطلب" },
    { label: "تفاصيل ختم الإهداء", description: "تُحدّد وفق التصميم المتاح للقطعة.", value: "حسب التصميم" },
  ];

  return (
    <section id="measurements" className="atelier-section atelier-measurements" aria-labelledby="measurements-heading">
      <div className="atelier-wrap">
        <div className="atelier-section-head atelier-measure-head">
          <div>
            <p className="atelier-kicker">05 / THE SPECIFICATIONS</p>
            <h2 id="measurements-heading">التفاصيل الدقيقة، <em>قبل الاختيار.</em></h2>
          </div>
          <p className="atelier-copy">الأبعاد والأوزان تختلف باختلاف القطعة؛ نؤكد المواصفات الفعلية عند تأكيد الطلب.</p>
        </div>
        <div className="atelier-measure-list">
          {rows.map((row, index) => (
            <div className="atelier-measure-row" key={row.label}>
              <span className="atelier-kicker">{String(index + 1).padStart(2, "0")} / {index === 0 ? "BOX" : index === 1 ? "BOTANICALS" : index === 2 ? "PAPER" : "SEAL"}</span>
              <span className="atelier-measure-label">{row.label}</span>
              <span className="atelier-measure-description">{row.description}</span>
              <span className="atelier-measure-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AtelierFooter() {
  return (
    <footer className="atelier-footer">
      <section className="atelier-close atelier-wrap" aria-labelledby="close-heading">
        <div className="atelier-close-copy">
          <p className="atelier-kicker">06 / A NOTE FROM THE ATELIER</p>
          <h2 id="close-heading">ما الذي <em>تودّين قوله؟</em></h2>
          <p className="atelier-copy">اختاري هديتك، واتركي لنا ترتيب التفاصيل معك.</p>
        </div>
        <div className="atelier-close-actions">
          <Link className="atelier-button atelier-button-primary" href="/search">اكتشفي الهدايا <span aria-hidden="true">↖</span></Link>
          <a className="atelier-button" href={whatsappLink(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer">تواصلي عبر واتساب</a>
        </div>
      </section>
      <div className="atelier-wrap atelier-footer-meta">
        <span dir="ltr">GAZA — AL-RIMAL // {site.hoursCode}</span>
        <span>{site.addressAr}</span>
      </div>
      <SpreadWordmark motion={false} />
      <div className="atelier-wrap atelier-footer-bottom">
        <span>© {new Date().getFullYear()} {site.nameAr} — جميع الحقوق محفوظة</span>
        <Link href="/policy">سياسة المتجر</Link>
      </div>
    </footer>
  );
}
