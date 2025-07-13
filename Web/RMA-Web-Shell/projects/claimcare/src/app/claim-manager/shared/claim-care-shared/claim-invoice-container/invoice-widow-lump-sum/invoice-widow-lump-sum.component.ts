import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { InvoiceFormService } from '../invoice-form.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { WidowLumpSumInvoice } from './widow-lump-sum-invoice';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { DatePipe } from '@angular/common';
import { ClaimBenefit } from '../../../entities/claim-benefit';

@Component({
  selector: 'invoice-widow-lump-sum',
  templateUrl: './invoice-widow-lump-sum.component.html',
  styleUrls: ['./invoice-widow-lump-sum.component.css'],
  providers: [InvoiceFormService]
})
export class InvoiceWidowLumpSumComponent extends UnSubscribe implements OnChanges {

  claimInvoiceType = ClaimInvoiceTypeEnum.WidowLumpSumAward;
  @Input() claimInvoice: WidowLumpSumInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('saving details...please wait');

  form: UntypedFormGroup;
  payeeTypes: PayeeTypeEnum[];
  widowLumpSumInvoice: WidowLumpSumInvoice;
  description$: BehaviorSubject<string> = new BehaviorSubject(null);
  selectedPayeeTypes = [PayeeTypeEnum[PayeeTypeEnum.Individual]];
  widowLumpSumAward = ClaimInvoiceTypeEnum.WidowLumpSumAward;
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
      this.claimInvoice = new WidowLumpSumInvoice();
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
      this.getWidowLumpsumInvoice();
      if (!this.isRepay) {
        this.isEdit = true;
      } else {
        this.isAddRecord = true;
      }
    } else {
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.WidowLumpSumAward;
      this.isAddRecord = true;
    }
    this.isLoading$.next(false);
  }

  getWidowLumpsumInvoice() {

    this.claimInvoiceService.getWidowLumpSunInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      this.widowLumpSumInvoice = result;
      this.claimInvoice.payeeTypeId = result.payeeTypeId;
      this.claimInvoice.payeeRolePlayerId = result.payeeRolePlayerId;
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.WidowLumpSumAward;
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

    this.widowLumpSumInvoice = new WidowLumpSumInvoice();
    this.widowLumpSumInvoice.claimInvoice = new ClaimInvoice();

    this.widowLumpSumInvoice.claimInvoice.invoiceDate =  new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    this.widowLumpSumInvoice.claimInvoice.dateReceived = genericForm.dateReceived
                                                        ? new Date(this.datePipe.transform(genericForm.dateReceived, 'yyyy-MM-dd')).getCorrectUCTDate()
                                                        : new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    this.widowLumpSumInvoice.claimInvoice.invoiceAmount = genericForm.invoiceAmount ? genericForm.invoiceAmount : null;
    this.widowLumpSumInvoice.description = genericForm.description ? genericForm.description : String.Empty;
    this.widowLumpSumInvoice.claimInvoice.claimAmount = genericForm.invoiceAmount;
    this.widowLumpSumInvoice.claimId = this.personEvent.claims[0].claimId;

    this.widowLumpSumInvoice.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.widowLumpSumInvoice.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.widowLumpSumInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.WidowLumpSumAward;
    this.widowLumpSumInvoice.claimInvoice.claimBenefitId = this.claimBenefitId;
    this.widowLumpSumInvoice.claimInvoice.isAuthorised = 0;
    this.widowLumpSumInvoice.claimInvoice.externalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.widowLumpSumInvoice.claimInvoice.internalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.widowLumpSumInvoice.claimInvoice.claimReferenceNumber = this.personEvent.personEventReferenceNumber;
    this.widowLumpSumInvoice.claimInvoice.claimId = this.personEvent.claims[0].claimId;
    this.widowLumpSumInvoice.claimInvoice.policyId = this.personEvent.claims[0]?.policyId ? this.personEvent.claims[0]?.policyId : 22880; //TODO
    this.widowLumpSumInvoice.claimInvoice.product = 'EMP';  //TODO
    this.widowLumpSumInvoice.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
    this.widowLumpSumInvoice.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;

    return this.widowLumpSumInvoice;
  }

  save() {
    this.isLoading$.next(true);
    this.hideEmit.emit(true);
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.personEvent.claims[0].claimId).subscribe(result => {
      if(result && result[0].claimBenefitId > 0){
        this.claimBenefitId = result[0].claimBenefitId;
        let widowLumpSum = this.readForm();
        this.claimInvoiceService.addWidowLumpSumInvoice(widowLumpSum).subscribe(result => {
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
            let widowLumpSum = this.readForm();
            this.claimInvoiceService.addWidowLumpSumInvoice(widowLumpSum).subscribe(result => {
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
    this.claimInvoiceService.getWidowLumpSunInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
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

        this.claimInvoiceService.updateWidowLumpSumInvoice(result).subscribe(result => {
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

  formAllValid(): boolean {
    return this.invoiceFormService.allValid();
  }
}
