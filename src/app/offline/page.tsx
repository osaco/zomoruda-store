import { WifiOff } from "lucide-react";
import { site } from "@/lib/site";

export const metadata = { title: "غير متصل" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <WifiOff className="h-14 w-14 text-primary/40" aria-hidden="true" />
      <h1 className="font-heading text-2xl font-bold">لا يوجد اتصال بالإنترنت</h1>
      <p className="text-muted">تحقّقي من الاتصال ثم أعيدي المحاولة. يمكنك أيضاً مراسلتنا على واتساب +{site.whatsapp}</p>
    </main>
  );
}
