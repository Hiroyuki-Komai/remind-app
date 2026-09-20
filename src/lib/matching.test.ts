import { describe, it, expect } from "vitest";
import { normalizeAnswerKey,matchBlanks } from "./matching";




describe("normalize", () => {
    it("前後トリムと連続空白の圧縮", () => {
    expect(normalizeAnswerKey(" 微 分 ")).toBe("微 分");
    });
});


describe("matchBlanks", () => {
    it("pass1 test一致検証", () => { 
    const oldBlanks = [
      { id: "b1", ordinal: 0, answerKey: "金属" },
      { id: "b2", ordinal: 1, answerKey: "非金属" },
    ]

        const newTokens = [
      { index: 0, answer: "金属" },
      { index: 1, answer: "非金属" },
    ]
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched[0].oldBlank.id).toBe("b1");
    expect(result.matched[1].oldBlank.id).toBe("b2");
    expect(result.matched[0].oldBlank.answerKey).toBe("金属");
    expect(result.matched[1].oldBlank.answerKey).toBe("非金属");
    //unmatchedNew / unmatchedOld が空であることの検証
    expect(result.unmatchedNew.length).toBe(0);
    expect(result.unmatchedOld.length).toBe(0);
    });

    it("pass1 test不一致検証", () => { 
    const oldBlanks = [{ id: "b1", ordinal: 0, answerKey: "金属" }];
    const newTokens = [{ index: 0, answer: "非金属" }];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched.length).toBe(0);
    expect(result.unmatchedNew.length).toBe(1);
    expect(result.unmatchedOld.length).toBe(1);
    });

    it("pass1 test正規化検証", () => { 
    const oldBlanks = [{ id: "b1", ordinal: 0, answerKey: "金 属" }];
    const newTokens = [{ index: 0, answer: " 金　属 " }];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched.length).toBe(1);
    });

    it("pass1 test 新トークンが１つ余る場合", () => { 
    const oldBlanks = [{ id: "b1", ordinal: 0, answerKey: "金属" }];
    const newTokens = [
      { index: 0, answer: "金属" },
      { index: 1, answer: "非金属" },
    ];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched.length).toBe(1);
    expect(result.unmatchedNew.length).toBe(1);
    expect(result.unmatchedOld.length).toBe(0);
    });

    it("pass1 test 旧トークンが１つ削除済みの場合", () => { 
    const oldBlanks = [
      { id: "b1", ordinal: 0, answerKey: "金属" },
      { id: "b2", ordinal: null, answerKey: "非金属" },
    ];
    const newTokens = [{ index: 0, answer: "金属" }];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched.length).toBe(1);
    expect(result.unmatchedOld.length).toBe(1);//ordinal=nullの旧データはループfor(const token of newTokens){}に入らない
    });

it("pass2 test 前に穴が1つ挿入されて番号が後ろにずれた場合", () => { 
    const oldBlanks = [{ id: "b1", ordinal: 0, answerKey: "金属" }];
    const newTokens = [
      { index: 0, answer: "非金属" },
      { index: 1, answer: "金属" },//前に穴が1つ挿入されて番号が後ろにずれた
    ];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched.length).toBe(1);
    expect(result.matched[0].oldBlank.id).toBe("b1");
    expect(result.matched[0].newToken.index).toBe(1);
    })

    
it("pass2 test 距離が同じ場合", () => { 
    const oldBlanks = [
      { id: "b1", ordinal: 0, answerKey: "微分" },
      { id: "b2", ordinal: 2, answerKey: "微分" },
    ];
    const newTokens = [{ index: 1, answer: "微分" }];
    const result = matchBlanks(oldBlanks, newTokens);
    expect(result.matched[0].oldBlank.id).toBe("b1");
    })
    /*
    新トークンのindex=1から見て、ordinal=0とordinal=2はどちらも距離1。
    仕様どおりなら ordinal の小さい "b1" が選ばれる。
    */

    it("pass2 test :answerKey が一致する oldデータ が1つもない場合", () => { 
      const oldBlanks = [{ id: "b1", ordinal: 0, answerKey: "金属" }];
      const newTokens = [{ index: 1, answer: "積分" }];
      const result = matchBlanks(oldBlanks, newTokens);
      expect(result.matched.length).toBe(0);
      expect(result.unmatchedOld.length).toBe(1);
      expect(result.unmatchedNew.length).toBe(1);
    })
});