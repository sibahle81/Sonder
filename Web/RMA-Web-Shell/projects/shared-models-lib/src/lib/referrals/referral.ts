import { ReferralFeedback } from "./referral-feedback";
import { ReferralItemTypeEnum } from "./referral-item-type-enum";
import { ReferralNatureOfQuery } from "./referral-nature-of-query";
import { ReferralPerformanceRating } from "./referral-performance-rating";
import { ReferralStatusChangeAudit } from "./referral-status-change-audit";
import { ReferralStatusEnum } from "./referral-status-enum";
import { ReferralTypeEnum } from "./referral-type-enum";

export class Referral {
    referralId: number;
    referralReferenceNumber: string;
    sourceModuleTypeId: number;
    referralType: ReferralTypeEnum;
    referralNatureOfQueryId: number;
    referralItemType: ReferralItemTypeEnum;
    itemId: number;
    linkUrl: string;
    comment: string;
    referralStatus: ReferralStatusEnum;
    referralPerformanceRatingId: number;
    targetModuleTypeId: number;
    assignedByUserId: number;
    assignedToRoleId: number;
    assignedToUserId: number;
    referralItemTypeReference: string;

    referralNatureOfQuery: ReferralNatureOfQuery;
    referralPerformanceRating: ReferralPerformanceRating;
    referralFeedbacks: ReferralFeedback[];
    referralStatusChangeAudits: ReferralStatusChangeAudit[];

    isDeleted: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    createdBy: string;
    createdDate: Date;
}