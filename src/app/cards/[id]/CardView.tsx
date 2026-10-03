"use client";

import { useRouter } from "next/navigation"; 
import { useState } from "react";
import type { FrontToken } from "@/lib/parser";
import { revealBlank, recordAnswer, reviewCard } from "@/app/actions/card"; // reviewCard を足す


export default function CardView({ tokens, cardId, isReviewDisabled}: { tokens: FrontToken[]; cardId: string; isReviewDisabled: boolean; }) {
  // 開いた穴の答え。例：{ "cmufe8tss...": "東京" }
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const handleReveal = async (blankId: string) => {
    // TODO 1. すでに開いていたら(=undefinedでない場合)何もしない
    if(revealed[blankId] !== undefined){
      return ;//何も返さずに終了
    }
    // TODO 2. revealBlank で答えを取得
    const answer = await revealBlank(blankId);
    // TODO 3. revealed に追加
    setRevealed((prev) => ({ ...prev, [blankId]: answer }));
  };


  const [answered, setAnswered] = useState<Record<string, boolean>>({});

  const handleAnswer = async (blankId: string, isCorrect: boolean) => {
  // TODO1: すでに answered[blankId] が記録済みなら何もしない（return）
  if(answered[blankId] !== undefined){
    return ;//何も返さずに終了
  }
  // TODO2: recordAnswer(blankId, isCorrect) を呼ぶ（await）
  await recordAnswer(blankId, isCorrect);
  // TODO3: setAnswered で answered[blankId] に isCorrect を保存する
  setAnswered((prev) => ({ ...prev, [blankId]: isCorrect }));
  };

  // TODO A-1. router を作る
  const router = useRouter();
  const handleReview = async () => {
   await reviewCard(cardId);
   // TODO A-2. /review へ自動でページ遷移
   router.push("/review");
  };

//「復習完了」ボタンを、全穴に回答済みになるまで押せなくする ための変数：
//tokensからBlankだけを取り出す
  const blankCount = tokens.filter((t) => t.kind === "blank").length;
//objであるansweredのプロパティblankIdの総数と穴の数　が一致＝全問回答済み
  const allAnswered = blankCount === Object.keys(answered).length;



  return (
      <div>
    <p className="whitespace-pre-wrap leading-loose">
      {tokens.map((t, i) => {
        if (t.kind === "text") return <span key={i}>{t.value}</span>;

        const answer = revealed[t.blankId];
        return (
          <span key={t.blankId} className="relative mx-0.5 inline-block">
            <button
              type="button"
              onClick={() => handleReveal(t.blankId)}
              className={
                "inline-block min-w-[3em] rounded border border-dashed border-gray-400 px-2 text-center " +
                (answer === undefined ? "text-transparent select-none cursor-pointer" : "border-solid bg-yellow-400/20")
              }
            >
              {answer ?? "＿＿"}
            </button>
            {t.missCount.max > 0 && (
              <sup className="ml-0.5 text-xs text-red-500">
                {t.missCount.current}({t.missCount.max})
              </sup>
            )}
          {answer !== undefined && answered[t.blankId] === undefined && (
            <span className="ml-1 space-x-1">
            <button type="button" onClick={() => handleAnswer(t.blankId, true)} className="rounded border border-green-500 px-2 py-1 hover:bg-green-800 text-white">○</button>
            <button type="button" onClick={() => handleAnswer(t.blankId, false)} className="rounded border border-red-500 px-2 py-1 hover:bg-red-800 text-white">×</button>
            </span>
          )}
        {answered[t.blankId] !== undefined && (
          <span className="ml-1 text-xs text-gray-400">
          {answered[t.blankId] ? "○" : "×"} 記録済み
          </span>
        )}
          </span>
        );
      })}
    </p>
        <button type="button" onClick={handleReview} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400" disabled={!allAnswered || isReviewDisabled}>復習完了</button>{/*「未回答」または「期限前」なら押せない*/}
      </div>
  );
}
