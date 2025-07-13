import { ClaimReferralTypeLimitGroupEnum } from "./claim-referral-type-limit-group-enum";

export class ClaimReferral {
    claimReferralId: number;
    referralType: ClaimReferralTypeLimitGroupEnum;
    claimNumber: string;
    insuredLifeName: string;
    contactNumber: string;
    message: string;
    createdBy: number;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
 
}