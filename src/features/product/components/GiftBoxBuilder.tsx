"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/db";
import { AVAILABILITY_LABELS_AR } from "@/types/enums";
import { formatPrice } from "@/lib/format";
import { getProductStorefrontImage } from "@/lib/storefront-images";
import { useCart, type CartLine, type CartOption } from "@/features/cart/store";
import { CARD_MESSAGE_MAX, ITEM_NOTE_MAX } from "@/features/checkout/schemas";
import { PhotoUploadField } from "./PhotoUploadField";

type ProductChoice = {
  quantity: number;
  options: Record<string, string>;
  itemNote: string;
  customName: string;
  cardMessage: string;
  photoPath: string | null;
};

function initialChoice(product: Product): ProductChoice {
  return {
    quantity: 1,
    options: Object.fromEntries(product.options.filter((option) => option.isRequired && option.values[0]).map((option) => [option.nameAr, option.values[0].valueAr])),
    itemNote: "",
    customName: "",
    cardMessage: "",
    photoPath: null,
  };
}

function optionsFor(product: Product, selected: Record<string, string>): CartOption[] {
  return product.options.flatMap((option) => {
    const choice = option.values.find((value) => value.valueAr === selected[option.nameAr]);
    return choice ? [{ nameAr: option.nameAr, valueAr: choice.valueAr, priceDelta: choice.priceDelta }] : [];
  });
}

function customizationMissing(product: Product, choice: ProductChoice) {
  return product.options.some((option) => option.isRequired && !choice.options[option.nameAr]) ||
    (product.nameRequired && !choice.customName.trim()) ||
    (product.cardMessageRequired && !choice.cardMessage.trim()) ||
    (product.photoRequired && !choice.photoPath);
}

function priceFor(product: Product, choice: ProductChoice) {
  return product.price + optionsFor(product, choice.options).reduce((sum, option) => sum + option.priceDelta, 0) +
    (choice.customName.trim() ? product.namePrice : 0) +
    (choice.cardMessage.trim() ? product.cardMessagePrice : 0) +
    (choice.photoPath ? product.photoPrice : 0);
}

