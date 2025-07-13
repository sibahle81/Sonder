import { ReferralRatingEnum } from "./referral-rating-enum";

export class ReferralPerformanceRating {
    referralPerformanceRatingId: number;
    referralRating: ReferralRatingEnum;
    comment: string;
    isDeleted: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    createdBy: string;
    createdDate: Date;
}
