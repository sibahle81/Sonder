import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";
import { InterestStatusEnum } from "../../shared/enum/interest-status.enum";
import { PagedRequest } from "projects/shared-models-lib/src/lib/pagination/PagedRequest";

export class InterestSearchRequest {
        industryClass: IndustryClassEnum;
        periodId: number;
        rolePlayerId: number;
        policyId: number;
        productCategoryId: number;
        interestStatus: InterestStatusEnum;

        pagedRequest: PagedRequest;
}