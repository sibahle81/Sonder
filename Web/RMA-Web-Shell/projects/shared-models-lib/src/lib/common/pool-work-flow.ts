import { PoolWorkFlowItemTypeEnum } from "projects/claimcare/src/app/claim-manager/shared/enums/pool-work-flow-item-type.enum";
import { WorkPoolEnum } from "../enums/work-pool-enum";

export class PoolWorkFlow {
    poolWorkFlowId: number;
    poolWorkFlowItemType: PoolWorkFlowItemTypeEnum;
    itemId: number;
    workPool: WorkPoolEnum;
    assignedByUserId: number;
    assignedToUserId: number | null;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    instruction: string;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}