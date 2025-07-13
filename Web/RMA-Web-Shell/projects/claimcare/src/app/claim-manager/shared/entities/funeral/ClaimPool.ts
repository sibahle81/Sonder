import { STPExitReasonEnum } from "projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum";
import { InjurySeverityTypeEnum } from "../../enums/injury-severity-type-enum";
import { ClaimLiabilityStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-liability-status.enum";
import { ClaimStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-status.enum";
import { EventTypeEnum } from "../../enums/event-type-enum";


export class ClaimPool {
  underwriterId: number;
  pdPercentage: number;
  instruction: string;
  claimId: number;
  eventId: number;
  personEventId: number;
  claimNumber: string;
  personEventReference: string;
  eventType: EventTypeEnum;
  assignedTo?: number;
  claimStatus: ClaimStatusEnum;
  liabilityStatus: ClaimLiabilityStatusEnum;
  diseaseDescription: string;
  dateCreated?: Date;
  priority: string;
  memberName: string;
  insuredLife: string;
  identificationNumber: string;
  personEventCreatedBy: string;
  lastModifiedBy: string;
  injuryType: InjurySeverityTypeEnum;
  employeeNumber: string;
  employeeIndustryNumber: string;
  lastWorkedOnUserId?: number;
  isTopEmployer: boolean;
  included: boolean;
  companyName: string;
  companyReferenceNumber: string;
  stpExitReason?: STPExitReasonEnum;
  stpExitReasonDescription?: string;
  userName: string;
  userId?: number
  application: string;
  bucketClassId: number;
  investigationRequired: boolean;
  employerRolePlayerId: number;
  employeeRolePlayerId: number;
}
