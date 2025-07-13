import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";

export class InterestCalculationRequest {
        industryClass: IndustryClassEnum;
        periodId: number;
        rolePlayerId: number;
        policyId: number;
        productCategoryId: number;
}



