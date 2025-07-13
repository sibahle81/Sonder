import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PreAuthLevelOfCare extends BaseClass
{
    preAuthLevelOfCareId: number;
    levelOfCare: string;
    preAuthBreakdownId: number;
    levelOfCareId: number;
    dateTimeAdmitted: Date;
    dateTimeDischarged: Date;
    lengthOfStay: number;
    tariffCode: string;
    name: string;
    description: string;
}