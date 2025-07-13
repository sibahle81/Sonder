import { AddressTypeEnum } from "projects/shared-models-lib/src/lib/enums/address-type-enum";

export class LeadAddress {
  addressId: number;
  leadId: number;
  addressType: AddressTypeEnum;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  province: string;
  countryId: number;

  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
