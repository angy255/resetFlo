import EntryForm from "@/components/entries/EntryForm";

export default function NewEntryPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-light">New Entry</h1>
      <div className="mt-4">
        <EntryForm mode="create" />
      </div>
    </main>
  );
}
