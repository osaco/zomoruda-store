"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Checkbox, Field, inputCls } from "../components/ui";
import { saveEntity, type EntityFormState } from "./actions";
import type { EntityField } from "./config";
import { MAX_PRODUCT_SOURCE_MB, uploadAdminImage } from "@/features/uploads/client";

type Value = string | number | boolean | null | undefined;

const toLocalInput = (iso: Value) => (typeof iso === "string" && iso ? iso.slice(0, 16) : "");

function EntityImageField({ entity, field, value }: { entity: string; field: EntityField; value: Value }) {
  const [url, setUrl] = useState(String(value ?? ""));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const kind = entity === "banners" ? "banner" : "category";

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    setNotice("");
    try {
      setUrl(await uploadAdminImage(file, kind));
      setNotice(kind === "banner"
        ? "حُوّلت الصورة إلى WebP بعرض يصل إلى 1920px؛ الحجم المستهدف 150–250KB."
        : "حُوّلت الصورة إلى WebP بعرض يصل إلى 600px؛ الحجم المستهدف 20–40KB.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <Field label={field.label} hint={field.hint}>
        <input
          name={field.name}
          required={field.required}
          type="url"
          dir="ltr"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={inputCls}
        />
      </Field>
      <label className="btn-secondary w-fit cursor-pointer !py-2 text-sm">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {uploading ? "جاري تحسين الصورة..." : "رفع صورة وتحسينها"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          disabled={uploading}
          className="sr-only"
          onChange={(event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (file) void upload(file).finally(() => { input.value = ""; });
          }}
        />
      </label>
      <p className="text-xs text-muted">الصورة الأصلية حتى {MAX_PRODUCT_SOURCE_MB} ميجابايت؛ المقاس والحجم النهائيان تقريبيان.</p>
      {notice && <p role="status" className="text-xs text-success">{notice}</p>}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function EntityForm({ entity, fields, item }: { entity: string; fields: EntityField[]; item?: Record<string, Value> & { id: string } }) {
  const [state, action, pending] = useActionState<EntityFormState, FormData>(saveEntity, {});
  return (
    <form action={action} className="card grid gap-4 p-5 sm:grid-cols-2">
      <input type="hidden" name="_entity" value={entity} />
      {item && <input type="hidden" name="_id" value={item.id} />}
      {fields.map((f) => {
        const value = item?.[f.name];
        if (f.type === "checkbox")
          return <div key={f.name} className="flex items-end"><Checkbox name={f.name} label={f.label} defaultChecked={item ? Boolean(value) : true} /></div>;
        if (f.name === "imageUrl" && (entity === "categories" || entity === "banners"))
          return <EntityImageField key={f.name} entity={entity} field={f} value={value} />;
        return (
          <Field key={f.name} label={f.label} hint={f.hint}>
            {f.type === "textarea" ? (
              <textarea name={f.name} rows={2} defaultValue={String(value ?? "")} className={inputCls} />
            ) : f.type === "select" ? (
              <select name={f.name} defaultValue={String(value ?? f.options?.[0]?.value ?? "")} className={inputCls}>
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                name={f.name}
                required={f.required}
                type={f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                step={f.type === "number" ? "any" : undefined}
                dir={f.type === "url" || f.name === "slug" || f.name === "code" ? "ltr" : undefined}
                defaultValue={f.type === "datetime" ? toLocalInput(value) : String(value ?? "")}
                className={inputCls}
              />
            )}
          </Field>
        );
      })}
      {state.error && <p role="alert" className="text-sm text-danger sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <button disabled={pending} className="btn-primary !py-2">{pending && <Loader2 className="h-4 w-4 animate-spin" />} {item ? "حفظ التعديلات" : "إضافة"}</button>
      </div>
    </form>
  );
}
