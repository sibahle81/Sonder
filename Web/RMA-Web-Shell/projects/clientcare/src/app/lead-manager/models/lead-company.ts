import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";
import { RegistrationTypeEnum } from "../../policy-manager/shared/enums/registrationTypeEnum";

export class LeadCompany {
  leadId: number;
  name: string;
  registrationType: RegistrationTypeEnum;
  registrationNumber: string;
  compensationFundReferenceNumber: string;
  compensationFundRegistrationNumber: string;
  industryClass: IndustryClassEnum;
  industryTypeId: number;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
