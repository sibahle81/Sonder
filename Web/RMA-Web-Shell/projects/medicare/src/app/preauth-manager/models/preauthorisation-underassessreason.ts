import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
export class PreAuthorisationUnderAssessReason extends BaseClass
{
    preAuthorisationUnderAssessReasonId: number;
    preAuthId: number;
    underAssessReasonId: number;
    underAssessReason: string;
    comments: string;
}