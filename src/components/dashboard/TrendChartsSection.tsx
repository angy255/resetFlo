"use client";

import dynamic from "next/dynamic";

type TrendPoint = {
  date: string;
  sleepDuration: number;
  energyLevel: number;
  sorenessLevel: number;
  perceivedExertion: number;
};

const TrendCharts = dynamic(() => import("@/components/dashboard/TrendCharts"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-slate/60" />,
});

export default function TrendChartsSection({ data }: { data: TrendPoint[] }) {
  return <TrendCharts data={data} />;
}
