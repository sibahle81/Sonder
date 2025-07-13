import { ReferralStatusEnum } from "./referral-status-enum";

export class ReferralStatusChangeAudit {
    referralStatusChangeAuditId: number;
    referralId: number;
    referralStatus: ReferralStatusEnum;
    modifiedByUserId: number;
    modifiedDate: Date;
}
