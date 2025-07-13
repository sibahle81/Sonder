import { HealthCareProviderModel } from "projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model";

export class PmpRegionTransfer {
    pmpRegionTransferId: number;
    claimId: number;
    healthCareProviderId: number | null;
    isUds: boolean | null;
    isSpousalTraining: boolean | null;
    dateOfTransfer: string | null;
    expDateOfArrival: string;
    dateOfReferral: string | null;
    passportVisaRenewalDate: string | null;
    confDateOfArrival: string | null;
    referringMcaId: number;
    receivingMcaId: number;
    referringPaId: number;
    receivingPaId: number;
    referringPmpRegionId: number;
    receivingPmpRegionId: number;
    comments: string;
    reasonForReferral: string;
    treatmentReceived: string;
    daigonsis: string;
    medicationSundriesIssued: string;
    issuedDate: string;
    issuedMonth: number | null;
    isAcute: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
    healthCareProvider: HealthCareProviderModel;
}
