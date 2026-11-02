import { getRepos } from "@/lib/data";
import { AdminPageTitle } from "@/features/admin/components/ui";
import { ProductForm } from "@/features/products-admin/components/ProductForm";

export const metadata = { title: "منتج جديد" };

export default async function NewProduct() {
  const repos = getRepos();
  const [categories, occasions] = await Promise.all([repos.categories.list({ includeInactive: true }), repos.occasions.list({ includeInactive: true })]);
  return (
    <>
      <AdminPageTitle title="منتج جديد" />
      <ProductForm categories={categories} occasions={occasions} />
    </>
  );
}
