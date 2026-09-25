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

  // 段1-b: このカードの生存中の Blank を取得
  const aliveBlanks = await prisma.blank.findMany(
    {
      where: {cardId: id, 
      deletedAt: null}
    }
  );

  // 段2-a: Blank[] → BlankStats[]（current は 0 固定、max は maxMissCount）
  // 取得した生存中の穴データを、画面表示用の統計データ（BlankStats[]）に変換
  const stats: BlankStats[] = aliveBlanks.map((b) => ({
    id: b.id,
    ordinal: b.ordinal!, //非 null アサーション演算子というらしい
    missCount: {
      current: 0,
      max: b.maxMissCount
    }, 
  }));

  // 段2-b: parse(本文) → toFront(tokens, stats)
  const tokens = parse(card.body);//答え含む
  const front = toFront(tokens,stats);//答え含まない


  return (
    <main className="mx-auto max-w-2xl p-6">
      <CardView tokens={ front } />
    </main>
  );
}