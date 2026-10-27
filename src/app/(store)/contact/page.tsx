import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactSection } from "@/features/catalog/components/ContactSection";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="تواصل معنا" description="نردّ على رسائل واتساب وإنستغرام خلال ساعات العمل" />
      <ContactSection />
    </>
  );
}
