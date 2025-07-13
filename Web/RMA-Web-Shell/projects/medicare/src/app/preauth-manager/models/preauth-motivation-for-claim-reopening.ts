import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PreAuthMotivationForClaimReopening extends BaseClass
{
    preAuthMotivationForClaimReopeningId: number;
    preAuthId: number;
    referringDoctorId: number;
    requestStatusId: number;
    injuryDetails: string;
    relationWithOldInjury: string;
    admissionDate: Date;
    procedureDate: Date;
    motivation: string;
    comment: string;
    submittedByUser: string;
    submittedDate: Date;
}