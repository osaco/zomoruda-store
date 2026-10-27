---
name: admin-crm-dashboard
description: Mobile-first Arabic admin dashboard with orders, products, and a light CRM. Use for anything under /admin.
---
# Admin + CRM
- Overview: today's orders, revenue day/week/month, new orders, low stock, best sellers.
- Orders: status tabs (new, confirmed, preparing, out_for_delivery, delivered, cancelled), search by number/phone, one-tap status change logged in order_status_history, printable invoice, WhatsApp-customer button. Poll every 30s; sound + Notification API on new order.
- Products: CRUD from phone, multi-image upload + reorder, options, customization flags, occasions, stock, toggles, duplicate.
- CRUD: categories, occasions, banners, delivery zones, coupons.
- Customers (CRM): search, profile with order history, total spent, notes, birthday, anniversary; filter "مناسبات خلال 7 أيام" with WhatsApp button.
- Reports: sales by day chart (recharts), top products, top zones, CSV export.
- Settings: WhatsApp number, hours, bank details, pause orders, social links.
- Roles: staff = orders + products; admin = everything.
