import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ProductCrossRefTranType extends BaseClass {
    productCodeId: number;
    origin: string;
    companyNo: number;
    branchNo: number;
    transactionType: string;
    transactionTypeName: string;
    level1: string;
    level2: string;
    level3: number;
    chartISNo: number;
    chartIsName: string;
    chartBSNo: number;
    chartBsName: string;
    benefitcode: string;
}