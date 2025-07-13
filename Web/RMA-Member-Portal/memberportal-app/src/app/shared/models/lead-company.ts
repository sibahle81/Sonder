export class LeadCompany {
  companyId: number;
  leadId: number;
  name: string;
  registrationTypeId: number;
  registrationNumber: string;
  compensationFundReferenceNumber: string;
  compensationFundRegistrationNumber: string;
  industryClassId: number;
  industryTypeId: number;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
