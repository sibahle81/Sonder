import { InjurySeverityTypeEnum } from "projects/claimcare/src/app/claim-manager/shared/enums/injury-severity-type-enum";
import { BodySideAffectedTypeEnum } from "projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum";

export class ICD10Code {
     icd10CodeId: number;
     icd10Code: string;
     icd10CodeDescription: string;
     icd10SubCategoryId: number;
     icd10SubCategoryDescription: string;
     icd10DiagnosticGroupId: number;
     icd10CategoryId: number;
     bodySideAffected: BodySideAffectedTypeEnum;
     severity: InjurySeverityTypeEnum;
}