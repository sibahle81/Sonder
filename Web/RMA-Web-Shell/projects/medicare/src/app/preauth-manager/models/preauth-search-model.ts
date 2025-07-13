import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';

export class PreAuthSearchModel {
    preAuthNumber: string;
    claimReferenceNumber: string;
    practiceNumber: string;
    healthCareProviderId: number;
    createdBy: string;
}
