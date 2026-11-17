"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "@/features/uploads/client";

export function PhotoUploadField({
  label,
  kind,
  value,
  onChange,
}: {
  label: string;
  kind: "receipt" | "photo";
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <label className="flex cursor-pointer items-center gap-3 rounded-input border border-dashed border-primary/30 bg-primary-light/40 px-4 py-3 text-sm text-primary hover:bg-primary-light">
        {state === "uploading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : value ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
        <span>{state === "uploading" ? "جاري الرفع..." : value ? "تم رفع الصورة — اضغطي للتغيير" : "اختاري صورة من الجهاز"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setState("uploading");
            try {
              onChange(await uploadImage(file, kind));
              setState("idle");
            } catch (err) {
              setError(err instanceof Error ? err.message : "تعذّر الرفع");
              setState("error");
            }
          }}
        />
      </label>
      {state === "error" && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
