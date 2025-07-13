import { MedicalSwitchBatchInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-invoice';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { SwitchBatchType } from '../../shared/enums/switch-batch-type';

export class MedicalSwitchBatch  extends BaseClass {
    switchBatchId: number;
    switchId: number;
    description: string;
    switchBatchNumber: string;
    switchFileName: string;
    dateSubmitted: string | null;
    dateSwitched: string | null;
    dateReceived: string | null;
    dateCompleted: string | null;
    invoicesStated: number;
    invoicesCounted: number;
    amountStatedInclusive: number;
    amountCountedInclusive: number;
    amountProcessed: number;
    assignedUserId: number | null;
    dateCaptured: string | null;
    linesStated: number;
    linesCounted: number;
    assignedToRoleId: number | null;
    isProcessed: boolean | null;
    switchBatchInvoices: MedicalSwitchBatchInvoice[];
    assignedUser: string | null;
    invoicesProcessed: number;
    switchBatchType: SwitchBatchType | null;
}
