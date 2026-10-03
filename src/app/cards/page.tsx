import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parse } from "@/lib/parser";

export default async function CardListPage() {
  // TODO 1. 全カードを sortKey の昇順で取得
    const cards = await prisma.card.findMany({
    orderBy: {
        sortKey: "asc"
    }
  });
  // TODO 2. 1枚ずつリンクにして並べる
  return (
    <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-bold">全カード一覧</h1>
        {cards.map((c) => {
            const front = parse(c.body).map((f) => f.kind === "text" ? f.value : "＿＿").join("")
           return(
          <Link
           key={c.id} href={`/cards/${c.id}`} className="block rounded border border-gray-600 p-3 mb-2 hover:bg-gray-800" // 1枚ごとに改行
          >
          {front.slice(0, 40)}
          </Link>
        );
    })}
    </main>
  );
}