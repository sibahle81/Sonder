import { CompensationFundStatusEnum } from "../enums/compensation-fund-status-enum";
export class Company {
  rolePlayerId: number;
  name: string;
  companyRegNo: string;
  code: string;
  effectiveDate: Date;
  companyIdType: number;
  contactPersonName: string;
  contactDesignation: string;
  contactTelephone: string;
  contactMobile: string;
  contactEmail: string;
  referenceNumber: string;
  vatRegistrationNo: string;
  industryClass: number;
  companyLevel: number;
  linkedCompanyId: number;
  compensationFundStatus: CompensationFundStatusEnum;
  compensationFundReferenceNumber: string;
  idNumber: string;
  industryId: number;
  natureOfBusinessId: number;
}
