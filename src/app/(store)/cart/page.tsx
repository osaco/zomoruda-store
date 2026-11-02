import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CartView } from "@/features/cart/components/CartView";

export const metadata: Metadata = { title: "السلة", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <PageHeader title="سلة المشتريات" />
      <div className="container-page py-6">
        <CartView />
      </div>
    </>
  );
}
