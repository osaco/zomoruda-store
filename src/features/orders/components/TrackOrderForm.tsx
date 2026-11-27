"use client";

import { useActionState } from "react";
import { ORDER_STATUS_LABELS_AR } from "@/types/enums";
import { trackOrderAction } from "../server/tracking-action";

export function TrackOrderForm({ initialOrderNumber = "", token }: { initialOrderNumber?: string; token?: string }) {
  const [state, action, pending] = useActionState(trackOrderAction, {});
  const order = state.order;

  return (
    <div className="space-y-6">
      <form action={action} className="card space-y-3 p-5">
        {token && <input type="hidden" name="token" value={token} />}
        <label className="block space-y-1 text-sm font-medium">
          <span>رقم الطلب</span>
          <input key={order?.orderNumber} name="orderNumber" required defaultValue={order?.orderNumber ?? initialOrderNumber}
            minLength={4} maxLength={30} placeholder="ZM-1234" dir="ltr" autoComplete="off" className="field uppercase" />
        </label>
        <button className="btn-primary w-full" disabled={pending} name="intent" value={token && !order ? "confirm" : "track"}>
          {pending ? "جارٍ التحقق…" : token && !order ? "موافق، تأكيد الطلب" : "تتبّع"}
        </button>
        {state.error && <p role="alert" className="text-center text-sm text-danger">{state.error}</p>}
      </form>

      {order && (
        <section className="card space-y-4 p-5" aria-live="polite">
          <p className="font-bold text-primary"><bdi>{order.orderNumber}</bdi> · {ORDER_STATUS_LABELS_AR[order.status]}</p>
          {order.canConfirm && (
            <form action={action}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              {token && <input type="hidden" name="token" value={token} />}
              <button className="btn-secondary" name="intent" value="confirm" disabled={pending}>موافق، تأكيد الطلب</button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
