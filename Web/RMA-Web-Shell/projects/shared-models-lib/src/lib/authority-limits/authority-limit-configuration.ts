import { AuthorityLimitConfigurationTypeEnum } from "../enums/authority-limits/authority-limit-configuration-type-enum";
import { AuthorityLimitItemTypeEnum } from "../enums/authority-limits/authority-limit-item-type-enum";
import { AuthorityLimitValueTypeEnum } from "../enums/authority-limits/authority-limit-value-type-enum";

export class AuthorityLimitConfiguration {
    authorityLimitConfigurationId: number;
    authorityLimitConfigurationType: AuthorityLimitConfigurationTypeEnum;
    authorityLimitValueType: AuthorityLimitValueTypeEnum;
    authorityLimitItemType: AuthorityLimitItemTypeEnum;
    value: number;
    permissionName: string;

    isDeleted: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    CreatedBy: string;
    CreatedDate: Date;
}