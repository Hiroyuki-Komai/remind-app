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
/*
            case "〉":
            buffer = '';
            break;
*/
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
            if(buffer !== ""){
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
