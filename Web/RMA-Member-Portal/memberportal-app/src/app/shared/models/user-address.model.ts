import { AddressTypeEnum } from 'src/app/shared/enums/address-type.enum';
import { BaseClass } from '../../core/models/base-class.model';

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
