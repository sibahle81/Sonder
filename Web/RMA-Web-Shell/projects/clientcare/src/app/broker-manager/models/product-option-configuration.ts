import { OrganisationOptionItemValue } from "./organisation-option-item-value";

export class ProductOptionConfiguration {
    productOptionId: number;
    productOptionCode: string;
    productOptionName: string;
    benefitId: number;
    benefitCode: string;
    benefitName: string;
    optionTypeId: number;
    optionTypeCode: string;
    optionTypeName: string;
    optionItemId: number;
    optionItemCode: string;
    optionItemName: string;
    effectiveDate: Date;
    productOptionOptionValue: number;
    optionLevel: string;
    productCode: string;
    allowPolicyOverride: boolean;
    allowRolePlayerOverride: boolean;
    benefitOptionItemValueId: number;
    productOptionOptionItemValueId: number;

    organisation: string;
    isProductOptionSelected: boolean = false;
    isProductOptionDisabled: boolean = false;
    organisationOptionItemValue: OrganisationOptionItemValue;  
}