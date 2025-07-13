import { SwitchBatchType } from "../../shared/enums/switch-batch-type";

export class MedicalInvoiceSearchBatchCriteria {
    switchTypes: string;
    switchBatchId: number | null;
    batchNumber: string;
    dateSubmitted: any;
    dateSwitched: any;
    dateRecieved: any;
    assignedToUserId: number | null;
    isCompleteBatches: boolean;
    switchBatchType: SwitchBatchType | null;
    pageNumber: number | null;
    pageSize: number | null;
}