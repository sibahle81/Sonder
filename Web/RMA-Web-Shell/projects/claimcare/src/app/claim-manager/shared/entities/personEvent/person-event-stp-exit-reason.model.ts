import { StpExitReason } from "./stp-exit-reason";

export class PersonEventStpExitReason  {
    claimStpExitReasonId: number;
    personEventId: number;
    stpExitReasonId: number;

    stpExitReason: StpExitReason;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date | string;
    modifiedBy: string;
    modifiedDate: Date | string;
}
