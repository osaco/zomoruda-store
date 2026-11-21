"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Category, Occasion, Product } from "@/types/db";
import { AVAILABILITY_LABELS_AR, AVAILABILITY_VALUES } from "@/types/enums";
import { Checkbox, Field, inputCls } from "@/features/admin/components/ui";
import { uploadProductImage } from "@/features/uploads/client";
import { saveProduct, type ProductFormState } from "../server/actions";
import { ProductOptionsEditor } from "./ProductOptionsEditor";

export function ProductForm({ product, categories, occasions, fillings }: { fillings: { id: string; nameAr: string }[]; product?: Product; categories: Category[]; occasions: Occasion[] }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [images, setImages] = useState(product?.images.map((i) => i.url) ?? []);
  const [isBox, setIsBox] = useState(product?.isGiftBox ?? false);
  const [selectedOnly, setSelectedOnly] = useState(product?.giftBoxProductIds != null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const isMainImage = images.length === 0;
      const url = await uploadProductImage(file, isMainImage ? "main" : "gallery");
      setImages((v) => [...v, url]);
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
        <input type="hidden" name="images" value={images.join("\n")} />
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <Image src={url} alt={`${product?.nameAr ?? "صورة المنتج"} ${index + 1}`} width={240} height={240} unoptimized className="aspect-square w-full rounded-xl border border-primary/10 bg-primary-light object-contain p-1" />
                <button type="button" onClick={() => setImages((current) => current.filter((_, i) => i !== index))} aria-label="حذف الصورة" className="absolute end-1 top-1 rounded-full bg-white p-1 text-danger shadow"><X className="h-4 w-4" /></button>
                {index === 0 && <span className="absolute bottom-1 start-1 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] text-white">رئيسية</span>}
              </div>
            ))}
          </div>
        )}
        <label className="btn-secondary w-fit cursor-pointer !py-2 text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} إرفاق صورة
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" disabled={uploading} className="sr-only" onChange={(e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            if (file) void upload(file).finally(() => { input.value = ""; });
          }} />
        </label>
        {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
        <ProductOptionsEditor initial={product?.options ?? []} />
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
          <Checkbox name="nameRequired" label="الاسم إلزامي" defaultChecked={product?.nameRequired} />
          <Field label="رسوم إضافة الاسم ₪"><input name="namePrice" type="number" min={0} step="0.5" defaultValue={product?.namePrice ?? 0} className={inputCls} /></Field>
          <Checkbox name="allowCardMessage" label="يسمح برسالة كرت" defaultChecked={product?.allowCardMessage} />
          <Checkbox name="cardMessageRequired" label="رسالة الكرت إلزامية" defaultChecked={product?.cardMessageRequired} />
          <Field label="رسوم بطاقة الإهداء ₪"><input name="cardMessagePrice" type="number" min={0} step="0.5" defaultValue={product?.cardMessagePrice ?? 0} className={inputCls} /></Field>
          <Checkbox name="allowPhotoUpload" label="يسمح بطباعة صورة يرفعها الزبون" defaultChecked={product?.allowPhotoUpload} />
          <Checkbox name="photoRequired" label="صورة الطباعة إلزامية" defaultChecked={product?.photoRequired} />
          <Field label="رسوم طباعة الصورة ₪"><input name="photoPrice" type="number" min={0} step="0.5" defaultValue={product?.photoPrice ?? 0} className={inputCls} /></Field>
          <label><input type="checkbox" name="isGiftBox" checked={isBox} onChange={event => setIsBox(event.target.checked)} /> هذا المنتج بوكس هدية</label>
          {isBox && <fieldset className="space-y-2"><legend>الإضافات المتاحة داخل هذا البوكس</legend>
            <select name="boxContentsMode" className={inputCls} value={selectedOnly ? "selected" : "all"} onChange={event => setSelectedOnly(event.target.value === "selected")}>
              <option value="all">كل المنتجات المسموح بإضافتها للبوكسات</option><option value="selected">أختار منتجات لهذا البوكس</option>
            </select>
            {selectedOnly && fillings.filter(item => item.id !== product?.id).map(item => <label className="block" key={item.id}><input type="checkbox" name="giftBoxProductIds" value={item.id} defaultChecked={product?.giftBoxProductIds?.includes(item.id)} /> {item.nameAr}</label>)}
            {selectedOnly && !fillings.length && <p>فعّلي «يمكن إضافته داخل بوكس هدية» على المنتجات المراد عرضها هنا.</p>}
          </fieldset>}
          <Field label="سعة البوكس (عدد القطع)"><input name="giftBoxCapacity" type="number" min={1} max={100} defaultValue={product?.giftBoxCapacity ?? ""} className={inputCls} /></Field>
          <Checkbox name="allowInGiftBox" label="يمكن إضافته داخل بوكس هدية" defaultChecked={product?.allowInGiftBox} />
        </div>
        {state.error && <p role="alert" className="rounded-input bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} حفظ المنتج</button>
      </div>
    </form>
  );
}
