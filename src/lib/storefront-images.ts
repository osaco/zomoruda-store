import type { Category, Product, ProductImage } from "@/types/db";

/**
 * The demo repository deliberately stores text-only `placehold.co` images so
 * the data layer remains lightweight. Those images are useful for fixtures,
 * but they should never make the public storefront feel unfinished. This
 * module replaces only that known demo host with locally shipped Zomoruda
 * artwork. Uploaded Supabase images always win.
 */
export type StorefrontImage = {
  src: string;
  alt: string;
};

const SHOWCASE_ROOT = "/showcase";

const categoryArtwork: Record<string, string> = {
  "gift-boxes": "gift-box.svg",
  flowers: "flowers.svg",
  perfumes: "perfume.svg",
  cosmetics: "cosmetics.svg",
  mugs: "mug.svg",
  accessories: "watch.svg",
  bags: "gift-box.svg",
  "wedding-gifts": "gift-box.svg",
};

const productArtwork: Record<string, string> = {
  "royal-gift-box": "gift-box.svg",
  "pink-roses-bouquet": "flowers.svg",
  "oud-perfume-50ml": "perfume.svg",
  "vanilla-perfume": "perfume.svg",
  "makeup-kit": "cosmetics.svg",
  "name-mug": "mug.svg",
  "name-necklace": "watch.svg",
  "pearl-bracelet": "watch.svg",
  "crystal-earrings": "watch.svg",
  "leather-handbag": "gift-box.svg",
  "wedding-fingerprint-frame": "gift-box.svg",
  "wedding-giveaways": "gift-box.svg",
};

function isDemoPlaceholder(url: string) {
  return url.includes("placehold.co");
}

function asset(name: string) {
  return `${SHOWCASE_ROOT}/${name}`;
}

function primaryImage(images: ProductImage[]) {
  return images.find((image) => image.isPrimary) ?? images[0];
}

/**
 * Safe for persisted cart and order snapshots, which only retain a product
 * slug and image URL. Real merchant uploads are returned untouched.
 */
export function getStorefrontImageUrl(slug: string, url?: string | null) {
  if (url && !isDemoPlaceholder(url)) return url;
  return asset(productArtwork[slug] ?? "gift-box.svg");
}

/** Use this when a historical order item does not include a product slug. */
export function getOrderImageUrl(url?: string | null) {
  return url && !isDemoPlaceholder(url) ? url : asset("gift-box.svg");
}

export function getProductStorefrontImage(product: Product): StorefrontImage {
  const uploaded = product.images.filter((image) => !isDemoPlaceholder(image.url));
  const image = primaryImage(uploaded);
  if (image) {
    return { src: image.url, alt: image.altAr ?? product.nameAr };
  }

  return {
    src: getStorefrontImageUrl(product.slug),
    alt: product.nameAr,
  };
}

/**
 * Use real uploaded gallery images whenever any exist. Demo placeholders are
 * intentionally collapsed to one brand artwork rather than repeated slides.
 */
export function getProductGalleryImages(product: Product): StorefrontImage[] {
  const uploaded = product.images.filter((image) => !isDemoPlaceholder(image.url));
  if (uploaded.length > 0) {
    return uploaded.map((image) => ({ src: image.url, alt: image.altAr ?? product.nameAr }));
  }

  return [getProductStorefrontImage(product)];
}

export function getCategoryStorefrontImage(category: Category): StorefrontImage {
  if (category.imageUrl && !isDemoPlaceholder(category.imageUrl)) {
    return { src: category.imageUrl, alt: category.nameAr };
  }

  return {
    src: asset(categoryArtwork[category.slug] ?? "gift-box.svg"),
    alt: category.nameAr,
  };
}
