export class SearchPreAuthCriteria {
    preAuthNumber: string;
    preAuthTypeId: number;
    preAuthStatusId: number;
    healthCareProviderId: number;
    dateAuthorisedFrom: any;
    dateAuthorisedTo: any;
    pageNumber: number | null;
    pageSize: number | null;
    claimId: number | null;
}