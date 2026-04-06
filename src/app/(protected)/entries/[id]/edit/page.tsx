import { notFound } from "next/navigation";

import EntryForm from "@/components/entries/EntryForm";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) return null;

  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
  });

  if (!entry || entry.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-light">Edit Entry</h1>
      <div className="mt-4">
        <EntryForm
          mode="edit"
          entryId={entry.id}
          initialValues={{
            date: entry.date.toISOString().slice(0, 10),
            workoutType: entry.workoutType,
            workoutDuration: entry.workoutDuration,
            perceivedExertion: entry.perceivedExertion,
            sorenessLevel: entry.sorenessLevel,
            sleepDuration: entry.sleepDuration,
            sleepQuality: entry.sleepQuality,
            energyLevel: entry.energyLevel,
            notes: entry.notes ?? "",
          }}
        />
      </div>
    </main>
  );
}
