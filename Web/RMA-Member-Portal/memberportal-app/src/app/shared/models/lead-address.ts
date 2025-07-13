export class LeadAddress {
  addressId: number;
  leadId: number;
  addressTypeId: string;
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
