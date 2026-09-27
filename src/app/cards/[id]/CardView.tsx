"use client";

import { useState } from "react";
import type { FrontToken } from "@/lib/parser";
import { revealBlank, recordAnswer } from "@/app/actions/card";

export default function CardView({ tokens }: { tokens: FrontToken[] }) {
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


  return (
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
            <button type="button" onClick={() => handleAnswer(t.blankId, true)} className="text-green-500">○</button>
            <button type="button" onClick={() => handleAnswer(t.blankId, false)} className="text-red-500">×</button>
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
  );
}