import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';

export class UserCompanyMap {
    userCompanyMapId: number;
    userId: number;
    companyId: number;
    roleId: number;
    userCompanyMapStatus: UserCompanyMapStatusEnum;
    userActivationId: number;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    userName: string;
    displayName: string;
    roleName: string;
}
