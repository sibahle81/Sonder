import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimBenefit } from '../../../entities/claim-benefit';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { InvoiceFormService } from '../invoice-form.service';
import { FatalLumpSumInvoice } from './fatal-lump-sum-invoice';

@Component({
  selector: 'invoice-fatal-lump-sum',
  templateUrl: './invoice-fatal-lump-sum.component.html',
  styleUrls: ['./invoice-fatal-lump-sum.component.css']
})
export class InvoiceFatalLumpSumComponent  extends UnSubscribe implements OnChanges {

  claimInvoiceType = ClaimInvoiceTypeEnum.FatalLumpSumAward;
  @Input() claimInvoice: FatalLumpSumInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('saving details...please wait');

  form: UntypedFormGroup;
  payeeTypes: PayeeTypeEnum[];
  fatalLumpSumInvoice: FatalLumpSumInvoice;
  description$: BehaviorSubject<string> = new BehaviorSubject(null);
  selectedPayeeTypes = [PayeeTypeEnum[PayeeTypeEnum.Individual]];
  fatalLumpSumAward = ClaimInvoiceTypeEnum.FatalLumpSumAward;
  isAddRecord = false;
  isEdit = false;
  claimBenefitId: number;

  constructor( private readonly formBuilder: UntypedFormBuilder,
    public readonly invoiceFormService: InvoiceFormService,
    public readonly claimInvoiceService: ClaimInvoiceService,
    private readonly datePipe: DatePipe,
    ) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.claimInvoice){
      this.claimInvoice = new FatalLumpSumInvoice();
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = +this.claimInvoiceType;
    }
    this.createForm();
  }

  createForm() {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      description: [{ value: null, disabled: false }]
    });
    this.invoiceFormService.addForm(this.form);
    this.populateForm();
  }

  populateForm() {
    if (this.claimInvoice.claimInvoiceId > 0) {
      this.getfatalLumpSumInvoice();
      this.isEdit = true;
    } else {
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FatalLumpSumAward;
      this.isAddRecord = true;
    }
    this.isLoading$.next(false);
  }

  getfatalLumpSumInvoice() {
    this.claimInvoiceService.getFatalLumpSunInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      this.fatalLumpSumInvoice = result;
      this.claimInvoice.payeeTypeId = result.payeeTypeId;
      this.claimInvoice.payeeRolePlayerId = result.payeeRolePlayerId;
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FatalLumpSumAward;
      this.claimInvoice.claimInvoice.dateSubmitted = result.claimInvoice.invoiceDate;
      this.claimInvoice.claimInvoice.dateReceived = result.claimInvoice.dateReceived;
      this.claimInvoice.claimInvoice.invoiceAmount = result.claimInvoice.invoiceAmount;
      this.claimInvoice.claimInvoice.payeeRolePlayerId = result.payeeRolePlayerId;
      this.claimInvoice.claimInvoice.payeeTypeId = result.payeeTypeId;
      this.description$.next(result.description);
    })
  }

  setForm() {
    this.form.patchValue({
      description: this.claimInvoice && this.claimInvoice.description ? this.claimInvoice.description : null,
    });
    this.isLoading$.next(false);
  }

  getLookups() {
    this.payeeTypes = this.ToArray(PayeeTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  readForm(): any {
    const genericForm = this.invoiceFormService.getGenericForm();

    this.fatalLumpSumInvoice = new FatalLumpSumInvoice();
    this.fatalLumpSumInvoice.claimInvoice = new ClaimInvoice();

    this.fatalLumpSumInvoice.claimInvoice.invoiceDate =  new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    this.fatalLumpSumInvoice.claimInvoice.dateReceived = genericForm.dateReceived
                                                        ? new Date(this.datePipe.transform(genericForm.dateReceived, 'yyyy-MM-dd')).getCorrectUCTDate()
                                                        : new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    this.fatalLumpSumInvoice.claimInvoice.invoiceAmount = genericForm.invoiceAmount ? genericForm.invoiceAmount : null;
    this.fatalLumpSumInvoice.description = genericForm.description ? genericForm.description : String.Empty;
    this.fatalLumpSumInvoice.claimInvoice.claimAmount = genericForm.invoiceAmount;
    this.fatalLumpSumInvoice.claimId = this.personEvent.claims[0].claimId;

    this.fatalLumpSumInvoice.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.fatalLumpSumInvoice.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.fatalLumpSumInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FatalLumpSumAward;
    this.fatalLumpSumInvoice.claimInvoice.claimBenefitId = this.claimBenefitId;
    this.fatalLumpSumInvoice.claimInvoice.isAuthorised = 0;
    this.fatalLumpSumInvoice.claimInvoice.externalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.fatalLumpSumInvoice.claimInvoice.internalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.fatalLumpSumInvoice.claimInvoice.claimReferenceNumber = this.personEvent.personEventReferenceNumber;
    this.fatalLumpSumInvoice.claimInvoice.claimId = this.personEvent.claims[0].claimId;
    this.fatalLumpSumInvoice.claimInvoice.policyId = this.personEvent.claims[0]?.policyId ? this.personEvent.claims[0]?.policyId : 0; 
    this.fatalLumpSumInvoice.claimInvoice.product = '';  //TODO
    this.fatalLumpSumInvoice.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;

    return this.fatalLumpSumInvoice;
  }

  save() {
    this.isLoading$.next(true);
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.personEvent.claims[0].claimId).subscribe(result => {
      if(result && result[0].claimBenefitId > 0){
        this.claimBenefitId = result[0].claimBenefitId;
        let fatalLumpSum = this.readForm();
        this.claimInvoiceService.addFatalLumpSumInvoice(fatalLumpSum).subscribe(result => {
          if (result) {
            this.closeEmit.emit(true);
          }
        })
      }
      else{
        let claimBenefit = new ClaimBenefit();
        claimBenefit.claimId = this.personEvent.claims[0].claimId;
        claimBenefit.benefitId = 0;
        claimBenefit.estimatedValue = 0;
        this.claimInvoiceService.addClaimBenefit(claimBenefit).subscribe(result => {
          if(result && result > 0){
            this.claimBenefitId = result;
            let fatalLumpSum = this.readForm();
            this.claimInvoiceService.addFatalLumpSumInvoice(fatalLumpSum).subscribe(result => {
              if (result) {
                this.closeEmit.emit(true);
              }
            })
          }
        })
      }
    });
  }

  update() {
    this.isLoading$.next(true);
    const genericForm = this.invoiceFormService.getGenericForm();
    this.claimInvoiceService.getFatalLumpSunInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        result.description = genericForm.description ? genericForm.description : String.Empty;

        result.claimInvoice.invoiceDate =  new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
        result.claimInvoice.dateReceived = genericForm.dateReceived
                                                            ? new Date(this.datePipe.transform(genericForm.dateReceived, 'yyyy-MM-dd')).getCorrectUCTDate()
                                                            : new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
        result.claimInvoice.invoiceAmount = genericForm.invoiceAmount ? genericForm.invoiceAmount : null;
        result.claimInvoice.claimAmount = genericForm.invoiceAmount;
        result.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
        result.payeeRolePlayerId = +genericForm.payeeRolePlayer;

        this.claimInvoiceService.updateFatalLumpSumInvoice(result).subscribe(result => {
          if (result) {
            this.closeEmit.emit(true);
          }
        });
      }
    })
  }

  delete() {
    this.isLoading$.next(true);
    this.claimInvoiceService.deleteClaimInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        this.closeEmit.emit(true);
      }
    })
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formValid(): boolean {
    return this.invoiceFormService.isValidSave();
  }

  formInValid(): boolean {
    return this.invoiceFormService.formInvalid();
  }
}
