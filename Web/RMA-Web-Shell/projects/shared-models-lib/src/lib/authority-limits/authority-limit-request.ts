import { AuthorityLimitContextTypeEnum } from "../enums/authority-limits/authority-limit-context-type-enum";
import { AuthorityLimitItemTypeEnum } from "../enums/authority-limits/authority-limit-item-type-enum";
import { AuthorityLimitValueTypeEnum } from "../enums/authority-limits/authority-limit-value-type-enum";

export class AuthorityLimitRequest {
    authorityLimitItemType: AuthorityLimitItemTypeEnum;
    authorityLimitValueType: AuthorityLimitValueTypeEnum;
    authorityLimitContextType: AuthorityLimitContextTypeEnum;
    contextId: number;
    value: number;
}