import { ModuleTypeEnum } from "../enums/module-type-enum";
import { PagedRequest } from "../pagination/PagedRequest";
import { ReferralItemTypeEnum } from "./referral-item-type-enum";
import { ReferralStatusEnum } from "./referral-status-enum";

export class ReferralSearchRequest {
    sourceModuleType: ModuleTypeEnum;
    targetModuleType: ModuleTypeEnum;
    assignedToRoleId: number;
    assignedByUserId: number;
    assignedToUserId: number;
    referralStatus: ReferralStatusEnum;
    referralItemType: ReferralItemTypeEnum;
    itemId: number;
    
    pagedRequest: PagedRequest;
}
