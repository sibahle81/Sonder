import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { CommutationCCStatusEnum } from "../lib/enums/commutation-cc-status-enum";
import { CommutationReasonEnum } from "../lib/enums/commutation-reason-enum";
import { CommutationStatusEnum } from "../lib/enums/commutation-status-enum";
import { CommutationExpenditure } from "./commutation-expenditure.model";

export class Commutation extends BaseClass {
    ledgerId: number;
    reference: string;
    requestedDate: Date;
    commutationStatusId: CommutationStatusEnum;
    commutationReasonId: CommutationReasonEnum;
    commutedAmount: number;
    commutationAmount: number;
    ccStatusId: CommutationCCStatusEnum;
    ccApprovalDate: string;
    ccSchedule: number;
    commutationAmountRequested: number;
    isRecommended: boolean;
    comment: string;
    mpfPension: number;
    salary: number;
    otherIncome: number;
    commutationPaye: number;
    fraudComment: string;
    commutationExpenditures: CommutationExpenditure[] = [];
}
