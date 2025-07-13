import { AnnualIncreaseTypeEnum } from "../enums/annual-increase-type-enum";


export interface PolicyLifeExtension {
    policyLifeExtensionId: number;
    policyId: number;
    annualIncreaseType: AnnualIncreaseTypeEnum;
    annualIncreaseMonth: number | null;
    affordabilityCheckPassed: boolean;
    affordabilityCheckFailReason: string;
    isEuropAssistExtended: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
}