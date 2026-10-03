import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parse, toFront, type BlankStats } from "@/lib/parser";
import CardView from "./CardView";
import NextCardSelect from "./NextCardSelect";
import Link from "next/link"; // 先頭に追加


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
  // card.masteredAt が入っている OR dueDate が未来 なら現時点で復習不可
  const isMastered = card.masteredAt !== null;
  const isReviewDisabled = isMastered || card.dueDate > new Date();

  //B-1カード一覧取得し、自分自身を除く
  const otherCards = await prisma.card.findMany({
    orderBy: {
        sortKey: "asc"
    },
    where:{
      id: { //Cardのid列
        not: id //URLから取った、このページのカードのid
      }
    }
  });
  //B-2 labelを作る
  const candidates = otherCards.map((c) => ({
    id: c.id,
    label: parse(c.body).map((f) => f.kind === "text" ? f.value : "＿＿").join("").slice(0, 40)
  }));

  // TODO A-1. 前のカードを取得（nextCardId が id のカード。無ければ null）
  const prevCard = await prisma.card.findUnique({
    where: {
     nextCardId: id 
    }
  });

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
        <h1 className="mb-4 text-xl font-bold">カード詳細</h1>
      {/*  期限前の場合のみ案内メッセージを表示 */}
      {isReviewDisabled && (
        <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
         {isMastered ? (
           <p>このカードは定着完了です。復習の対象外です。</p>
          ) : (
            <p>
              このカードはまだ復習期限ではありません。閲覧は可能ですが、復習の記録はできません（期限内の復習は
              <Link href="/review" className="mx-1 font-bold underline">/review</Link>
              から行ってください）。
            </p>
          )}
        </div>
      )}
      <CardView tokens={ front } cardId={card.id} isReviewDisabled={isReviewDisabled}/>
      <div className="mt-4 flex justify-between">
        {/* TODO A-2. 前のカードがあれば「← 前へ」のリンク*/}
        {prevCard && (
          <Link href={`/cards/${prevCard.id}`} className="rounded border border-gray-500 px-3 py-1 hover:bg-gray-700">← 前へ</Link>
        )}
        {/*TODO A-3. card.nextCardId があれば「次へ →」のリンク*/} 
        {card.nextCardId && (
          <Link href={`/cards/${card.nextCardId}`} className="rounded border border-gray-500 px-3 py-1 hover:bg-gray-700">次へ →</Link>        )}
        <NextCardSelect nextCardId={ card.nextCardId } cardId={card.id} candidates={candidates}/>
      </div>
    </main>
  );
}