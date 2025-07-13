import { ClaimStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-status.enum";
import { PreauthTypeEnum } from "../enums/preauth-type-enum";
import { PoolWorkFlowItemTypeEnum } from "projects/claimcare/src/app/claim-manager/shared/enums/pool-work-flow-item-type.enum";

export class MedicareWorkPool {
    preAuthId: number;
    healthCareProviderId: number;
    requestingHealthCareProviderId: number;
    personEventId: number;
    claimId: number;
    preAuthNumber: number;
    preAuthTypeId: number;
    preAuthStatusId: number;
    invoiceId: number;
    claimStatus: ClaimStatusEnum;
    assignedTo?: number;
    lastWorkedOnUserId?: number;
    instruction: string;
    workPoolId: number;   
    userName: string;
    userId?: number
    preAuthType: PreauthTypeEnum;
    poolWorkFlowItemType: PoolWorkFlowItemTypeEnum; 
    roleplayerId:number;
}