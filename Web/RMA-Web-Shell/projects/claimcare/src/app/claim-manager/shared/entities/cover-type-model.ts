import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

export class CoverTypeModel {
    coverTypeIds: number[];
    brokerageId: number;
    rolePlayerId: number;
    paymentType: PaymentTypeEnum;
    startDate: string;
    endDate: string;
}
