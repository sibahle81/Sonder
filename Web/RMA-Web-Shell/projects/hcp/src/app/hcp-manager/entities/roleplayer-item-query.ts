import { RolePlayerItemQueryItem } from './roleplayer-item-query-item';
import { 
            RolePlayerItemQueryTypeEnum
            , RolePlayerQueryItemTypeEnum
            , RolePlayerItemQueryCategoryEnum
            , RolePlayerItemQueryStatusEnum

       } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums'
import { RolePlayerItemQueryResponse } from './roleplayer-item-query-response';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class RolePlayerItemQuery extends BaseClass
{
    queryReferenceNumber: string;
    rolePlayerItemQueryType: RolePlayerItemQueryTypeEnum;
    rolePlayerId: number;
    rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum;
    rolePlayerItemQueryCategory: RolePlayerItemQueryCategoryEnum;
    rolePlayerItemQueryStatus: RolePlayerItemQueryStatusEnum;
    queryDescription: string;
    rolePlayerItemQueryItems: RolePlayerItemQueryItem[];
    rolePlayerItemQueryResponses: RolePlayerItemQueryResponse[];
}