import CardForm from "./CardForm";

export default function NewCardPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold">カードを作成</h1>
      <CardForm />
    </main>
  );
}