import { TebaTariffCategoryEnum } from "projects/shared-models-lib/src/lib/enums/teba-tariff-category-enum";

export class TebaTariff {
    tariffId: number;
    tariffCode: string;
    description: string;
    invoicingDescription: string;
    validFrom: string;
    validTo: string;
    costValue: number;
    minimumValue: number;
    adminFeePercentage: number;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
    tebaTariffCategory: TebaTariffCategoryEnum | null;
    ruleDescription: string;
}
