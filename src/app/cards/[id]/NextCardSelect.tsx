"use client";
import { setNextCard } from "@/app/actions/card";


export default function NextCardSelect({ nextCardId, cardId, candidates }: { nextCardId: string | null; cardId: string; candidates: {id: string, label: string}[] }) {

const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    //空文字だったらnullに変換
    const nextcard = value || null;
    //サーバーアクションを呼んでDB更新
    await setNextCard(cardId,nextcard);
};


    return(
     <select defaultValue ={nextCardId ?? ""} onChange={handleChange} 
     className="rounded border border-gray-500 bg-gray-800 px-2 py-1 [color-scheme:dark]" 
     >
         <option value="">次のカード：登録なし</option>
        {candidates.map((c) => (
             <option key={c.id} value={c.id}>{c.label}</option>
        ))}
     </select>
    );
}

