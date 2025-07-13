import { PagedRequest } from "../../pagination/PagedRequest";
import { SLAItemTypeEnum } from "../sla-item-type-enum";

export class SLAStatusChangeAuditSearchRequest {
    slaItemType: SLAItemTypeEnum;
    pagedRequest: PagedRequest;
}
