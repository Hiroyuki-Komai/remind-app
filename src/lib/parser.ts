export type Token = TextToken | BlankToken;
export type TextToken = {
  kind: "text";
  raw: string;    // 原文そのまま（エスケープ('\')解除前） 例:\<x>
  value: string;  // 表示文字列（エスケープ解除後）例:<x>
};

export type BlankToken = {
  kind: "blank";
  raw: string;     // 原文そのまま'〈' と '〉' を含む
  answer: string;  // 表示文字列。区切り文字を除き、前後の空白をトリムし、エスケープ解除済み
  index: number;   // 本文中で何番目の穴か（0始まり）
};

const ESCAPABLE = new Set(["〈", "〉", "《", "》", "\\"]);

//***********parser§4表面作成で使う****************
export type BlankStats = {
  id: string;
  ordinal: number;   // 生存中のBlankは常に非null（§3.3の書き込み順の帰結：alive⇔ordinal確定）
  missCount: {
    current: number;
    max: number;
  };
};

export type FrontBlank = {
  kind: "blank";
  index: number;
  blankId: string;
  missCount: { 
    current: number; 
    max: number 
  };
};
export type FrontToken = TextToken | FrontBlank;
//BlankToken との違いは「answer を持たず、
// blankId と missCount を持つ」こと
//export function toFront(tokens: Token[], stats: BlankStats[]): FrontToken[];
//************************************************

export function parse(body: string): Token[] {
  const tokens: Token[] = [];

const OUTSIDE = 0;
const INSIDE = 1;
let state = OUTSIDE
let open = -1;
let textStart = 0;
let buffer = '';
let blankNum = 0;
for (let i = 0; i < body.length; i++){
    const c = body[ i ];
    if(state === OUTSIDE){
        switch (c) {
            case "\\":
              if(ESCAPABLE.has(body[ i + 1 ])){
                buffer += body[ i + 1 ];
                i++;//escapeする為（読み飛ばし）
              }else{//body[ i + 1 ] === その他
                buffer += c;
              }
            break;
            
            case "〈":
              if(buffer !== ""){
                tokens.push({
                  kind: "text",
                  raw: body.slice(textStart, i),
                  value: buffer,
                });
              }
              open = i;
              textStart = i;
              buffer = '';
              state = INSIDE;
            break;

            default:
            buffer += c;
            break;
            }
    }else if(state === INSIDE){
        switch (c) {
          case "\\":
              if(ESCAPABLE.has(body[ i + 1 ])){
                buffer += body[ i + 1 ];
                i++;//escapeする為（読み飛ばし）
              }else{//body[ i + 1 ] === その他
                buffer += c;
              }
            break;

            case "〉":
            if(buffer !== "" && blankNum < 200){
                tokens.push({
                    kind: "blank",
                    raw: body.slice(open, i + 1 ),
                    answer: buffer.trim(),
                    index: blankNum,
                });
                buffer = "";
                textStart =  i + 1;
                blankNum++;
                state = OUTSIDE;
                
            }else if(buffer !== "" && blankNum >= 200){
              tokens.push({
                kind: "text",
                raw: body.slice(open, i+1),
                value: "〈" + buffer + "〉",
              });
              buffer = "";
              textStart =  i + 1;
              state = OUTSIDE;

            }else{
                //溜まったテキストが空
                    buffer = body.slice(open, i + 1);
                    state = OUTSIDE;
            }
        break;

        case "〈":
          tokens.push({
            kind: "text",
            raw: body.slice(open, i),
            value: "〈" + buffer,
          });
        buffer = '';
        open = i;
        break;

        case "\n":
          buffer = body.slice(open, i + 1);
          state = OUTSIDE
        break;

        default:
        buffer += c;
        break;
        
        }
    }
}
//EOFのとき
    if(state === OUTSIDE){
     //テキストを確定
      const raw = body.slice(textStart);
      if (raw !== "") {
        tokens.push({
        kind: "text",
        raw: raw,
        value: buffer,
        });
      }
    }else{//state === INSIDE
              tokens.push({
            kind: "text",
            raw: body.slice(open),
            value: "〈" + buffer,
        });
    }
return tokens

};



//⦿toFront関数は「本文の生データ（答え入り）」を、
// 「カード表面を描画するための 答え抜き＋ID付きのデータ」に変換する関数。
export function toFront(tokens: Token[], stats: BlankStats[]): FrontToken[] {
  const byOrdinal = new Map(stats.map((s) => [s.ordinal, s]));
//⦿これをわざわざやったのは、後々getで取るため 

//map（配列の各要素を加工して新しい配列を作る）が使われていて、
// BlankStatsの配列を「[ordinal, BlankStatsその物]という2要素の配列
// （ペア）」の配列に変換している。
//これをnew Map(...)に渡すことで、
// Map<number, BlankStats>が組み立てられる


//⦿返り値部分を作っていくフェーズ：
//Token型をまずBlankToken型に絞り、
// ここでBlankToken.indexにアクセス可能になったので、
// BlankStats型配列のうち、ordinal===BlankToken.indexとなる要素だけを残す
  return tokens.map((t): FrontToken  => {
    //目的は「tokens（元の配列）を、1件ずつFrontToken
    // らしきものに変換した、新しい配列を作る」こと

    if (t.kind === "text") return t;
    //これで「kindが"text"のケース」はすでにreturnして
    //抜けている。なので、この行より下に到達した時点で、
    //tはBlankTokenだとTSに絞り込まれている(kindによる型の絞込み)　※tはToken型なのでTextToken型またはBlankToken型だった。

    const stat = byOrdinal.get(t.index);
    //byOrdinal.get(t.index)は、戻り値がBlankStats | undefined
    //t自体の型はtokens: Token[]の要素なので、最初はToken型
    //ただし次行でtはBlankTokenだとTSに絞り込まれている。
    //t.indexはBlankTokenが持つプロパティなので、
    // ここで初めてt.indexにアクセスできる。

    //※byOrdinal.get(...)の戻り値の型は、
    // 渡した引数（t.index）とは無関係：
    //.get(...)が何を返すかは、byOrdinalが
    // Map<number, BlankStats>として作られている以上、
    // 常にBlankStats | undefined

    if (!stat) {
      throw new Error(`ordinal ${t.index} に対応する BlankStats がありません`);
      //throwは「これ以上正常に処理を続けられない異常事態だ」
      // と宣言して、関数の実行をその場で止める。

      //statがundefined（＝見つからなかった）のとき、
      // !statはtrueになる。
    }

    
    // ⦿ここで初めて返り値FrontBlank を組み立てる（kind, index, blankId, missCount）
    return {
      kind: "blank",
      index: t.index,
      blankId: stat.id,
      missCount: stat.missCount,
    };

    //⦿tokens（parse()の出力）の時点で、
    // すでに「地の文（text）」と
    // 「穴（blank）」はバラバラのトークンに分かれている。
    // toFront関数はその1個ずつを見て、
    //➊textトークンなら：何もせずそのままreturn t（変換不要）

    //➋blankトークンなら：answerを捨ててblankId／missCountを
    // 付けた新しいオブジェクトに作り直してreturnという処理をしている

  });
}