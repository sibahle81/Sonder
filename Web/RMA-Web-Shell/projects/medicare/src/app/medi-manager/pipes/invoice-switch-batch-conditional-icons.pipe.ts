import { PipeTransform, Pipe } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { SwitchInvoiceStatusEnum } from '../../medical-invoice-manager/enums/switch-invoice-status-enum';
import { SwitchInvoiceStatusConditionalIconEnum } from '../../medical-invoice-manager/enums/switch-invoice-status-conditional-icon-enum';

@Pipe({
  name: 'invoiceSwitchBatchConditionalIcons',
  pure: true
})
export class InvoiceSwitchBatchConditionalIconsPipe implements PipeTransform {

  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  switchInvoiceStatusEnum: typeof SwitchInvoiceStatusEnum = SwitchInvoiceStatusEnum; InvoiceSwitchBatchConditionalIconsEnum
  switchInvoiceStatusConditionalIconEnum: typeof SwitchInvoiceStatusConditionalIconEnum = SwitchInvoiceStatusConditionalIconEnum;

  transform(invoiceStatusID: number, invoiceId: number, action: number): boolean {
    
    switch (action) {
      case this.switchInvoiceStatusConditionalIconEnum.DeleteInvoiceAction:

        if (invoiceId > 0) {
          return false;
        }
        else {
          if (invoiceStatusID == SwitchInvoiceStatusEnum.ManualProcess || invoiceStatusID == SwitchInvoiceStatusEnum.Reinstated) {
            return true;
          }
          else{
            return false;
          }
        }

      case this.switchInvoiceStatusConditionalIconEnum.AddBatchInvoiceAction:

        if (invoiceId > 0) {
          return false;
        }
        else {
          if (invoiceStatusID == SwitchInvoiceStatusEnum.ManualProcess || invoiceStatusID == SwitchInvoiceStatusEnum.Reinstated) {
            return true;
          }
          else{
            return false;
          }
        }
      case this.switchInvoiceStatusConditionalIconEnum.MapToPersonEventAction:

        if (invoiceId > 0) {
          return false;
        }
        else {
          if (invoiceStatusID == SwitchInvoiceStatusEnum.ManualProcess || invoiceStatusID == SwitchInvoiceStatusEnum.Reinstated) {
            return true;
          }
          else{
            return false;
          }
        }

        case this.switchInvoiceStatusConditionalIconEnum.ViewSwitchInvoiceClaimMapped:

        if (invoiceId > 0) {
          return true;
        }
        else {
            return false;
        }

      default:
        return false
    }

  }

}
