export type Token = TextToken | BlankToken;

export type TextToken = {
  kind: "text";
  raw: string;    // 原文の該当区間（エスケープ('\')解除前） 例:\<x>
  value: string;  // 表示用（エスケープ解除後）例:<x>
};

export type BlankToken = {
  kind: "blank";
  raw: string;     // 原文の該当区間。'〈' と '〉' を含む
  answer: string;  // 表示用。区切り文字を除き、前後の空白をトリムし、エスケープ解除済み
  index: number;   // 本文中で何番目の穴か（0始まり）
};

export function parse(body: string): Token[];
