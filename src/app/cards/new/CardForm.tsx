"use client";

import { useState } from "react";
import { createCard } from "@/app/actions/card";

export default function CardForm() {
  const [body, setBody] = useState("");

  const handleSave = async () => {
    await createCard(body);
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
        className="w-full rounded border p-3 font-mono"
        placeholder="例：日本の首都は〈東京〉"
      />
      <button
        onClick={handleSave}
        className="self-end rounded bg-blue-600 px-4 py-2 text-white"
      >
        保存
      </button>
    </div>
  );
}