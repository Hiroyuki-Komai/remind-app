import type { FrontToken } from "@/lib/parser";

export default function CardView({ tokens }: { tokens: FrontToken[] }) {
  return (
    <p className="whitespace-pre-wrap leading-loose">
      {tokens.map((t, i) =>
        t.kind === "text" ? (
          <span key={i}>{t.value}</span>
        ) : (
          <span key={t.blankId} className="relative mx-0.5 inline-block">
<span className="inline-block min-w-[3em] rounded border border-dashed border-gray-400 px-2 text-center text-transparent select-none">              ＿＿
            </span>
            {t.missCount.max > 0 && (
              <sup className="ml-0.5 text-xs text-red-500">
                {t.missCount.current}({t.missCount.max})
              </sup>
            )}
          </span>
        )
      )}
    </p>
  );
}