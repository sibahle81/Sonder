import { PaymentTypeEnum } from "projects/shared-models-lib/src/lib/enums/payment-type-enum";
import { PaymentStatusEnum } from "../../shared/enum/payment-status-enum";

export class PaymentPoolSearchParams {
    startDate: string;
    endDate: string;
    paymentTypeId: PaymentTypeEnum;
    claimTypeId: number;
    paymentStatusId: PaymentStatusEnum;
    page: number;
    pageSize: number;
    orderBy: string;
    isAscending: boolean;
    query: string;    
    reAllocate: boolean;
    userLoggedIn: number;
    workPoolId: number;
    coidPaymentTypeId: number;
    pensionPaymentTypeId: number;
}