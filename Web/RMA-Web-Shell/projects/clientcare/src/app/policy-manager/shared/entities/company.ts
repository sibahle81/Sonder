import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { CompensationFundStatusEnum } from './../../../../../../shared-models-lib/src/lib/enums/compensation-fund-status-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { SchemeClassification } from './scheme-classification';

export class Company {
  rolePlayerId: number;
  name: string;
  companyRegNo: string;
  code: string;
  effectiveDate: Date;
  companyIdType: CompanyIdTypeEnum;
  contactPersonName: string;
  contactDesignation: string;
  contactTelephone: string;
  contactMobile: string;
  contactEmail: string;
  referenceNumber: string;
  vatRegistrationNo: string;
  industryClass: IndustryClassEnum;
  companyLevel: CompanyLevelEnum;
  linkedCompanyId: number;
  compensationFundStatus: CompensationFundStatusEnum;
  compensationFundReferenceNumber: string;
  idNumber: string;
  industryId: number;
  isTopEmployer: boolean;
  natureOfBusiness: string; 
  schemeClassification: SchemeClassification;
}
