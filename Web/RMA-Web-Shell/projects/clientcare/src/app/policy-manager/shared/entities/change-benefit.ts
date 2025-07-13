import { BenefitModel } from "../../../product-manager/models/benefit-model";

export class ChangeBenefit {
    oldBenefitId: number;
    oldBenefitName: string;
    newBenefitId: number;
    newBenefitName: string;
    coverMemberTypeId: number;
    coverMemberType: string;
}