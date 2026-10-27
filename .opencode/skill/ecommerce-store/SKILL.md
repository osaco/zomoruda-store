---
name: ecommerce-store
description: Patterns for building a complete online store (catalog, product page, cart, checkout, orders). Use whenever working on storefront or order logic.
---
# E-commerce store rules
- Catalog: categories, occasions, products with images, options (price delta), stock, availability (in_stock / out_of_stock / made_to_order).
- Product cards: image, name, price, compare_at_price strikethrough, badges (جديد / خصم), add-to-cart.
- Cart: persisted in localStorage (zustand persist), editable qty/options, coupon, live totals.
- NEVER trust client prices: recompute subtotal, delivery fee, discount, total on the server from DB values.
- Orders get a human number (ZM-1001...), an items JSON snapshot (name, price, options, customizations at order time), and a status history table.
- Upsert customer by phone on every order; update orders_count and total_spent.
- Validate every input with zod; rate-limit order creation.
- Empty states, loading skeletons and Arabic error messages on every list/form.
- SEO: metadata per page, OG image per product, sitemap.xml, robots.txt.
