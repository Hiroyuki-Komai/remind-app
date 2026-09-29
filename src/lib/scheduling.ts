//lastReviewedAtが更新されるのはreviewCardの完了時だけ
//intervalStep/dueDate/masteredAtの更新と ReviewLog の追記

const INTERVAL_DAYS = [1, 3, 7, 14, 30]; // 添字 = intervalStep


export function nextSchedule(intervalStep: number , hasErrorBlank: boolean  , now: Date ): {intervalStep: number, dueDate: Date, masteredAt: Date | null} {
  // TODO 1. hasErrorBlank なら：step 0、1日後、masteredAt は null
    if(hasErrorBlank){
        return { intervalStep: 0, dueDate: addDays(now,INTERVAL_DAYS[0]), masteredAt: null };
    }
  // TODO 2. intervalStep === 5 なら：定着完了（step 5 のまま、dueDate は now、masteredAt は now）
    if(intervalStep === 5){
        return { intervalStep: intervalStep, dueDate: now, masteredAt: now };
    }
  // TODO 3. それ以外：INTERVAL_DAYS[intervalStep] 日後、step +1、masteredAt は null
    return { intervalStep: intervalStep + 1, dueDate: addDays(now, INTERVAL_DAYS[intervalStep]), masteredAt: null };
}


export function addDays(now: Date, n: number): Date{
    const result = new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
    return result;
}