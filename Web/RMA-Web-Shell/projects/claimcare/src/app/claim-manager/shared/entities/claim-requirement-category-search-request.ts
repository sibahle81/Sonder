import { PagedRequest } from "projects/shared-models-lib/src/lib/pagination/PagedRequest";
import { EventTypeEnum } from "../enums/event-type-enum";

export class ClaimRequirementCategorySearchRequest {
  eventType: EventTypeEnum;
  pagedRequest: PagedRequest;
}
