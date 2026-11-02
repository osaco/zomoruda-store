import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepos } from "@/lib/data";
import type { CrudRepository } from "@/lib/data/repositories";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/features/auth/session";
import { AdminPageTitle, Table, Td } from "@/features/admin/components/ui";
import { deleteEntity } from "@/features/admin/entities/actions";
import { ENTITIES, isEntityName } from "@/features/admin/entities/config";
import { EntityForm } from "@/features/admin/entities/EntityForm";

type Item = Record<string, string | number | boolean | null> & { id: string };

/** Generic manager for categories, occasions, banners, zones and coupons. */
export default async function EntityPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { entity } = await params;
  if (!isEntityName(entity)) notFound();
  await requireAdmin("admin");
  const { edit, error } = await searchParams;
  const config = ENTITIES[entity];
  const repo = getRepos()[config.repo] as unknown as CrudRepository<Item>;
  const items = await repo.list({ includeInactive: true });
  const editing = edit ? items.find((i) => i.id === edit) : undefined;
  const columns = config.fields.filter((f) => f.inTable);

  const cell = (item: Item, name: string, type: string) => {
    const v = item[name];
    if (type === "checkbox") return v ? "✓" : "—";
    if (type === "datetime") return typeof v === "string" ? formatDate(v) : "—";
    return v === null || v === "" ? "—" : String(v);
  };

  return (
    <>
      <AdminPageTitle title={config.title} />
      {error && <p className="mb-4 rounded-input bg-danger/10 p-3 text-sm text-danger">تعذّر الحذف — قد يكون العنصر مرتبطاً بمنتجات أو طلبات. يمكنك إخفاؤه بدلاً من حذفه.</p>}
      <section className="mb-8">
        <h2 className="mb-3 font-heading font-bold">{editing ? "تعديل" : "إضافة جديد"}</h2>
        <EntityForm key={editing?.id ?? "new"} entity={entity} fields={config.fields} item={editing} />
        {editing && <Link href={`/admin/${entity}`} className="mt-2 inline-block text-sm text-muted">إلغاء التعديل</Link>}
      </section>
      <Table head={[...columns.map((c) => c.label), ""]} empty={items.length === 0}>
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-primary-light/30">
            {columns.map((c) => <Td key={c.name}>{cell(item, c.name, c.type)}</Td>)}
            <Td className="flex gap-3">
              <Link href={`/admin/${entity}?edit=${item.id}`} className="text-primary">تعديل</Link>
              <form action={deleteEntity}>
                <input type="hidden" name="_entity" value={entity} />
                <input type="hidden" name="_id" value={item.id} />
                <button className="text-danger">حذف</button>
              </form>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
