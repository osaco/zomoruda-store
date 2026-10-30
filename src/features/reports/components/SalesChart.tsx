"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayPoint } from "../lib/analytics";

export function SalesChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39244A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#39244A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F4EDFA" />
          <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={11} />
          <YAxis fontSize={11} width={40} />
          <Tooltip formatter={(v) => [`${v} ₪`, "المبيعات"]} labelFormatter={(l) => String(l)} />
          <Area type="monotone" dataKey="revenue" stroke="#39244A" fill="url(#rev)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
