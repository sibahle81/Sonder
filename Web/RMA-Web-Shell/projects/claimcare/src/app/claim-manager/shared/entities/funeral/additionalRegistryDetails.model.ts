import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AdditionalRegistryDetailsModel extends BaseClass {
      idNumber: string;
      dhaReferenceNumber: string;
      deathCertificateReferenceNumber: string;
      homeAffairsRegion: string;
      firstName: string;
      lastName: string;
      placeOfDeath: string;
      interviewWithFamilyMember: boolean;
      opinionOfMedicalPractitioner: boolean;
      placeEventOccured: string;
      passport: string;
      nationality: string;
      nationalityOfDeceased: string;
      dateOfBirth: Date;
      genderId: number;
      gestationPeriod: number;
      insuredLifeId: number;
      deathTypeId: number;
      policyId: number;
      dateOfDeath: Date;
      isStillborn: boolean;
      claimId: number;
      wizardId: number;
      funeralId: number;
      uniqueClaimReferenceNumber: string;
      email: string;
      causeOfDeathId: number;
}
