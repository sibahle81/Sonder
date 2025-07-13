import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";
import { InterestStatusEnum } from "../../shared/enum/interest-status.enum";

export class Interest {
        interestId: number;
        industryClass: IndustryClassEnum;
        periodId: number;
        rolePlayerId: number;
        policyId: number;
        productCategoryId: number;
        balance: number;
        calculatedInterestAmount: number;
        adjustedInterestAmount: number;
        comment: string;
        interestStatus: InterestStatusEnum;
        isDeleted: boolean;
        modifiedBy: string;
        modifiedDate: Date;
        createdBy: string;
        createdDate: Date
}