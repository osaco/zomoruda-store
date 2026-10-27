---
name: whatsapp-ordering
description: How orders are handed off to the shop's WhatsApp after being saved. Use for checkout.
---
# WhatsApp handoff
- Store number in settings (default +970567812644). Link: https://wa.me/970567812644?text=<encodeURIComponent(msg)>.
- Flow: validate -> server creates order (recomputed totals) -> returns order_number -> client opens wa.me link -> success page.
- Message (Arabic, line breaks with \n):
  طلب جديد #ZM-1042
  الاسم / الجوال / المنطقة / العنوان
  المنتجات: - اسم × الكمية (الخيارات) — السعر؛ الاسم على الهدية؛ نص البطاقة
  المجموع الفرعي، التوصيل، الخصم، الإجمالي ₪
  التسليم: توصيل/استلام — التاريخ والوقت
  الدفع: كاش عند الاستلام / تحويل (تم إرفاق الإيصال)
- Payment methods: cash on delivery, or bank/wallet transfer with receipt upload. No card payments.
- If settings.orders_paused, disable checkout and show a banner.
