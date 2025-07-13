import { PoolWorkFlowItemTypeEnum } from "projects/claimcare/src/app/claim-manager/shared/enums/pool-work-flow-item-type.enum";

export class PoolWorkFlowRequest {
    itemType: PoolWorkFlowItemTypeEnum;
    itemId: number;
}