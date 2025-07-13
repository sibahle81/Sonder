import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-pd-award-payment',
  templateUrl: './pd-award-payment.component.html',
  styleUrls: ['./pd-award-payment.component.css']
})
export class PdAwardPaymentComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading PD Award Payment...please wait');

  isReadOnly = true;
  form: UntypedFormGroup;
  calculatedPdAward: number;
  payee: string;
  invoiceTotal:number;
  payeAmount:number;
  vatAmount:number;
  amount:number;
  selectedPayeeType: string;
  payeeTypes: PayeeTypeEnum[];
  payeeType: PayeeTypeEnum;
  
  constructor(
    public dialogRef: MatDialogRef<PdAwardPaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    public userService: UserService,
    protected claimEarningService: ClaimEarningService
  ) {

  }

  ngOnInit(): void {
    this.isLoading$.next(true);
    this.getLookups();
    this.createForm();
    this.setData();
    this.isLoading$.next(false);
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      payeeType: [{ value: null, disabled: false }, Validators.required],
      amount: [{ value: null, disabled: false }],
      payee: [{ value: null, disabled: true }],
      vatAmount: [{ value: null, disabled: true }],
      payeAmount: [{ value: null, disabled: true }],
      invoiceTotal: [{ value: null, disabled: true }],
    });
  }

  setData() {
    this.form.patchValue({
      amount: this.data.amount,
      payee: this.data.payee,
      vatAmount: this.data.vatAmount,
      payeAmount: this.data.payeAmount,
      invoiceTotal: this.data.amount
    });
  }

  onPayeeTypeChange($event: PayeeTypeEnum) {
    this.payeeType = $event;
  }

  onAmountChange() {
    const amount = parseFloat(this.amount.toString()) || 0;
    const vatAmount = parseFloat(this.vatAmount.toString()) || 0;
    const payeAmount = parseFloat(this.payeAmount.toString()) || 0;
    this.invoiceTotal = amount + vatAmount + payeAmount;
  }

  getLookups() {
    this.payeeTypes = this.ToArray(PayeeTypeEnum);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum).filter(StringIsNumber).map(key => anyEnum[key]);
  }

  submit() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
