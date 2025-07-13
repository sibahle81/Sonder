export class BrokerageAddress {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isDeleted: boolean;

    countryId: number;
    cityId: number;
    provinceId: number;

    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    city: string;
    province: string;
    addressType: number;
}
