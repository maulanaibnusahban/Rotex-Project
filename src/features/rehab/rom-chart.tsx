"use client";

import { useRouter } from "next/navigation";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RomPoint } from "./progress-data";

const shortDate = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short" });

export function RomChart({ points, journalBase }: { points: RomPoint[]; journalBase: string }) {
  const router = useRouter();
  const low = points[0].timestamp;
  const high = points[points.length - 1].timestamp;
  const domain = low === high ? [low - 43_200_000, high + 43_200_000] : [low, high];
  return <div className="rom-chart">
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart data={points} margin={{ top: 10, right: 22, left: 4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid stroke="#e3eae7" vertical={false} />
        <XAxis dataKey="timestamp" type="number" scale="time" domain={domain} tickFormatter={value => shortDate.format(Number(value))} minTickGap={24} />
        <YAxis width={48} domain={["auto", "auto"]} tickFormatter={value => value + "°"} allowDecimals />
        <Tooltip labelFormatter={value => shortDate.format(Number(value))} formatter={value => Number(value).toLocaleString("id-ID") + "°"} />
        <Line type="linear" dataKey="degrees" name="ROM" stroke="#26759b" strokeWidth={2.5} isAnimationActive={false}
          dot={({ cx, cy, payload }) => {
            const point = payload as RomPoint | undefined;
            if (!point) return <g />;
            return <circle cx={cx} cy={cy} r={4} fill="#26759b" stroke="white" strokeWidth={1.5}
              aria-label={shortDate.format(point.timestamp) + ", " + point.degrees + " derajat, buka jurnal"} role="link" tabIndex={0}
              className="rom-dot" onClick={() => router.push(journalBase + point.journalId)}
              onKeyDown={event => { if (event.key === "Enter") router.push(journalBase + point.journalId); }} />;
          }}
          activeDot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
