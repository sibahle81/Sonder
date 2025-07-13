import { BankingPurposeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/banking-purpose.enum";
import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";
import { ProductClassEnum } from "projects/shared-models-lib/src/lib/enums/product-class-enum";

export class CompanyBranchBankAccount {
    companyBranchBankAccountId: number;
    companyNumber: number;
    branchNumber: number;
    industryClass: IndustryClassEnum;
    bankAccountId: number;
    description: string;
    productClass: ProductClassEnum;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    isDeleted: boolean;
    isActive: boolean;
    bankingPurpose: BankingPurposeEnum;

}
