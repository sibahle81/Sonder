import { PagedRequest } from "projects/shared-models-lib/src/lib/pagination/PagedRequest";

export class QlinkSearchRequest {
    itemId: number;
    itemType: string;
    pagedRequest: PagedRequest;
}
