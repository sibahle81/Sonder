import { BenefitTypeEnum } from "projects/shared-models-lib/src/lib/enums/benefit-type-enum";
import { CoverMemberTypeEnum } from "projects/shared-models-lib/src/lib/enums/cover-member-type-enum";

export class BenefitModel {
    productOptionId: number;
    productOptionName: string;
    benefitId: number;
    benefitName: string;
    benefitCode: string;
    coverMemberType: CoverMemberTypeEnum;
    benefitType: BenefitTypeEnum;
    minimumAge: number;
    maximumAge: number;
    baseRate: number;
    benefitAmount: number;
    selected: boolean = false;
}