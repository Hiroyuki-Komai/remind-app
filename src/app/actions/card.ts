"use server";

import { prisma } from "@/lib/prisma";
import { parse, normalizeBody, type BlankToken } from "@/lib/parser";
import { matchBlanks,normalizeAnswerKey } from "@/lib/matching";


export async function updateCard(cardId: string, body: string) {

  //（parser仕様書2.1）保存前に正規化
  const normalizedBody = normalizeBody(body);
  // 1. パースから (新)blank トークンだけ取り出す
  const newTokens = parse(normalizedBody).filter((t): t is BlankToken => t.kind === "blank");
  //2. 旧Blank取得  
  const oldBlanks = await prisma.blank.findMany({where: {cardId:cardId, deletedAt: null}});
  //3. matchBlanks  
  const result = matchBlanks(oldBlanks, newTokens);
  //4. DB反映（Pass 3 含む）
  await prisma.$transaction(async (tx) => {
  // この中では prisma ではなく tx を使う
  // 4操作をここに書く

  //1：生存中の全Blankの ordinal を null に（updateMany）:
    await tx.blank.updateMany({
      where: { cardId, deletedAt: null },//「このカードの生存中のBlank」
      data: { ordinal: null },//data が書き込む値
    });
  //2 :result.matched を for で回し、1件ずつ tx.blank.update で書き込む。
    for(const m of result.matched){
      const normedAnswerKey = normalizeAnswerKey(m.newToken.answer)
     await tx.blank.update({
       where: { id: m.oldBlank.id },//
       data: { ordinal: m.newToken.index, answerKey: normedAnswerKey },//
     });
   }
   //3：result.unmatchedNew を回して tx.blank.create で新規作成
   for (const t of result.unmatchedNew){
    const normedAnswerKey = normalizeAnswerKey(t.answer)
     await tx.blank.create({
       data: { cardId: cardId, ordinal: t.index, answerKey: normedAnswerKey }
     });
   }
   //4：unmatchedOld に deletedAt を入れる（ordinal は手順1で既に null）
   for (const o of result.unmatchedOld){
      await tx.blank.update({
        where: { id: o.id },//
        data: { deletedAt: new Date() },//
      })
    }
    //5：カード本文を更新
    await tx.card.update({
      where: { id: cardId},
      data: { body: normalizedBody},
    });
  });
}

export async function createCard(body: string) {
  
  //（parser仕様書2.1）保存前に正規化
  const normalizedBody = normalizeBody(body);
  // TODO 1. パース → blank トークンだけ取り出す（updateCard の段階1と同じ）
    const newTokens = parse(normalizedBody).filter((t): t is BlankToken => t.kind === "blank");

    // TODO 2. sortKey を決める（既存の最大値 + 1000）
      await prisma.$transaction(async (tx) => {
        const agg = await tx.card.aggregate({
           _max: { sortKey: true } 
        });// agg の型: { _max: { sortKey: number | null } } ※見つからなかったときにnullを返す
      const sortKey = (agg._max.sortKey ?? 0) + 1000;

        // TODO 3. カードと穴をまとめて作成
        await tx.card.create({
          data: {
            body: normalizedBody,
            sortKey: sortKey,
            blanks: {
              create: newTokens.map((t) => ({
                //ここに穴一個分のデータ
                ordinal: t.index, 
                answerKey: normalizeAnswerKey(t.answer),
              })),
            },
          },
        });
      
      });


    }

    export async function revealBlank(blankId: string): Promise<string> {
  // 1. Blank を id で1件取得
  const blank = await prisma.blank.findUnique({
    where: { id: blankId } 
  })
  // 2. 見つからない／削除済み（deletedAt が null でない）／ordinal が null なら throw
  if (blank === null || blank.deletedAt !== null || blank.ordinal === null){
  throw new Error("Blankが見つかりません")
  }
  // 3. その Blank の cardId で Card を1件取得（無ければ throw）
  const card = await prisma.card.findUnique({
    where: { id: blank.cardId } 
  })

   if (card === null){
    throw new Error("Cardが見つかりません")
  }
  // 4. parse(card.body) から、kind が "blank" かつ index が Blank の ordinal と一致するトークンを探す
  const pinpointedToken = parse(card.body).find((t): t is BlankToken => t.kind === "blank" && t.index === blank.ordinal);
  // 5. 見つかったトークンの answer を返す（無ければ throw）
  if(!pinpointedToken){
        throw new Error("対応トークンが見つかりません")
  }
  return pinpointedToken.answer;
}