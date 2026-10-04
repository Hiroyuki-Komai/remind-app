import { describe, it, expect } from "vitest";
import { nextSchedule } from "./scheduling";

describe("scheduling", () => {
    const now = new Date("2026-10-01T00:00:00Z");
        it("step0で正解すると、step1・翌日になる", () => {
    expect(nextSchedule(0,false,now)).toEqual({intervalStep: 1,dueDate: new Date("2026-10-02T00:00:00Z"), masteredAt: null});
    });
        it("step4で正解すると、step5・30日後になる", () => {
    expect(nextSchedule(4,false,now)).toEqual({intervalStep: 5,dueDate: new Date("2026-10-31T00:00:00Z"), masteredAt: null});
    });
        it("step5で正解すると、step5・定着済みになる", () => {
    expect(nextSchedule(5,false,now)).toEqual({intervalStep: 5,dueDate: now, masteredAt: now});
    });
        it("step5で誤答すると、step0・翌日になる", () => {
    expect(nextSchedule(5,true,now)).toEqual({intervalStep: 0,dueDate: new Date("2026-10-02T00:00:00Z"), masteredAt: null});
    });
        it("step2で誤答すると、step0・翌日になる", () => {
    expect(nextSchedule(2,true,now)).toEqual({intervalStep: 0,dueDate: new Date("2026-10-02T00:00:00Z"), masteredAt: null});
    });
});

/*
入力 stepは？ dueDateは？ masteredAtは？
(0,false) 1 "2026-10-02T00:00:00Z" null
(4,false) 5 "2026-10-31T00:00:00Z" null
(5,false) 5 dueDate:now, masteredAt:now,step:5
(5,true) 0 "2026-10-02T00:00:00Z" null
(2,true) 0 "2026-10-02T00:00:00Z" null

*/