export function GiftBoxBuilder({ box, products, ordersPaused }: { box: Product; products: Product[]; ordersPaused: boolean }) {
  const addGiftBox = useCart((state) => state.addGiftBox);
  const [choices, setChoices] = useState<Record<string, ProductChoice>>({});
  const [boxOptions, setBoxOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(box.options.filter((option) => option.isRequired && option.values[0]).map((option) => [option.nameAr, option.values[0].valueAr])),
  );
  const [boxNote, setBoxNote] = useState("");
  const [boxName, setBoxName] = useState("");
  const [boxMessage, setBoxMessage] = useState("");
  const [boxPhoto, setBoxPhoto] = useState<string | null>(null);

  const selectedProducts = products.filter((product) => choices[product.id]);
  const selectedUnits = selectedProducts.reduce((sum, product) => sum + choices[product.id].quantity, 0);
  const capacity = box.giftBoxCapacity ?? 0;
  const boxSelectedOptions = optionsFor(box, boxOptions);
  const boxFees = (boxName.trim() ? box.namePrice : 0) + (boxMessage.trim() ? box.cardMessagePrice : 0) + (boxPhoto ? box.photoPrice : 0);
  const total = box.price + boxSelectedOptions.reduce((sum, option) => sum + option.priceDelta, 0) + boxFees +
    selectedProducts.reduce((sum, product) => sum + priceFor(product, choices[product.id]) * choices[product.id].quantity, 0);
  const soldOut = box.availability === "out_of_stock" || (box.availability === "in_stock" && box.stockQty < 1);
  const missingBoxFields = box.options.some((option) => option.isRequired && !boxOptions[option.nameAr]) ||
    (box.nameRequired && !boxName.trim()) || (box.cardMessageRequired && !boxMessage.trim()) || (box.photoRequired && !boxPhoto);
  const canAdd = !soldOut && !ordersPaused && selectedUnits > 0 && selectedUnits <= capacity && !missingBoxFields &&
    selectedProducts.every((product) => !customizationMissing(product, choices[product.id]));

  const setProductChoice = (product: Product, update: Partial<ProductChoice>) => {
    setChoices((current) => ({ ...current, [product.id]: { ...(current[product.id] ?? initialChoice(product)), ...update } }));
  };

  const parentLine: Omit<CartLine, "key" | "giftBoxKey" | "giftBoxId" | "giftBoxName" | "isGiftBox"> = {
    productId: box.id,
    slug: box.slug,
    nameAr: box.nameAr,
    imageUrl: getProductStorefrontImage(box).src,
    unitPrice: box.price,
    quantity: 1,
    giftBoxCapacity: capacity,
    options: boxSelectedOptions,
    itemNote: boxNote.trim() || null,
    customName: box.allowName ? boxName.trim() || null : null,
    nameFee: box.allowName && boxName.trim() ? box.namePrice : 0,
    cardMessage: box.allowCardMessage ? boxMessage.trim() || null : null,
    cardMessageFee: box.allowCardMessage && boxMessage.trim() ? box.cardMessagePrice : 0,
    photoPath: box.allowPhotoUpload ? boxPhoto : null,
    photoFee: box.allowPhotoUpload && boxPhoto ? box.photoPrice : 0,
  };

  const addToCart = () => {
    const contentLines = selectedProducts.map((product): Omit<CartLine, "key" | "giftBoxKey" | "giftBoxId" | "giftBoxName" | "isGiftBox"> => {
      const choice = choices[product.id];
      return {
        productId: product.id,
        slug: product.slug,
        nameAr: product.nameAr,
        imageUrl: getProductStorefrontImage(product).src,
        unitPrice: product.price,
        quantity: choice.quantity,
        giftBoxCapacity: null,
        options: optionsFor(product, choice.options),
        itemNote: choice.itemNote.trim() || null,
        customName: product.allowName ? choice.customName.trim() || null : null,
        nameFee: product.allowName && choice.customName.trim() ? product.namePrice : 0,
        cardMessage: product.allowCardMessage ? choice.cardMessage.trim() || null : null,
        cardMessageFee: product.allowCardMessage && choice.cardMessage.trim() ? product.cardMessagePrice : 0,
        photoPath: product.allowPhotoUpload ? choice.photoPath : null,
        photoFee: product.allowPhotoUpload && choice.photoPath ? product.photoPrice : 0,
      };
    });
    addGiftBox(parentLine, contentLines);
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <header>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">بوكس على ذوقك</p>
        <h1 className="font-heading text-2xl font-bold text-ink">{box.nameAr}</h1>
        <p className="mt-2 text-sm leading-7 text-muted">اختاري المنتجات التي تحبينها. سعر العلبة ومحتوياتها يظهران في الإجمالي.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold text-primary">سعر البوكس: {formatPrice(box.price)}</span>
          <span className="rounded-full bg-primary-light px-3 py-1">السعة {capacity} قطع</span>
          <span className={soldOut ? "text-danger" : "text-success"}>{soldOut ? "نفد من المخزون" : AVAILABILITY_LABELS_AR[box.availability]}</span>
        </div>
      </header>

      {box.options.map((option) => (
        <label key={option.id} className="block space-y-2 text-sm">
          <span className="font-bold">{option.nameAr}{option.isRequired ? " *" : ""}</span>
          <select value={boxOptions[option.nameAr] ?? ""} onChange={(event) => setBoxOptions((current) => ({ ...current, [option.nameAr]: event.target.value }))} className="field">
            {!option.isRequired && <option value="">اختياري</option>}
            {option.values.map((value) => <option key={value.valueAr} value={value.valueAr}>{value.valueAr}{value.priceDelta ? ` (+${formatPrice(value.priceDelta)})` : ""}</option>)}
          </select>
        </label>
      ))}

      {(box.allowName || box.allowCardMessage || box.allowPhotoUpload) && (
        <section className="card space-y-4 p-4">
          <h2 className="font-bold text-primary">تفاصيل البوكس</h2>
          {box.allowName && <label className="block space-y-1.5 text-sm">الاسم على الهدية{box.nameRequired ? " (مطلوب)" : " (اختياري)"}<input value={boxName} onChange={(event) => setBoxName(event.target.value)} maxLength={40} className="field" /></label>}
          {box.allowCardMessage && <label className="block space-y-1.5 text-sm">رسالة الكرت{box.cardMessageRequired ? " (مطلوبة)" : " (اختيارية)"}<textarea value={boxMessage} onChange={(event) => setBoxMessage(event.target.value)} maxLength={CARD_MESSAGE_MAX} rows={2} className="field" /></label>}
          {box.allowPhotoUpload && <PhotoUploadField label={`صورة الطباعة${box.photoRequired ? " (مطلوبة)" : " (اختيارية)"}`} kind="photo" value={boxPhoto} onChange={setBoxPhoto} />}
        </section>
      )}

      <label className="block space-y-1 text-sm">ملاحظات على البوكس (اختياري)<textarea value={boxNote} onChange={event => setBoxNote(event.target.value)} rows={2} maxLength={ITEM_NOTE_MAX} className="field" /></label>

      <section className="space-y-3" aria-labelledby="gift-box-products-heading">
        <div className="flex items-end justify-between gap-3">
          <div><h2 id="gift-box-products-heading" className="font-heading text-lg font-bold">اختاري محتويات البوكس</h2><p className="text-xs text-muted">يمكنك إضافة حتى {capacity} قطع</p></div>
          <span className="shrink-0 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">{selectedUnits} / {capacity}</span>
        </div>
        {products.length === 0 && <p className="text-muted">الإضافات لهذا البوكس غير متاحة حالياً.</p>}
        {products.map((product) => {
          const choice = choices[product.id];
          const selected = Boolean(choice);
          const stockLimit = product.availability === "in_stock" ? product.stockQty : capacity;
          const maxQuantity = Math.max(0, Math.min(stockLimit, capacity - selectedUnits + (choice?.quantity ?? 0)));
          const unavailable = product.availability === "out_of_stock" || (product.availability === "in_stock" && product.stockQty < 1);
          const image = getProductStorefrontImage(product);
          return (
            <article key={product.id} className={`card space-y-3 p-4 ${unavailable ? "opacity-60" : ""}`}>
              <div className="flex gap-3">
                <Image src={image.src} alt={product.nameAr} width={80} height={80} sizes="80px" className="h-20 w-20 shrink-0 rounded-xl bg-primary-light object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{product.nameAr}</h3>
                  <p className="mt-1 text-sm text-primary">{formatPrice(product.price)} للقطعة</p>
                  {unavailable && <p className="mt-1 text-xs text-danger">غير متوفر حالياً</p>}
                  {!selected ? (
                    <button type="button" disabled={unavailable || selectedUnits >= capacity} onClick={() => setProductChoice(product, {})} className="btn-secondary mt-2 min-h-10 !px-3 !py-1.5 text-xs"><Plus className="h-4 w-4" /> أضيفيه للبوكس</button>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" onClick={() => setChoices((current) => { const next = { ...current }; delete next[product.id]; return next; })} className="text-xs text-danger underline">إزالة</button>
                      <div className="flex items-center rounded-full border border-primary/15">
                        <button type="button" aria-label="زيادة الكمية" disabled={choice.quantity >= maxQuantity} onClick={() => setProductChoice(product, { quantity: Math.min(maxQuantity, choice.quantity + 1) })} className="tap p-1.5 text-primary disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-6 text-center text-sm font-bold">{choice.quantity}</span>
                        <button type="button" aria-label="إنقاص الكمية" onClick={() => choice.quantity <= 1 ? setChoices((current) => { const next = { ...current }; delete next[product.id]; return next; }) : setProductChoice(product, { quantity: choice.quantity - 1 })} className="tap p-1.5 text-primary"><Minus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selected && (
                <div className="space-y-3 border-t border-primary/10 pt-3">
                  {product.options.map((option) => (
                    <label key={option.id} className="block space-y-1 text-sm"><span className="font-medium">{option.nameAr}{option.isRequired ? " *" : ""}</span><select value={choice.options[option.nameAr] ?? ""} onChange={(event) => setProductChoice(product, { options: { ...choice.options, [option.nameAr]: event.target.value } })} className="field">{!option.isRequired && <option value="">اختياري</option>}{option.values.map((value) => <option key={value.valueAr} value={value.valueAr}>{value.valueAr}{value.priceDelta ? ` (+${formatPrice(value.priceDelta)})` : ""}</option>)}</select></label>
                  ))}
                  <label className="block space-y-1 text-sm">ملاحظات على القطعة (اختياري)<textarea value={choice.itemNote} onChange={event => setProductChoice(product, { itemNote: event.target.value })} rows={2} maxLength={ITEM_NOTE_MAX} className="field" /></label>
                  {product.allowName && <label className="block space-y-1 text-sm">الاسم على المنتج{product.nameRequired ? " (مطلوب)" : " (اختياري)"}<input value={choice.customName} onChange={(event) => setProductChoice(product, { customName: event.target.value })} maxLength={40} className="field" /></label>}
                  {product.allowCardMessage && <label className="block space-y-1 text-sm">رسالة الكرت{product.cardMessageRequired ? " (مطلوبة)" : " (اختيارية)"}<textarea value={choice.cardMessage} onChange={(event) => setProductChoice(product, { cardMessage: event.target.value })} maxLength={CARD_MESSAGE_MAX} rows={2} className="field" /></label>}
                  {product.allowPhotoUpload && <PhotoUploadField label={`صورة الطباعة${product.photoRequired ? " (مطلوبة)" : " (اختيارية)"}`} kind="photo" value={choice.photoPath} onChange={(photoPath) => setProductChoice(product, { photoPath })} />}
                  <p className="text-end text-sm font-bold text-primary">{formatPrice(priceFor(product, choice) * choice.quantity)}</p>
                </div>
              )}
            </article>
          );
        })}
        {products.length === 0 && <p className="card p-5 text-sm text-muted">لا توجد منتجات مفعّلة لإضافتها إلى البوكس حالياً.</p>}
      </section>

      <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-primary/10 bg-surface/95 p-3 shadow-soft backdrop-blur lg:static lg:rounded-card lg:border lg:p-4">
        <div className="min-w-0 flex-1"><p className="text-xs text-muted">إجمالي البوكس ومحتوياته</p><p className="font-bold text-primary">{formatPrice(total)}</p></div>
        <button type="button" disabled={!canAdd} onClick={addToCart} className="btn-primary min-h-11 flex-1 !py-2 disabled:opacity-50">
          <ShoppingBag className="h-4 w-4" /> {soldOut ? "نفد البوكس" : ordersPaused ? "الطلبات متوقفة" : selectedUnits === 0 ? "اختاري محتويات البوكس" : missingBoxFields || selectedProducts.some((product) => customizationMissing(product, choices[product.id])) ? "أكملي بيانات المنتجات" : <><Check className="h-4 w-4" /> أضيفي البوكس للسلة</>}
        </button>
      </div>
    </div>
  );
}
