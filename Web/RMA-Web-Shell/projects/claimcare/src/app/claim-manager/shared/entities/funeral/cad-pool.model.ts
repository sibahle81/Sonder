import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { EventTypeEnum } from '../../enums/event-type-enum';

export class CadPool {
  personEventId: number;
  claimNumber: string;
  description: string;
  eventNumber: string;
  dateCreated: Date;
  lifeAssured: string;
  personEventStatusId: number;
  personEventStatusName: string;
  identificationNumber: string;
  personEventCreatedBy: string;
  personEventAssignedTo: string;
  userName: string;
  userSLAHours: string;
  overAllSLAHours: string;
  lastModifiedBy: string;
  stpExitReason: STPExitReasonEnum;
  bucketClassName: string;
  claimTypeName: ClaimTypeEnum;
  industryClassName: IndustryClassEnum;
  isRoadAccident: boolean;
  priority: string;
  application: string;
  claimId: number;
  lastWorkedOnUserId: number;
  wizardId: number;
  personEventReference: string;
  claimStatusDisplayName: string;
  claimStatusDisplayDescription: string;
  wizardUserId: any;
  workPoolId: number;
  assignedToUserId: number;
  claimStatusId: number;
  userId: number;
  diseaseDescription: string;
  diseaseTypeID: number;
  liabilityStatus: ClaimLiabilityStatusEnum;
  eventType: EventTypeEnum  
}
