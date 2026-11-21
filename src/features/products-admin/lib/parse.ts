import { z } from "zod";
import { AVAILABILITY_VALUES } from "@/types/enums";
import type { ProductInput } from "@/lib/data/repositories";

/**
 * Options are edited as text, one option per line:
 *   الحجم*: وسط=0، كبير=30
 * "*" marks a required option. Values are separated by "،" or ",".
 */
export function parseOptions(text: string): ProductInput["options"] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName, rawValues = ""] = line.split(/[:：]/);
      const isRequired = rawName.trim().endsWith("*");
      const nameAr = rawName.replace("*", "").trim();
      const values = rawValues
        .split(/[,،]/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => {
          const [valueAr, delta] = v.split("=");
          return { valueAr: valueAr.trim(), priceDelta: Number(delta) || 0 };
        });
      return { nameAr, values, isRequired };
    })
    .filter((o) => o.nameAr && o.values.length);
}

export function formatOptions(options: ProductInput["options"]): string {
  return options.map((o) => `${o.nameAr}${o.isRequired ? "*" : ""}: ${o.values.map((v) => `${v.valueAr}=${v.priceDelta}`).join("، ")}`).join("\n");
}

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const money = z.coerce.number().min(0).max(100000);
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const productFormSchema = z.object({
  nameAr: z.string().trim().min(2, "الاسم مطلوب"),
  slug: z.string().trim().optional(),
  descriptionAr: z.string().trim().default(""),
  price: money,
  compareAtPrice: z.preprocess((v) => (v === "" || v === null ? null : v), money.nullable()),
  categoryId: z.string().min(1, "اختاري القسم"),
  stockQty: z.coerce.number().int().min(0).default(0),
  availability: z.enum(AVAILABILITY_VALUES),
  isFeatured: bool,
  isNew: bool,
  isActive: bool,
  allowName: bool,
  nameRequired: bool,
  namePrice: money.default(0),
  allowCardMessage: bool,
  cardMessageRequired: bool,
  cardMessagePrice: money.default(0),
  allowPhotoUpload: bool,
  photoRequired: bool,
  photoPrice: money.default(0),
  isGiftBox: bool,
  giftBoxCapacity: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().int().min(1).max(100).nullable()),
  allowInGiftBox: bool,
  images: z.string().default(""),
  options: z.string().default(""),
  occasionIds: z.array(z.string()).default([]),
});

export function toProductInput(form: FormData): { ok: true; data: ProductInput } | { ok: false; error: string } {
  const raw = Object.fromEntries([...form.entries()].filter(([k]) => k !== "occasionIds"));
  const parsed = productFormSchema.safeParse({ ...raw, occasionIds: form.getAll("occasionIds").map(String) });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  const v = parsed.data;
  let options = parseOptions(v.options);
  if (form.has("optionGroups")) {
    const schema = z.array(z.object({
      nameAr: z.string().trim().min(1), isRequired: z.boolean(),
      values: z.array(z.object({ valueAr: z.string().trim().min(1), priceDelta: z.number().finite().min(-100000).max(100000) })).min(1),
    }));
    try {
      options = schema.parse(JSON.parse(String(form.get("optionGroups"))));
    } catch {
      return { ok: false, error: "أكملي اسم كل خيار وقيمه وأسعارها" };
    }
  }
  if (new Set(options.map(option => option.nameAr)).size !== options.length ||
      options.some(option => new Set(option.values.map(value => value.valueAr)).size !== option.values.length))
    return { ok: false, error: "يجب أن تكون أسماء الخيارات والقيم داخل كل خيار مميزة" };
  if (v.nameRequired && !v.allowName) return { ok: false, error: "فعّلي خيار الاسم قبل جعله مطلوباً" };
  if (v.cardMessageRequired && !v.allowCardMessage) return { ok: false, error: "فعّلي خيار بطاقة الإهداء قبل جعلها مطلوبة" };
  if (v.photoRequired && !v.allowPhotoUpload) return { ok: false, error: "فعّلي خيار طباعة الصورة قبل جعلها مطلوبة" };
  if (v.isGiftBox && !v.giftBoxCapacity) return { ok: false, error: "حددي سعة بوكس الهدايا" };
  if (v.isGiftBox && v.allowInGiftBox) return { ok: false, error: "لا يمكن إضافة بوكس هدية داخل بوكس آخر" };
  if (v.isGiftBox && form.get("boxContentsMode") === "selected" && !form.getAll("giftBoxProductIds").length)
    return { ok: false, error: "اختاري إضافة واحدة على الأقل لهذا البوكس" };
  return {
    ok: true,
    data: {
      ...v,
      availability: v.availability === "in_stock" && v.stockQty === 0 ? "out_of_stock" : v.availability,
      giftBoxProductIds: v.isGiftBox && form.get("boxContentsMode") === "selected"
        ? [...new Set(form.getAll("giftBoxProductIds").map(String))]
        : null,
      giftBoxCapacity: v.isGiftBox ? v.giftBoxCapacity : null,
      slug: slugify(v.slug || v.nameAr),
      images: v.images.split("\n").map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u)).map((url) => ({ url, altAr: v.nameAr })),
      options,
    },
  };
}
