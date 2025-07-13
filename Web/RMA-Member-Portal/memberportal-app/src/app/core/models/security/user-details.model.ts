import { BaseClass } from '../base-class.model';
import { AuthenticationTypeEnum } from './../../../shared/enums/authentication-type.enum';
import { Role } from './role.model';
import { UserLoginTypeEnum } from 'src/app/shared/enums/user-login-type.enum';
import { PortalTypeEnum } from 'src/app/shared/enums/portal-type-enum';

export class UserDetails extends BaseClass {
    username: string;
    surname: string;
    email: string;
    password: string;
    name: string;
    token: string;
    userTypeId: number;
    tenantId: number;
    roleId: number;
    roleName: string;
    displayName: string;
    dateViewed: Date;
    status: string;
    preferences: string;
    clientId: number;
    permissionIds: number[];
    role: Role;


    authenticationType: AuthenticationTypeEnum
    failedAttemptCount: number | null;
    failedAttemptDate: Date;
    plainTextPassword: string;
    isApproved: boolean;
    hashAlgorithm: string;
    passwordChangeDate: Date;
    telNo: string;
    isInternalUser: boolean;
    ipAddress: string;
    userExistInActivationTable: boolean;
    userLoginTypeId: UserLoginTypeEnum;
    portalType: PortalTypeEnum;

    // Optional properties
    id_token?: string;
    access_token?: string;
    token_type?: string;
    scope?: string;
}
