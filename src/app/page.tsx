"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("読み込み中");

  useEffect(() => {
    fetch("/api/note")
      .then((r) => r.json())
      .then((d) => {
        setText(d.body);
        setStatus("読み込み完了");
      });
  }, []);

const save = async () => {
  setStatus("保存中");

  await fetch("/api/note", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: text,
    }),
  });

  setStatus("保存しました");
};

return (
  <main className="p-8 max-w-2xl mx-auto">
    <h1 className="text-xl mb-4">保存テスト</h1>

    <textarea
      className="w-full h-64 border p-2"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />

    <div className="mt-2 flex gap-4 items-center">
      <button
        onClick={save}
        className="border px-4 py-2"
      >
        保存
      </button>

      <span className="text-sm text-gray-500">
        {status}
      </span>
    </div>
  </main>
);
}