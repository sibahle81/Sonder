import { ProductCategoryTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum";

export class ReclassificationRefundBreakDown{
    bankAccountNumber: string;
    productCategory: ProductCategoryTypeEnum;
    balance: number;
    claimsTotal: number;
}