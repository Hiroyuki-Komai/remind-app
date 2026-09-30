import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parse, toFront, type BlankStats } from "@/lib/parser";
import CardView from "./CardView";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 段1-a: Card を id で1件取得。無ければ notFound()
  const card = await prisma.card.findUnique({
    where: { id }
  })
  if(card === null){
    notFound();
  }

  // 段1-b: このカードの生存中の Blankを取得
  //一度も×がない穴もaliveBlanksにちゃんと入っていて、
  //その場合、b.logs.filter(...).lengthは0になる。
  const aliveBlanks = await prisma.blank.findMany(
    {
      where: {
        cardId: id, 
        deletedAt: null
      },
      include: {
        logs: {
          where: {
            isCorrect: false
          }
        }
      }
      //includeの中のwhereは、ぶら下げるログを絞るだけで、
      //生存中のBlank自体を減らさないため、
      //include節を追加しても挙動はバグらない
    }
  );

  // 段2-a: Blank[] → BlankStats[]（current は 0 固定、max は maxMissCount）
  // 取得した生存中の穴データを、画面表示用の統計データ（BlankStats[]）に変換
  const stats: BlankStats[] = aliveBlanks.map((b) => ({
    id: b.id,
    ordinal: b.ordinal!, //非 null アサーション演算子というらしい
    missCount: {
      //復習期限リセット後に誤答した回数がcurrent
      current: b.logs.filter((l) => l.answeredAt >= b.resetAt).length,
      max: b.maxMissCount
    }, 
  }));

  // 段2-b: parse(本文) → toFront(tokens, stats)
  const tokens = parse(card.body);//答え含む
  const front = toFront(tokens,stats);//答え含まない


  return (
    <main className="mx-auto max-w-2xl p-6">
      <CardView tokens={ front } cardId={card.id} />
    </main>
  );
}