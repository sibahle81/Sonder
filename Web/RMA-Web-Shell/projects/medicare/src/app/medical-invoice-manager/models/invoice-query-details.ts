import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { RolePlayerItemQueryTypeEnum, RolePlayerQueryItemTypeEnum, RolePlayerItemQueryCategoryEnum, 
    RolePlayerItemQueryStatusEnum } from "projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums";

export class InvoiceQueryDetails extends BaseClass {
    queryReferenceNumber: string;
    rolePlayerItemQueryType: RolePlayerItemQueryTypeEnum;
    rolePlayerId: number;
    rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum;
    rolePlayerItemQueryCategory: RolePlayerItemQueryCategoryEnum;
    rolePlayerItemQueryStatus: RolePlayerItemQueryStatusEnum;
    queryDescription: string;
    queryResponse: string;
}