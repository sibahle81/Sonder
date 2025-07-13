import { PagedRequest } from "projects/shared-models-lib/src/lib/pagination/PagedRequest";

export class MedicalInvoiceSearchRequest {
    rolePlayerId: number; //1 to 1 for healthCareProviderId
    pagedRequest: PagedRequest;
}