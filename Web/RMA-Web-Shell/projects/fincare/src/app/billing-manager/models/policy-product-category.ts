import { ComplianceResult } from "projects/clientcare/src/app/policy-manager/shared/entities/compliance-result";
import { ProductOption } from "projects/clientcare/src/app/product-manager/models/product-option";

export class PolicyProductCategory{
    policyId: number;
    productOption: ProductOption;
    policyNumber: string;
    productCategory: string;
    productDescription: string;
    categoryPolicies: PolicyProductCategory[];
    productBalance: number;
    complianceResult: ComplianceResult;
    roleplayerId: number;
    rmaBankAccountId: number;
}