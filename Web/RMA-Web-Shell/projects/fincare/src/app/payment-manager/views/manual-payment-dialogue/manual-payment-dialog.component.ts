import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators,UntypedFormControl } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PaymentService } from '../../services/payment.service';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { DatePipe } from '@angular/common';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import {ClaimTypeEnum} from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'app-manual-payment-dialog',
  templateUrl: './manual-payment-dialog.component.html',
  styleUrls: ['./manual-payment-dialog.component.css']
})
export class ManualPaymentDialogComponent implements OnInit {
  payment:Payment;

  isSubmitting = false;
  form: UntypedFormGroup;

  strikeDate: Date;
  strikeDt: UntypedFormControl;
  start: any;

  countries: Lookup[];
  banks: Lookup[];
  bankAccountTypes: Lookup[];

  ClaimTypes = this.ToArray(ClaimTypeEnum);
  ClientTypes = this.ToArray(ClientTypeEnum);
  BenefitTypes = this.ToArray(BenefitTypeEnum);
  PaymentTypes = this.ToArray(PaymentTypeEnum);

  constructor(public dialogRef: MatDialogRef<ManualPaymentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {userName: string},
              private readonly formBuilder: UntypedFormBuilder,
              private readonly paymentService: PaymentService,
              private readonly toastr: ToastrManager,
              public datePipe: DatePipe,
              private readonly lookupService: LookupService)
  {

    this.strikeDate = new Date();
    this.strikeDt = new UntypedFormControl(this.strikeDate);
    this.start = this.datePipe.transform(this.strikeDate, 'yyyy-MM-dd');


  }
  ngOnInit() {

    this.getCountries();
    this.getBanks();
    this.getBankAccountTypes();

    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({

      payee: new UntypedFormControl('', [Validators.required]),
      bank: new UntypedFormControl('', [Validators.required]),
      bankBranch:new UntypedFormControl('', [Validators.required]),
      accountNumber:new UntypedFormControl('', [Validators.required]),
      amount:new UntypedFormControl('', [Validators.required]),
      product:new UntypedFormControl('', [Validators.required]),
      company:new UntypedFormControl('', [Validators.required]),
      branch:new UntypedFormControl('', [Validators.required]),
      senderAccountNumber:new UntypedFormControl('', [Validators.required]),
      brokerCode:new UntypedFormControl('', [Validators.required]),
      brokerName:new UntypedFormControl('', [Validators.required]),
      bankAccountType:new UntypedFormControl('', [Validators.required]),
      idNumber:new UntypedFormControl('', [Validators.required]),
      emailAddress:new UntypedFormControl('', [Validators.required]),
      paymentType:new UntypedFormControl('', [Validators.required]),
      paymentTypeDescription:new UntypedFormControl('', [Validators.required]),
      claimType:new UntypedFormControl('', [Validators.required]),
      claimTypeDescription:new UntypedFormControl('', [Validators.required]),
      accountTypeDescription:new UntypedFormControl('', [Validators.required]),
      clientType:new UntypedFormControl('', [Validators.required]),
      reference:new UntypedFormControl('', [Validators.required]),
      claimReference:new UntypedFormControl('', [Validators.required]),
      batchReference:new UntypedFormControl('', [Validators.required]),
      policyReference:new UntypedFormControl('', [Validators.required]),
      bankStatementReference:new UntypedFormControl('', [Validators.required]),
      memberName:new UntypedFormControl('', [Validators.required]),
      memberNumber:new UntypedFormControl('', [Validators.required]),
      benefitType:new UntypedFormControl('', [Validators.required]),
      scheme:new UntypedFormControl('', [Validators.required]),
      destinationCountry:new UntypedFormControl('', [Validators.required]),
      strikeDate:new UntypedFormControl('', [Validators.required]),
    });

  }

  submitPayment() {

    if (this.form.valid) {
      this.form.disable();

      const model = this.form.value;
      this.payment = new Payment();

      this.payment.payee =model.payee as string;
      this.payment.bank = model.bank as string;
      this.payment.bankBranch = model.bankBranch as string;
      this.payment.accountNo = model.accountNumber as string;
      this.payment.amount = model.amount as number;
      this.payment.product = model.product as string;
      this.payment.company = model.company as number;
      this.payment.branch = model.branch as number;
      this.payment.senderAccountNo = model.senderAccountNumber as string;
      this.payment.brokerCode = model.brokerCode as number ;
      this.payment.brokerName = model.brokerName as string;
      this.payment.bankAccountType = model.bankAccountType as number;
      this.payment.idNumber = model.idNumber as string;
      this.payment.emailAddress = model.emailAddress as string;
      this.payment.paymentType = model.paymentType as number;
      this.payment.paymentTypeDesc = model.paymentTypeDescription as string;
      this.payment.claimTypeId = model.claimType as number;
      this.payment.claimTypeDesc = model.claimTypeDescription as string;
      this.payment.accountTypeDesc = model.accountTypeDescription as string;
      this.payment.clientType = model.clientType as number;
      this.payment.reference = model.reference as string;
      this.payment.claimReference = model.claimReference as string;
      this.payment.batchReference = model.batchReference as string;
      this.payment.policyReference = model.policyReference as string;
      this.payment.bankStatementReference = model.bankStatementReference as string;
      this.payment.memberName = model.memberName as string;
      this.payment.memberNumber = model.memberNumber as string;
      this.payment.benefitType = model.benefitType as number;
      this.payment.scheme = model.scheme as string;
      this.payment.destinationCountryId = model.destinationCountry as number;
      this.payment.strikeDate = model.strikeDate as Date;
      this.payment.createdBy = this.data.userName;

      this.payment.paymentStatus = PaymentStatusEnum.Pending;
      this.isSubmitting = true;

      this.paymentService.addPayment(this.payment).subscribe(
        response => {
          this.toastr.infoToastr("Payment submitted");
          this.payment.id = response;
          this.closeDialog();
        });



    }

  }

  closeDialog() {
    this.isSubmitting = false;
    this.dialogRef.close(false);
    this.form.enable();
  }



  getCountries(): void {
    this.lookupService.getCountries().subscribe(results => {
      this.countries = results;
    });
  }


  getBanks(): void {
    this.lookupService.getBanks().subscribe(
      results => {
        this.banks = results;
      });
  }

  getBankAccountTypes(): void {
    this.lookupService.getBankAccountTypes().subscribe(
      results => {
        this.bankAccountTypes = results;
      });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
  }
}
