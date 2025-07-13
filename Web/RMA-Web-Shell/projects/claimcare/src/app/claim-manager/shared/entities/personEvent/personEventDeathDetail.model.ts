import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PersonEventDeathDetailModel extends BaseClass {
    personEventId: number;
    deathTypeId: number;
    deathType: number;
    causeOfDeath: number;
    dhaReferenceNo: string;
    deathCertificateNo: string;
    gestation: number;
    interviewWithFamilyMember: boolean;
    opinionOfMedicalPractitioner: boolean;
    deathDate: Date | string;
    homeAffairsRegion: string;
    placeOfDeath: string;
    dateOfPostmortem: Date | string;
    postMortemNumber: string;
    bodyNumber: string;
    sapCaseNumber: string;
    bodyCollectorId: number;
    bodyCollectionDate: Date;
    underTakerId: number;
    funeralParlorId: number;
    doctorId: number;
    forensicPathologistId: number;
    causeOfDeathDescription: string;
}
