"use client";

import { useActionState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusTimeline } from "./StatusTimeline";
import { trackOrderAction, type TrackingState } from "../server/tracking-action";

const initialState: TrackingState = {};

export function TrackOrderForm() {
  const [state, action, pending] = useActionState(trackOrderAction, initialState);
  const order = state.order;

  return (
    <div className="space-y-6">
      <form action={action} className="card space-y-3 p-5">
        <label className="block space-y-1 text-sm font-medium">
          <span>رقم الطلب</span>
          <input name="orderNumber" required minLength={4} maxLength={30} placeholder="ZM-1234" dir="ltr" aria-label="رقم الطلب" className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm uppercase" />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>رقم الجوال المستخدم في الطلب</span>
          <input name="phone" required type="tel" maxLength={24} placeholder="059xxxxxxx" dir="ltr" aria-label="رقم الجوال" className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm" />
        </label>
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "جارٍ البحث…" : "تتبّع"}
        </button>
        {state.error && <p role="alert" className="text-center text-sm text-danger">{state.error}</p>}
      </form>

      {order && (
        <section className="card space-y-4 p-5" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-primary" dir="ltr">{order.orderNumber}</span>
            <span className="text-muted">{formatDate(order.createdAt)}</span>
          </div>
          <StatusTimeline order={order} />
          <ul className="space-y-1 border-t border-primary/10 pt-3 text-sm">
            {order.items.map((item, i) => (
              <li key={`${item.nameAr}-${i}`} className="flex justify-between"><span>{item.nameAr} × {item.quantity}</span><span>{formatPrice(item.lineTotal)}</span></li>
            ))}
            <li className="flex justify-between pt-2 font-bold"><span>الإجمالي</span><span>{formatPrice(order.total)}</span></li>
          </ul>
        </section>
      )}
    </div>
  );
}
