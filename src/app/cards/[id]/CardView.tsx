"use client";

import { useState } from "react";
import type { FrontToken } from "@/lib/parser";
import { revealBlank } from "@/app/actions/card";

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
          </span>
        );
      })}
    </p>
  );
}