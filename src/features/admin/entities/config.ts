/**
 * Config-driven admin for simple tables (categories, occasions, banners,
 * zones, coupons). One schema per entity drives the table, the form,
 * validation and persistence — no copy-pasted CRUD pages.
 */
import { z } from "zod";
import { storeDateBoundary } from "@/lib/dates";
import type { Repositories } from "@/lib/data/repositories";
import { slugify } from "@/features/products-admin/lib/parse";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "url" | "datetime" | "date" | "select";

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
const blank = (value: unknown) => value === "" || value === undefined ? null : value;
const optDate = z.preprocess(blank, z.iso.datetime({ local: true }).nullable())
  .transform(value => value ? new Date(value.endsWith("Z") ? value : value + "Z").toISOString() : null);
const couponDate = (end = false) => z.preprocess(blank, z.iso.date().nullable())
  .transform(value => value ? storeDateBoundary(value, end) : null);
const sort = z.coerce.number().int().default(0);

export const ENTITIES = {
  categories: {
    title: "الأقسام",
    repo: "categories",
    fields: [
      { name: "nameAr", label: "الاسم", type: "text", required: true, inTable: true },
      { name: "descriptionAr", label: "الوصف", type: "textarea" },
      { name: "imageUrl", label: "صورة القسم", type: "url" },
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
      { name: "icon", label: "الأيقونة", type: "select", options: ["cake", "graduation-cap", "heart", "flower", "baby"].map((v) => ({ value: v, label: v })) },
      { name: "sortOrder", label: "الترتيب", type: "number", inTable: true },
      { name: "isActive", label: "ظاهر", type: "checkbox", inTable: true },
    ],
    schema: z.object({ nameAr: z.string().trim().min(2), slug: z.string().trim().optional(), icon: optText, sortOrder: sort, isActive: bool })
      .transform((v) => ({ ...v, slug: slugify(v.slug || v.nameAr) })),
  },
  banners: {
    title: "معرض الرئيسية",
    repo: "banners",
    fields: [
      { name: "titleAr", label: "العنوان", type: "text", required: true, inTable: true },
      { name: "subtitleAr", label: "النص الفرعي", type: "text" },
      { name: "imageUrl", label: "صورة البانر", type: "url", required: true },
      { name: "startsAt", label: "يبدأ", type: "datetime" },
      { name: "endsAt", label: "ينتهي", type: "datetime" },
      { name: "sortOrder", label: "الترتيب", type: "number", inTable: true },
      { name: "isActive", label: "فعّال", type: "checkbox", inTable: true },
    ],
    schema: z.object({ titleAr: z.string().trim().min(2), subtitleAr: optText, imageUrl: z.string().url(), startsAt: optDate, endsAt: optDate, sortOrder: sort, isActive: bool }),
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
      { name: "code", label: "كود الخصم", type: "text", required: true, inTable: true },
      { name: "value", label: "نسبة الخصم %", type: "number", required: true, inTable: true },
      { name: "usageLimit", label: "حد الاستخدام", type: "number", hint: "مثلاً 10 طلبات. اتركيه فارغاً إذا كان بلا حد.", inTable: true },
      { name: "startsAt", label: "من تاريخ", type: "date", inTable: true },
      { name: "endsAt", label: "إلى تاريخ", type: "date", hint: "الكوبون فعّال حتى نهاية هذا اليوم بتوقيت غزة.", inTable: true },
      { name: "isActive", label: "مفعّل", type: "checkbox", inTable: true },
    ],
    schema: z.object({
      code: z.string().trim().min(3).max(30).transform(value => value.toUpperCase()),
      value: z.preprocess(blank, z.coerce.number().positive().max(100)),
      usageLimit: z.preprocess(blank, z.coerce.number().int().min(1).max(2147483647).nullable()),
      startsAt: couponDate(),
      endsAt: couponDate(true),
      isActive: bool,
    }).refine(value => !value.startsAt || !value.endsAt || value.startsAt <= value.endsAt, {
      path: ["endsAt"], message: "تاريخ النهاية لازم يساوي تاريخ البداية أو يكون بعده.",
    }).transform(value => ({ ...value, type: "percent" as const, minOrder: null, maxDiscount: null })),
  },
} satisfies Record<string, { title: string; repo: keyof Repositories; fields: EntityField[]; schema: z.ZodType }>;

export type EntityName = keyof typeof ENTITIES;
export const isEntityName = (v: string): v is EntityName => v in ENTITIES;
