import { PolicyHolderEnum } from "projects/shared-models-lib/src/lib/enums/policy-holder-enum";
import { UnderwrittenEnum } from "projects/shared-models-lib/src/lib/enums/underwritten-enum";

export class SchemeClassification
{
    rolePlayerId: number;
    underwritten: UnderwrittenEnum;
    policyHolder: PolicyHolderEnum;
    isPartnership: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}