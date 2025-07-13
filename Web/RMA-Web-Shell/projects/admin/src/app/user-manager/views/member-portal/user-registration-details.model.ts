import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { UserAddress } from './user-address.model';
import { UserContact } from './user-contact.model';


export class UserRegistrationDetails extends BaseClass {
    userDetailsId: number;
    saId: string;
    passportNo: string;
    name: string;
    surname: string;
    dateOfBirth: Date;
    userProfileTypeId: number;
    idTypeEnum: IdTypeEnum;
    companyRegistrationNumber: string;
    brokerFspNumber: string;
    userAddress: UserAddress;
    userContact: UserContact;
    isVopdPassed: boolean;
    passportExpiryDate?: Date;
    brokerageId: number;
    portalType:PortalTypeEnum;
}
