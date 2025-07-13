import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { InvoiceFormService } from '../invoice-form.service';
import { RepayReasonEnum } from 'projects/shared-models-lib/src/lib/enums/repay-reason-enum';

@Component({
  selector: 'claim-invoice-dialog',
  templateUrl: './claim-invoice-dialog.component.html',
  styleUrls: ['./claim-invoice-dialog.component.css']
})
export class ClaimInvoiceDialogComponent {

  sundry = ClaimInvoiceTypeEnum.SundryInvoice;
  widowLumpSum = ClaimInvoiceTypeEnum.WidowLumpSumAward;
  travelExpense = ClaimInvoiceTypeEnum.TravelAward;
  funeralExpense = ClaimInvoiceTypeEnum.FuneralExpenses;
  daysOffInvoice = ClaimInvoiceTypeEnum.DaysOffInvoice;
  partialDependencyInvoice = ClaimInvoiceTypeEnum.PartialDependencyLumpsum;
  fatalLumpSumInvoice = ClaimInvoiceTypeEnum.FatalLumpSumAward;
  other = ClaimInvoiceTypeEnum.OtherBenefitAwd;

  personEvent: PersonEventModel;

  isReadOnly = true;

  repayReasons: RepayReasonEnum[];
  selectedRepayReason: number;
  hideDropdown = false;

  constructor(
    public dialogRef: MatDialogRef<ClaimInvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly invoiceFormService: InvoiceFormService
  ) {
    if(data.invoiceAction === 'edit' || data.invoiceAction === 'repay'){
      this.isReadOnly = false;
    }
    this.repayReasons = this.ToArray(RepayReasonEnum)
  }

  hideRepayDropdown() {
    this.hideDropdown = true;;
  }

  cancel() {
    this.dialogRef.close(true);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  
  repayReasonChanged($event: RepayReasonEnum) {
    this.selectedRepayReason = +RepayReasonEnum[$event];
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
