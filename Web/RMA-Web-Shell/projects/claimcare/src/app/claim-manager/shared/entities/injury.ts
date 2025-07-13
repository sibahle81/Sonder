import { InjuryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/injury-status-enum';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { InjurySeverityTypeEnum } from '../enums/injury-severity-type-enum';

export class Injury {
    injuryId: number;
    physicalDamageId: number;
    icd10CodeId: number;
    bodySideAffectedType: BodySideAffectedTypeEnum | null;
    injurySeverityType: InjurySeverityTypeEnum | null;
    injuryStatus: InjuryStatusEnum | null;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date | string;
    modifiedBy: string;
    modifiedDate: Date | string;
    icd10CodeDescription: string;
    injuryRank: number;
    mmiDays: number;
    icd10DiagnosticGroupId: number;
    icdCategoryId: number;
    icdSubCategoryId: number;
}
