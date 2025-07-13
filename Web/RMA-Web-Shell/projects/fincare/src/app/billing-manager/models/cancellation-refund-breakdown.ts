import { ProductCategoryTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum";

export class CancellationRefundBreakDown{
    bankAccountNumber: string;
    productCategory: ProductCategoryTypeEnum;
    balance: number;
    policyId:number;
    policyNumber:string;
}