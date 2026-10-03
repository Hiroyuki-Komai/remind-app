import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parse } from "@/lib/parser";

//cards/page.tsxの大部分を転用

export default async function ReviewCardListPage() {
  // 出題対象のカードを dueDateの昇順で(期限が古いものから)取得
    const cards = await prisma.card.findMany({
    orderBy: {
        dueDate: "asc"
    },
    where: {
        masteredAt: null,
        dueDate: {
            lte: new Date()
        }
    }
  });
  // 1枚ずつリンクにして並べる
  return (
    <main className="mx-auto max-w-2xl p-6">
          <h1 className="mb-4 text-xl font-bold">今日の復習</h1>
        {cards.length === 0 && (
            <p>今日の復習は完了しました</p>
        )}
        {cards.map((c) => {
            const front = parse(c.body).map((f) => f.kind === "text" ? f.value : "＿＿").join("")
           return(
          <Link
           key={c.id} href={`/cards/${c.id}`} className="block" // 1枚ごとに改行
          >
          {front.slice(0, 40)}
          </Link>
        );
    })}
    </main>
  );
}