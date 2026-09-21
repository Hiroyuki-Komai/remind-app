"use server";

import { prisma } from "@/lib/prisma";
import { parse, type BlankToken } from "@/lib/parser";
import { matchBlanks,normalizeAnswerKey } from "@/lib/matching";


export async function updateCard(cardId: string, body: string) {
  // 1. パースから (新)blank トークンだけ取り出す
  const newTokens = parse(body).filter((t): t is BlankToken => t.kind === "blank");
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
      data: { body: body},
    });
  });
}