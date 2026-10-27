import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepos } from "@/lib/data";
import { env } from "@/lib/env";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductShowcase } from "@/features/catalog/components/ProductShowcase";
import { getCategories, getProductBySlug } from "@/features/catalog/server/queries";
import { ProductGallery } from "@/features/product/components/ProductGallery";
import { ProductPurchasePanel } from "@/features/product/components/ProductPurchasePanel";
import { getStoreSettings } from "@/features/settings/server/queries";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const image = product.images[0]?.url;
  return {
    title: product.nameAr,
    description: product.descriptionAr.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.nameAr, description: product.descriptionAr, images: image ? [{ url: image }] : undefined, locale: "ar_PS" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const [categories, related, settings] = await Promise.all([
    getCategories(),
    getRepos().products.related(product.id, 4),
    getStoreSettings(),
  ]);
  const category = categories.find((c) => c.id === product.categoryId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    description: product.descriptionAr,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: site.nameAr },
    offers: {
      "@type": "Offer",
      priceCurrency: "ILS",
      price: product.price,
      availability: product.availability === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
    },
  };

  return (
    <>
      <PageHeader
        title=""
        crumbs={category ? [{ href: `/categories/${category.slug}`, label: category.nameAr }] : []}
      />
      <div className="container-page -mt-6 grid gap-8 pb-6 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.nameAr} />
        <ProductPurchasePanel product={product} ordersPaused={settings.ordersPaused} />
      </div>
      <ProductShowcase title="قد يعجبكِ أيضاً" products={related} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
