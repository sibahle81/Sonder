import { AuthorityLimitItemTypeEnum } from "../enums/authority-limits/authority-limit-item-type-enum";
import { Permission } from "../security/permission";

export class AuthorityLimitItemTypePermissions {
    authorityLimitItemType: AuthorityLimitItemTypeEnum;
    permissions: Permission[];
}