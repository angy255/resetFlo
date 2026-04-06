"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendPoint = {
  date: string;
  sleepDuration: number;
  energyLevel: number;
  sorenessLevel: number;
  perceivedExertion: number;
};

type Props = {
  data: TrendPoint[];
};

const chartSpecs = [
  { key: "sleepDuration", label: "Sleep Duration (h)", color: "#5B9BD5", yMin: 0, yMax: 12 },
  { key: "energyLevel", label: "Energy Level", color: "#70C77E", yMin: 1, yMax: 10 },
  { key: "sorenessLevel", label: "Soreness Level", color: "#FF6B6B", yMin: 1, yMax: 10 },
  { key: "perceivedExertion", label: "Perceived Exertion", color: "#FFB347", yMin: 1, yMax: 10 },
] as const;

export default function TrendCharts({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-slate p-4 text-sm text-light/80">
        Log at least 2 entries to view trend charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {chartSpecs.map((chart) => (
        <div key={chart.key} className="rounded-lg border border-slate bg-navy p-3">
          <h3 className="mb-2 text-sm font-medium">{chart.label}</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#415A77" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#E0E1DD", fontSize: 12 }} tickLine={{ stroke: "#415A77" }} />
                <YAxis
                  domain={[chart.yMin, chart.yMax]}
                  tick={{ fill: "#E0E1DD", fontSize: 12 }}
                  tickLine={{ stroke: "#415A77" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D1B2A",
                    border: "1px solid #415A77",
                    color: "#E0E1DD",
                  }}
                  labelStyle={{ color: "#E0E1DD" }}
                />
                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={chart.color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
