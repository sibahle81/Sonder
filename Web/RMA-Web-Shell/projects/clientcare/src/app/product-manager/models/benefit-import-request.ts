export class BenefitImportRequest  {
    productId: number;
    productOptionName: string;
    coverType: number;
    effectiveDate: Date;
    adminFee: number;
    commission: number;
    binderFee: number;
    waitingPeriod: number;
    content: string;
}