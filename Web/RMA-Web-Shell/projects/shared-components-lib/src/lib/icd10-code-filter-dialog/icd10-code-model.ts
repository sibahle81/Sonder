import { InjurySeverityTypeEnum } from "projects/claimcare/src/app/claim-manager/shared/enums/injury-severity-type-enum";
import { BodySideAffectedTypeEnum } from "projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum";

export class ICD10CodeModel {
    eventType: number;
    icd10CodeId: number;
    icd10DiagnosticGroupId: number;
    icd10CategoryId: number;
    icd10SubCategoryId: number;
    icd10Code: string;
    icd10DiagnosticGroupCode: string;
    icd10DiagnosticGroupDescription: string;
    icd10CategoryCode: string;
    icd10CategoryDescription: string;
    icd10SubCategoryCode: string;
    icd10SubCategoryDescription: string;
    icd10CodeDescription: string;
    displayValue: string;
    isActive: boolean;
    bodySideAffected: BodySideAffectedTypeEnum;
    bodySideComment: string;
    severity: InjurySeverityTypeEnum;
}
