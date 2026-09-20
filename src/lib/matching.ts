type BlankLike = {
  id: string;
  ordinal: number | null;
  answerKey: string;
};

export function normalizeAnswerKey(s: string): string {
    const normalized = s.normalize("NFC").trim().replace(/\s+/g, " ")
    return normalized; 
}

type MatchResult = {
  matched: { oldBlank: BlankLike; newToken: BlankToken }[];  // 確定したペア
  unmatchedNew: BlankToken[];                   // 未確定の新トークン
  unmatchedOld: BlankLike[];                        // 未確定の旧Blank
};

//ここでいう正規化：連続する空白を半角スペース1つに畳む処理
//oldBlanks : DBから持ってきた、そのカードの全Blankレコード。(id / ordinal / answerKey / deletedAt などを持つ)
//newTokens : 今回パースした結果のうち kind === "blank" のトークン列。


export function matchBlanks(oldBlanks: BlankLike[], newTokens: BlankToken[]): MatchResult {
  // Pass1_1. oldByOrdinal を作る（今書けている部分）
   const oldByOrdinal = new Map<number, BlankLike>();
    for(const b of oldBlanks){
        if(b.ordinal === null) continue;//このMapにnullは入れない。Pass 1 は ordinal 一致が条件なので、削除済み(null)は構造的に候補になり得ない
        /*
         @@unique([cardId, ordinal])のため、同一card内ではordinalは重複しない
         ➔厳密には@@unique が保証しているのは重複しないことまでで、
         null が削除済みを表すのは仕様§3.3（Pass 3で ordinal = null と deletedAt = now を同時に
         セットする）から来ている。
        */ 
        oldByOrdinal.set(b.ordinal, b);
    }
  // Pass1_2. 蓄積用の入れ物を3つ用意（matched / unmatchedNew / matchedOldIds）
    const matched: MatchResult["matched"] = [];
    //略さず書くと    const matched: { oldBlank: Blank; newToken: BlankToken }[] = [];
    //MatchResult["matched"] で、その型のプロパティの型を取り出せる）
    let unmatchedNew: MatchResult["unmatchedNew"] = [];
    const matchedOldIds = new Set<string>();//() は new Set() のコンストラクタ呼び出しの括弧


// Pass1_3. newTokens を回す ← ここが Pass 1 本体

for(const token of newTokens){
    const normedAnswerKey = normalizeAnswerKey(token.answer)
//新の方の答えを正規化
    const oldBlank = oldByOrdinal.get(token.index);
if (oldBlank !== undefined && normedAnswerKey === oldBlank.answerKey) {
        matched.push({ oldBlank:oldBlank, newToken:token });
        //: の左がプロパティ名（MatchResult で決めた名前）、右が値として入れる変数
        matchedOldIds.add(oldBlank.id);
    }else{
        unmatchedNew.push(token);
    }
//Map<number, Blank> の .get() は、キーが存在すれば Blank、無ければ undefined を返します。
}



  // Pass1_4. ループを抜けてから unmatchedOld を filter で作る
let unmatchedOld = oldBlanks.filter((b) => !matchedOldIds.has(b.id));
/*
※Pass2以降で再代入するのでletに

filter(関数) — oldBlanks の要素を1つずつその関数に渡し、true が返った要素だけを集めた新しい配列を返します。Javaの stream().filter(...).toList() に相当しますが、JSは配列に直接メソッドが生えているので stream() も toList() も要りません。

!matchedOldIds.has(b.id) — has() はSetに含まれるかの真偽値を返します（Javaの contains()）。! で反転しているので、「確定済みIDに含まれないなら残す」という条件になります。

つまり全体では「oldBlanks を1件ずつ見て、そのidが matchedOldIds に無いものだけ残す」という意味です。
*/


//Pass_2
    const matchedNewIds = new Set<number>();
for(const n of unmatchedNew){
    const normedAnswerKey = normalizeAnswerKey(n.answer);//新データの答えを正規化
    let best: BlankLike | null = null;//一時旧ordinalの最小値を保持する変数
    for(const o of unmatchedOld){
        if(matchedOldIds.has(o.id) || normedAnswerKey !== o.answerKey || o.ordinal === null){
            continue;
        }
        const dist = Math.abs(o.ordinal - n.index);
        const bestDist = best === null ? null : Math.abs(best.ordinal - n.index);
        if(best === null || dist < bestDist || ((dist === bestDist) && o.ordinal < best.ordinal)){
            best = o;
        }
    }
    if (best !== null) {
        matched.push({ oldBlank: best, newToken: n });
        matchedOldIds.add(best.id);
        matchedNewIds.add(n.index);
    }
} 
unmatchedOld = unmatchedOld.filter((b) => !matchedOldIds.has(b.id));
unmatchedNew = unmatchedNew.filter((b) => !matchedNewIds.has(b.index));









  // 5. return
return { matched, unmatchedNew, unmatchedOld };
 
}

/*
const matchedOldIds = new Set<number>();

forで、newtokenを回す{
    const oldBlank = oldByOrdinal.get(newToken.index);
    if (oldBlank !== undefined && newToken.answer === oldBlank.answerKey) {
        matched.push({ oldBlank, newToken });
        matchedOldIds.add(oldBlank.id);
    }else{
        unmatchedNew.push(newToken);
    }
    matchedOldIds.add(oldBlank.id);
const unmatchedOld = oldBlanks.filter((b) => !matchedOldIds.has(b.id));
}
return { matched, unmatchedNew, unmatchedOld };
*/