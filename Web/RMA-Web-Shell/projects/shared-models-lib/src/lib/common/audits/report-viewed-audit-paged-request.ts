import { PagedRequest } from "../../pagination/PagedRequest";

export class ReportViewedAuditPagedRequest {
    reportViewedAuditId: number;
    userId: number;
    itemType: string;
    itemId: number;
    reportUrl: string;
    dateViewed: Date;
    pagedRequest: PagedRequest;
}
