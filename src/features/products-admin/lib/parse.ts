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
  allowCardMessage: bool,
  allowPhotoUpload: bool,
  images: z.string().default(""),
  options: z.string().default(""),
  occasionIds: z.array(z.string()).default([]),
});

export function toProductInput(form: FormData): { ok: true; data: ProductInput } | { ok: false; error: string } {
  const raw = Object.fromEntries([...form.entries()].filter(([k]) => k !== "occasionIds"));
  const parsed = productFormSchema.safeParse({ ...raw, occasionIds: form.getAll("occasionIds").map(String) });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  const v = parsed.data;
  return {
    ok: true,
    data: {
      ...v,
      slug: slugify(v.slug || v.nameAr),
      images: v.images.split("\n").map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u)).map((url) => ({ url, altAr: v.nameAr })),
      options: parseOptions(v.options),
    },
  };
}
