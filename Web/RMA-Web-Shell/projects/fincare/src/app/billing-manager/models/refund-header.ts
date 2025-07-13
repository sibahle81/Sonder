import { RefundHeaderDetail } from './refund-header-detail';

export class RefundHeader {
    refundHeaderId: number;
    headerStatusId: number;
    rolePlayerId: number;
    headerTotalAmount: number;
    reference: string;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    refundHeaderDetails: RefundHeaderDetail[];
}
