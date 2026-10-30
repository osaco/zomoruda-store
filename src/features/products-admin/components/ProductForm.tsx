"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import type { Category, Occasion, Product } from "@/types/db";
import { AVAILABILITY_LABELS_AR, AVAILABILITY_VALUES } from "@/types/enums";
import { Checkbox, Field, inputCls } from "@/features/admin/components/ui";
import { MAX_UPLOAD_MB, uploadProductImage } from "@/features/uploads/client";
import { saveProduct, type ProductFormState } from "../server/actions";
import { formatOptions } from "../lib/parse";

export function ProductForm({ product, categories, occasions }: { product?: Product; categories: Category[]; occasions: Occasion[] }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [images, setImages] = useState(product?.images.map((i) => i.url).join("\n") ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadProductImage(file);
      setImages((v) => (v ? `${v}\n${url}` : url));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذّر الرفع");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="card space-y-4 p-5">
        <Field label="اسم المنتج"><input name="nameAr" required defaultValue={product?.nameAr} className={inputCls} /></Field>
        <Field label="الرابط (slug)" hint="يُولَّد تلقائياً من الاسم إذا تُرك فارغاً"><input name="slug" dir="ltr" defaultValue={product?.slug} className={inputCls} /></Field>
        <Field label="الوصف"><textarea name="descriptionAr" rows={4} defaultValue={product?.descriptionAr} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="السعر ₪"><input name="price" type="number" step="0.5" min={0} required defaultValue={product?.price} className={inputCls} /></Field>
          <Field label="السعر قبل الخصم ₪"><input name="compareAtPrice" type="number" step="0.5" min={0} defaultValue={product?.compareAtPrice ?? ""} className={inputCls} /></Field>
        </div>
        <Field label="الصور (رابط في كل سطر — الأول هو الرئيسي)">
          <textarea name="images" rows={4} dir="ltr" value={images} onChange={(e) => setImages(e.target.value)} className={inputCls} />
        </Field>
        <label className="btn-secondary w-fit cursor-pointer !py-2 text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} رفع صورة
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <p className="text-xs text-muted">الحد الأقصى لحجم الصورة {MAX_UPLOAD_MB} ميجابايت.</p>
        {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
        <Field label="الخيارات" hint="كل خيار في سطر: الحجم*: وسط=0، كبير=30  (* = إجباري، الرقم = فرق السعر)">
          <textarea name="options" rows={3} defaultValue={product ? formatOptions(product.options) : ""} className={inputCls} />
        </Field>
      </div>
      <div className="space-y-4">
        <div className="card space-y-4 p-5">
          <Field label="القسم">
            <select name="categoryId" defaultValue={product?.categoryId} required className={inputCls}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </Field>
          <Field label="التوفر">
            <select name="availability" defaultValue={product?.availability ?? "in_stock"} className={inputCls}>
              {AVAILABILITY_VALUES.map((a) => <option key={a} value={a}>{AVAILABILITY_LABELS_AR[a]}</option>)}
            </select>
          </Field>
          <Field label="الكمية في المخزون"><input name="stockQty" type="number" min={0} defaultValue={product?.stockQty ?? 10} className={inputCls} /></Field>
        </div>
        <div className="card space-y-2 p-5">
          <p className="text-sm font-bold">المناسبات</p>
          {occasions.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="occasionIds" value={o.id} defaultChecked={product?.occasionIds.includes(o.id)} className="accent-primary" /> {o.nameAr}
            </label>
          ))}
        </div>
        <div className="card space-y-2 p-5">
          <Checkbox name="isActive" label="ظاهر في المتجر" defaultChecked={product?.isActive ?? true} />
          <Checkbox name="isFeatured" label="مميز" defaultChecked={product?.isFeatured} />
          <Checkbox name="isNew" label="وصل حديثاً" defaultChecked={product?.isNew} />
          <Checkbox name="allowName" label="يسمح بكتابة اسم" defaultChecked={product?.allowName} />
          <Checkbox name="allowCardMessage" label="يسمح برسالة كرت" defaultChecked={product?.allowCardMessage} />
          <Checkbox name="allowPhotoUpload" label="يسمح برفع صورة" defaultChecked={product?.allowPhotoUpload} />
        </div>
        {state.error && <p role="alert" className="rounded-input bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} حفظ المنتج</button>
      </div>
    </form>
  );
}
