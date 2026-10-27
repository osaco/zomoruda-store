/**
 * Config-driven admin for simple tables (categories, occasions, banners,
 * zones, coupons). One schema per entity drives the table, the form,
 * validation and persistence — no copy-pasted CRUD pages.
 */
import { z } from "zod";
import { COUPON_TYPE_LABELS_AR, COUPON_TYPE_VALUES } from "@/types/enums";
import type { Repositories } from "@/lib/data/repositories";
import { slugify } from "@/features/products-admin/lib/parse";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "url" | "datetime" | "select";

export type EntityField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  inTable?: boolean;
};

const bool = z.preprocess((v) => v === "on" || v === true, z.boolean());
const optText = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().trim().nullable());
const optNum = z.preprocess((v) => (v === "" || v === undefined || v === null ? null : v), z.coerce.number().min(0).nullable());
const optDate = z.preprocess((v) => (v === "" || v === undefined ? null : new Date(String(v)).toISOString()), z.string().nullable());
const sort = z.coerce.number().int().default(0);

export const ENTITIES = {
  categories: {
    title: "الأقسام",
    repo: "categories",
    fields: [
      { name: "nameAr", label: "الاسم", type: "text", required: true, inTable: true },
      { name: "slug", label: "الرابط (slug)", type: "text", hint: "فارغ = تلقائي", inTable: true },
      { name: "descriptionAr", label: "الوصف", type: "textarea" },
      { name: "imageUrl", label: "رابط الصورة", type: "url" },
      { name: "sortOrder", label: "الترتيب", type: "number", inTable: true },
      { name: "isActive", label: "ظاهر", type: "checkbox", inTable: true },
    ],
    schema: z.object({ nameAr: z.string().trim().min(2), slug: z.string().trim().optional(), descriptionAr: optText, imageUrl: optText, sortOrder: sort, isActive: bool })
      .transform((v) => ({ ...v, slug: slugify(v.slug || v.nameAr) })),
  },
  occasions: {
    title: "المناسبات",
    repo: "occasions",
    fields: [
      { name: "nameAr", label: "الاسم", type: "text", required: true, inTable: true },
      { name: "slug", label: "الرابط (slug)", type: "text", inTable: true },
      { name: "icon", label: "الأيقونة", type: "select", options: ["cake", "graduation-cap", "heart", "flower", "baby"].map((v) => ({ value: v, label: v })) },
      { name: "sortOrder", label: "الترتيب", type: "number", inTable: true },
      { name: "isActive", label: "ظاهر", type: "checkbox", inTable: true },
    ],
    schema: z.object({ nameAr: z.string().trim().min(2), slug: z.string().trim().optional(), icon: optText, sortOrder: sort, isActive: bool })
      .transform((v) => ({ ...v, slug: slugify(v.slug || v.nameAr) })),
  },
  banners: {
    title: "البانرات",
    repo: "banners",
    fields: [
      { name: "titleAr", label: "العنوان", type: "text", required: true, inTable: true },
      { name: "subtitleAr", label: "النص الفرعي", type: "text" },
      { name: "imageUrl", label: "رابط الصورة (1200×500)", type: "url", required: true },
      { name: "linkUrl", label: "الرابط عند الضغط", type: "text", hint: "مثال: /categories/flowers", inTable: true },
      { name: "startsAt", label: "يبدأ", type: "datetime" },
      { name: "endsAt", label: "ينتهي", type: "datetime" },
      { name: "sortOrder", label: "الترتيب", type: "number", inTable: true },
      { name: "isActive", label: "فعّال", type: "checkbox", inTable: true },
    ],
    schema: z.object({ titleAr: z.string().trim().min(2), subtitleAr: optText, imageUrl: z.string().url(), linkUrl: optText, startsAt: optDate, endsAt: optDate, sortOrder: sort, isActive: bool }),
  },
  zones: {
    title: "مناطق التوصيل",
    repo: "zones",
    fields: [
      { name: "nameAr", label: "المنطقة", type: "text", required: true, inTable: true },
      { name: "fee", label: "رسوم التوصيل ₪", type: "number", required: true, inTable: true },
      { name: "minOrder", label: "أقل طلب ₪", type: "number", inTable: true },
      { name: "deliveryTimeAr", label: "مدة التوصيل", type: "text", inTable: true },
      { name: "sortOrder", label: "الترتيب", type: "number" },
      { name: "isActive", label: "فعّالة", type: "checkbox", inTable: true },
    ],
    schema: z.object({ nameAr: z.string().trim().min(2), fee: z.coerce.number().min(0), minOrder: optNum, deliveryTimeAr: z.string().trim().default(""), sortOrder: sort, isActive: bool }),
  },
  coupons: {
    title: "الكوبونات",
    repo: "coupons",
    fields: [
      { name: "code", label: "الكود", type: "text", required: true, inTable: true },
      { name: "type", label: "النوع", type: "select", options: COUPON_TYPE_VALUES.map((v) => ({ value: v, label: COUPON_TYPE_LABELS_AR[v] })), inTable: true },
      { name: "value", label: "القيمة", type: "number", required: true, inTable: true },
      { name: "minOrder", label: "أقل طلب ₪", type: "number" },
      { name: "maxDiscount", label: "أقصى خصم ₪", type: "number" },
      { name: "usageLimit", label: "عدد مرات الاستخدام", type: "number" },
      { name: "usedCount", label: "استُخدم", type: "number", inTable: true },
      { name: "startsAt", label: "يبدأ", type: "datetime" },
      { name: "endsAt", label: "ينتهي", type: "datetime", inTable: true },
      { name: "isActive", label: "فعّال", type: "checkbox", inTable: true },
    ],
    schema: z.object({
      code: z.string().trim().min(3).transform((v) => v.toUpperCase()),
      type: z.enum(COUPON_TYPE_VALUES),
      value: z.coerce.number().positive(),
      minOrder: optNum, maxDiscount: optNum, usageLimit: optNum,
      usedCount: z.coerce.number().int().min(0).default(0),
      startsAt: optDate, endsAt: optDate, isActive: bool,
    }).refine((v) => v.type !== "percent" || v.value <= 100, { message: "النسبة لا تتجاوز 100%" }),
  },
} satisfies Record<string, { title: string; repo: keyof Repositories; fields: EntityField[]; schema: z.ZodType }>;

export type EntityName = keyof typeof ENTITIES;
export const isEntityName = (v: string): v is EntityName => v in ENTITIES;
