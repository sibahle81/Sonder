import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Address  {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isDeleted: boolean;

    countryId: number;
    cityId: number;
    provinceId: number;
    postalAddress: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    addressPostalCode: string;
    cityName: string;
    linkedId: number;
    linkedName: string;
    linkedType: string;
}
