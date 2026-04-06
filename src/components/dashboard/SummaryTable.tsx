import type { Entry } from "@prisma/client";

type Props = {
  entries: Entry[];
};

export default function SummaryTable({ entries }: Props) {
  if (entries.length < 7) {
    return (
      <div className="rounded-lg border border-dashed border-slate p-4 text-sm text-light/80">
        Log more entries to see your weekly summary.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate bg-navy">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-navy-dark text-light/90">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Workout</th>
            <th className="px-3 py-2">Duration</th>
            <th className="px-3 py-2">Exertion</th>
            <th className="px-3 py-2">Soreness</th>
            <th className="px-3 py-2">Sleep</th>
            <th className="px-3 py-2">Energy</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t border-slate/50">
              <td className="px-3 py-2">{entry.date.toISOString().slice(0, 10)}</td>
              <td className="px-3 py-2">{entry.workoutType}</td>
              <td className="px-3 py-2">{entry.workoutDuration}m</td>
              <td className="px-3 py-2">{entry.perceivedExertion}/10</td>
              <td className="px-3 py-2">{entry.sorenessLevel}/10</td>
              <td className="px-3 py-2">
                {entry.sleepDuration}h ({entry.sleepQuality}/10)
              </td>
              <td className="px-3 py-2">{entry.energyLevel}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
