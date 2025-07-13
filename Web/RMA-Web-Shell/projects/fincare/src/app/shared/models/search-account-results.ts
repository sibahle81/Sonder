import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";

export class SearchAccountResults {
    rolePlayerId: number;
    displayName: string;
    emailAddress: string;
    finPayeNumber: string;
    clientReference: string;
    policyId: number;
    policyNumber: string;
    industryClassName: string;
    rmaBankAccountNumber: string;
    industryClass: IndustryClassEnum
  }
