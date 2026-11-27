"use client";

import Link from "next/link";
import { StatusTimeline } from "./StatusTimeline";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { ORDER_STATUS_LABELS_AR } from "@/types/enums";
import { trackOrderAction } from "../server/tracking-action";

export function TrackOrderForm({ initialOrderNumber = "", token }: { initialOrderNumber?: string; token?: string }) {
  const [state, action, pending] = useActionState(trackOrderAction, {});
  const order = state.order;

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let number = initialOrderNumber;
    try { number ||= localStorage.getItem("zomoruda-last-order") ?? ""; } catch { /* Manual lookup remains available. */ }
    if (number) refresh(number);
    function refresh(value: string) {
      const data = new FormData();
      data.set("orderNumber", value);
      if (token) data.set("token", token);
      startTransition(() => action(data));
    }
  }, [action, initialOrderNumber, token]);

  useEffect(() => {
    if (!order || pending || order.status === "delivered" || order.status === "cancelled") return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const data = new FormData();
      data.set("orderNumber", order.orderNumber);
      if (token) data.set("token", token);
      startTransition(() => action(data));
    }, 45000);
    return () => window.clearInterval(timer);
  }, [action, order, pending, token]);

  return (
    <div className="space-y-6">
      <form action={action} className="card space-y-3 p-5">
        {token && <input type="hidden" name="token" value={token} />}
        <label className="block space-y-1 text-sm font-medium">
          <span>رقم الطلب</span>
          <input key={order?.orderNumber} name="orderNumber" required defaultValue={order?.orderNumber ?? initialOrderNumber}
            minLength={4} maxLength={30} placeholder="ZM-1234" dir="ltr" autoComplete="off" className="field uppercase" />
        </label>
        <button className="btn-primary w-full" disabled={pending} name="intent" value="track">
          {pending ? "جارٍ التحقق…" : "تتبّع"}
        </button>
        {state.error && <p role="alert" className="text-center text-sm text-danger">{state.error}</p>}
      </form>

      {order && (
        <section className="card space-y-4 p-5" aria-live="polite">
          <p className="font-bold text-primary"><bdi>{order.orderNumber}</bdi> · {ORDER_STATUS_LABELS_AR[order.status]}</p>
          <StatusTimeline order={{ ...order, statusHistory: [] }} />
          <Link href="/" className="btn-secondary">متابعة التسوق</Link>
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
