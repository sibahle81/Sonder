import { AuthenticationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authentication-type-enum';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { UserLoginTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-login-type-enum';
import { UserProfileTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-profile-type-enum';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { UserContact } from './user-contact';

export class UserDetails {
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
    authenticationType: AuthenticationTypeEnum;
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
    rolePlayerId: number;
    userProfileType: UserProfileTypeEnum;

    userContact: UserContact;
}
