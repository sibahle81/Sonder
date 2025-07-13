import { ReferralStatusEnum } from "projects/shared-models-lib/src/lib/enums/referral-status-enum";

export class ClaimReferralDetail {
  referralDetailId: number;
  ClaimId:number;
  ownerId: number;
  referralQueryTypeId: number;
  referralQuery: string;
  queryFeedBack:string;
  feedbackDate: Date;
  receivedDate: Date;
  referralRatingId: number;
  referrerUser: number;
  workFlowNotificationId: number;
  referralStatusId: ReferralStatusEnum;
  contactCenterNotificationId: number;
  resolutionTypeId: number;
  contextualData: string;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  referredToUserName: string;
}
