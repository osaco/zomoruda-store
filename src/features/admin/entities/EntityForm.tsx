"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Checkbox, Field, inputCls } from "../components/ui";
import { saveEntity, type EntityFormState } from "./actions";
import type { EntityField } from "./config";

type Value = string | number | boolean | null | undefined;

const toLocalInput = (iso: Value) => (typeof iso === "string" && iso ? iso.slice(0, 16) : "");

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
