import { useState } from "react";
import type { ProductInput } from "@/lib/data/repositories";
import { inputCls } from "@/features/admin/components/ui";

type Option = ProductInput["options"][number];
const emptyValue = () => ({ valueAr: "", priceDelta: 0 });

export function ProductOptionsEditor({ initial }: { initial: Option[] }) {
  const [groups, setGroups] = useState(initial);
  function change(index: number, patch: Partial<Option>) {
    setGroups(current => current.map((group, i) => i === index ? { ...group, ...patch } : group));
  }
  return <section className="space-y-3">
    <h2 className="font-bold">خيارات هذا المنتج</h2>
    <p className="text-sm text-muted">مثلاً لون الورد أو حجم الكوب. أدخلي فرق السعر لكل اختيار.</p>
    <input type="hidden" name="optionGroups" value={JSON.stringify(groups)} />
    {groups.map((group, index) => <fieldset key={index} className="space-y-2 rounded-xl border p-3">
      <label>اسم الخيار<input className={inputCls} required value={group.nameAr} onChange={e => change(index, { nameAr: e.target.value })} /></label>
      <label className="block"><input type="checkbox" checked={group.isRequired} onChange={e => change(index, { isRequired: e.target.checked })} /> اختيار إلزامي</label>
      {group.values.map((value, j) => <div key={j} className="grid gap-2 sm:grid-cols-3">
        <label>القيمة<input className={inputCls} required value={value.valueAr} onChange={e => change(index, { values: group.values.map((v,k) => k === j ? { ...v, valueAr: e.target.value } : v) })} /></label>
        <label>فرق السعر ₪<input className={inputCls} type="number" step="0.01" value={value.priceDelta} onChange={e => change(index, { values: group.values.map((v,k) => k === j ? { ...v, priceDelta: Number(e.target.value) } : v) })} /></label>
        <button type="button" disabled={group.values.length === 1} onClick={() => change(index, { values: group.values.filter((_,k) => k !== j) })}>حذف القيمة</button>
      </div>)}
      <button type="button" className="btn-secondary" onClick={() => change(index, { values: [...group.values, emptyValue()] })}>إضافة قيمة</button>
      <button type="button" className="btn-ghost" onClick={() => setGroups(groups.filter((_,i) => i !== index))}>حذف الخيار</button>
    </fieldset>)}
    <button type="button" className="btn-secondary" onClick={() => setGroups([...groups, { nameAr: "", isRequired: false, values: [emptyValue()] }])}>إضافة خيار للمنتج</button>
  </section>;
}
