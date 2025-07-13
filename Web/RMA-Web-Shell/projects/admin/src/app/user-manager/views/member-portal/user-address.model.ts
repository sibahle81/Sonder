import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';


export class UserAddress extends BaseClass {
    userAddressId: number;
    addressType: AddressTypeEnum;
    address1: string;
    address2?: string;
    address3?: string;
    postalCode: string;
    city: string;
    province: string;
    countryId: number;
}
