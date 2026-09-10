import { describe, test, expect } from "vitest";
import { parse, type TextToken, type BlankToken } from "./parser"; // parse()自体は自分で実装

// 期待値組み立て用ヘルパー。raw省略時はvalueと同一（エスケープなしの通常テキスト用）
function text(value: string, raw: string = value): TextToken {
  return { kind: "text", raw, value };
}

function blank(answer: string, raw: string, index: number): BlankToken {
  return { kind: "blank", raw, answer, index };
}

describe("parse() — §2.5 異常系とその解釈", () => {
  test.each([
    ["〈微分〉", [blank("微分", "〈微分〉", 0)]],
    ["〈A", [text("〈A")]],
    ["〈 微分 〉", [blank("微分","〈 微分 〉",0)]],
    ["〈〉", [text("〈〉")]],

  ] as const)("%s", (input, expected) => {
    expect(parse(input)).toEqual(expected);
  });
});
