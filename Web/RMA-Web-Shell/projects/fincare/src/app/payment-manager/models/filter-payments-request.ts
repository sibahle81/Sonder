import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';

export class FilterPaymentsRequest {
    paymentType: number;
    paymentStatus: number;
    claimType = ClaimTypeEnum.Funeral;
    startDate: string;
    endDate: string;
    productType: number;
    pageIndex:number;
    pageSize:number;
}
