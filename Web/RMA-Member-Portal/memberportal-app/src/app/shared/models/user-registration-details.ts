import { BaseClass } from '../../core/models/base-class.model';
import { IdTypeEnum } from '../enums/id-type.enum';
import { PortalTypeEnum } from '../enums/portal-type-enum';
import { UserAddress } from './user-address.model';
import { UserContact } from './user-contact.model';

export class UserRegistrationDetails extends BaseClass {
    userDetailsId: number;
    saId: string;
    passportNo: string;
    name: string;
    surname: string;
    dateOfBirth: Date;
    memberTypeId: number;
    userProfileType: number;
    idTypeEnum: IdTypeEnum;
    companyRegistrationNumber: string;
    healthCareProviderId: number;
    brokerFspNumber: string;
    isInternalUser: boolean;

    userAddress: UserAddress;
    userContact: UserContact;

    password?: string;
    userExistInActivationTable?: boolean;
    userActivationLinkIsActive: boolean;
    userActivationMessage: string;
    userId: number;
    rolePlayerId: number;
    passportExpiryDate?: Date;
    portalType: PortalTypeEnum;
}
