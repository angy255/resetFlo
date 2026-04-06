import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import SummaryTable from "@/components/dashboard/SummaryTable";
import InsightCard from "@/components/dashboard/InsightCard";
import TrendChartsSection from "@/components/dashboard/TrendChartsSection";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) return null;

  const [lastSevenEntries, lastThirtyEntries, latestInsight] = await Promise.all([
    prisma.entry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.entry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: 30,
    }),
    prisma.insight.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const trendData = lastThirtyEntries.map((entry) => ({
    date: entry.date.toISOString().slice(0, 10),
    sleepDuration: entry.sleepDuration,
    energyLevel: entry.energyLevel,
    sorenessLevel: entry.sorenessLevel,
    perceivedExertion: entry.perceivedExertion,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-light/80">Your recent training and recovery trends.</p>

      <div className="mt-5">
        <InsightCard
          initialInsight={
            latestInsight
              ? {
                  id: latestInsight.id,
                  content: latestInsight.content,
                  createdAt: latestInsight.createdAt.toISOString(),
                }
              : null
          }
        />
      </div>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold">Weekly Summary</h2>
        <SummaryTable entries={lastSevenEntries} />
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold">30-Day Trends</h2>
        <TrendChartsSection data={trendData} />
      </section>
    </main>
  );
}
