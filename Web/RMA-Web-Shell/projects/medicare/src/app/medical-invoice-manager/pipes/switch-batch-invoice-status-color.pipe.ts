import { PipeTransform, Pipe } from '@angular/core';
import { MedicalSwitchBatchInvoice } from '../models/medical-switch-batch-invoice';
import { SwitchInvoiceStatusEnum } from '../enums/switch-invoice-status-enum';

@Pipe({
    name: 'switchBatchInvoiceStatusColor',
    pure: true,
    standalone: true,
})
export class SwitchBatchInvoiceStatusColorPipe implements PipeTransform {

  switchBatchInvoiceStatusColor:string = "";

  transform(invoice: MedicalSwitchBatchInvoice): string {
    if (!invoice.invoiceId && 
        invoice.switchInvoiceStatus == SwitchInvoiceStatusEnum.ManualProcess)
        {
            this.switchBatchInvoiceStatusColor = "#FFA500";
        }

        if (!invoice.invoiceId && 
            invoice.switchInvoiceStatus == SwitchInvoiceStatusEnum.Deleted)
        {
            this.switchBatchInvoiceStatusColor = "#FF0000";
        }

        if (invoice.invoiceId > 0) 
        {
            this.switchBatchInvoiceStatusColor = "#00ff33";
        }

        if (!invoice.invoiceId &&
             (invoice.switchInvoiceStatus == SwitchInvoiceStatusEnum.PendingValidation 
                || invoice.switchInvoiceStatus == SwitchInvoiceStatusEnum.Reinstated 
                || !invoice.switchInvoiceStatus)) {
                    this.switchBatchInvoiceStatusColor = "#FFFF00";
        }

        return this.switchBatchInvoiceStatusColor;
    }
}
