import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepos } from "@/lib/data";
import { AdminPageTitle } from "@/features/admin/components/ui";
import { ProductForm } from "@/features/products-admin/components/ProductForm";
import { deleteProduct } from "@/features/products-admin/server/actions";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repos = getRepos();
  const [product, categories, occasions] = await Promise.all([
    repos.products.getById(id),
    repos.categories.list({ includeInactive: true }),
    repos.occasions.list({ includeInactive: true }),
  ]);
  if (!product) notFound();
  return (
    <>
      <AdminPageTitle title={`تعديل: ${product.nameAr}`} />
      <ProductForm product={product} categories={categories} occasions={occasions} />
      <div className="mt-6 flex gap-3">
        <Link href={`/product/${product.slug}`} target="_blank" className="btn-ghost">عرض في المتجر</Link>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button className="btn-ghost text-danger">حذف المنتج</button>
        </form>
      </div>
    </>
  );
}
