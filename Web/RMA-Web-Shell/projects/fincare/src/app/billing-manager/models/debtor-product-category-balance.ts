import { ProductCategoryTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum";

export class DebtorProductCategoryBalance {
  bankAccountNumber: string;
  productCategory: ProductCategoryTypeEnum;
  balance: number;
  claimsTotal?: number = 0;
  policyId?: number;
  policyNumber?:string;
}