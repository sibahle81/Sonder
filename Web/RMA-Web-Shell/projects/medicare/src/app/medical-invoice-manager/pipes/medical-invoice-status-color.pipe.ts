import { PipeTransform, Pipe } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';

@Pipe({
    name: 'invoiceStatusColor',
    pure: true,
    standalone: true,
})
export class MedicalInvoiceStatusColorPipe implements PipeTransform {

    public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
    invoiceStatusColor:string = "";

  transform(invoiceStatusID:number ): string {
            switch (invoiceStatusID)
            {
                case this.invoiceStatusEnum.Allocated:
                    this.invoiceStatusColor = "#FFA500";
                    break;
                case this.invoiceStatusEnum.PaymentRequested:
                case this.invoiceStatusEnum.Partially:
                    this.invoiceStatusColor = "#78AAFF";
                    break;
                case this.invoiceStatusEnum.Paid:
                    this.invoiceStatusColor = "#00C600";
                    break;
                case this.invoiceStatusEnum.Rejected:
                    this.invoiceStatusColor = "#FF3300";
                    break;
                default:
                    this.invoiceStatusColor= "";
                    break;
            }
            return this.invoiceStatusColor;
    }
}
