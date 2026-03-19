import { T } from "@/lib/tokens";

export default function BoardPage() {
  return (
    <main className="flex flex-1 items-center justify-center" style={{ color: T.textSubtlest }}>
      <div className="text-center">
        <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 8 }}>Board</h1>
        <p style={{ fontSize: 14 }}>Board view — coming soon</p>
      </div>
    </main>
  );
}
