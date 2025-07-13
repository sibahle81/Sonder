import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { InvoiceFormService } from '../invoice-form.service';
import { FatalPDLumpSumInvoice } from './fatal-pd-lump-sum-invoice';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';

@Component({
  selector: 'invoice-partial-dependency-lump-sum',
  templateUrl: './invoice-partial-dependency-lump-sum.component.html',
  styleUrls: ['./invoice-partial-dependency-lump-sum.component.css'],
  providers: [InvoiceFormService]
})
export class InvoicePartialDependencyLumpSumComponent extends UnSubscribe implements OnChanges {

  @Input() claimInvoice: FatalPDLumpSumInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');

  form: UntypedFormGroup;
  partialDependencyLumpSum: FatalPDLumpSumInvoice;
  partial = ClaimInvoiceTypeEnum.PartialDependencyLumpsum;
  description$: BehaviorSubject<string> = new BehaviorSubject(null);
  isEdit = false;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly invoiceFormService: InvoiceFormService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      numberBeforeDeath: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      numberAfterDeath: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      contribution: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      totalFamilyIncome: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      averageIncome: [{ value: '', disabled: this.isReadOnly }, Validators.required]
    });

    this.invoiceFormService.addForm(this.form);
    this.populateForm();
  }

  populateForm() {
    if (this.claimInvoice.claimInvoiceId > 0) {
      this.getPartialDependencyLumpSumInvoice();
      if (!this.isRepay) {
        this.isEdit = true;
      }
    } else {
      this.description$.next(' ');
      this.setForm();
    }
  }

  getPartialDependencyLumpSumInvoice() {
    this.claimInvoiceService.getPartialDependencyLumpSumInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      this.partialDependencyLumpSum = result;
      this.description$.next(result.description);
      this.setForm();
    })
  }

  setForm() {
    this.form.patchValue({
      numberBeforeDeath: this.partialDependencyLumpSum && this.partialDependencyLumpSum.noOfFamilyMembersBeforeDeath ? this.partialDependencyLumpSum.noOfFamilyMembersBeforeDeath : null,
      numberAfterDeath: this.partialDependencyLumpSum && this.partialDependencyLumpSum.noOfFamilyMembersAfterDeath ? this.partialDependencyLumpSum.noOfFamilyMembersAfterDeath : null,
      contribution: this.partialDependencyLumpSum && this.partialDependencyLumpSum.deceasedContributionToIncome ? this.partialDependencyLumpSum.deceasedContributionToIncome : null,
      totalFamilyIncome: this.partialDependencyLumpSum && this.partialDependencyLumpSum.totalFamilyIncome ? this.partialDependencyLumpSum.totalFamilyIncome : null,
      averageIncome: this.partialDependencyLumpSum && this.partialDependencyLumpSum.avgIncomePerFamilyMember ? this.partialDependencyLumpSum.avgIncomePerFamilyMember : null,
    });

    this.isLoading$.next(false);
  }

  readForm(): any {
    if (!this.form.valid) { return; }

    const genericForm = this.invoiceFormService.getGenericForm();
    const formDetails = this.form.getRawValue();
    this.partialDependencyLumpSum = new FatalPDLumpSumInvoice();
    this.partialDependencyLumpSum.claimInvoice = new ClaimInvoice();

    this.partialDependencyLumpSum.claimInvoice.invoiceDate = new Date(genericForm.invoiceDate).getCorrectUCTDate();
    this.partialDependencyLumpSum.claimInvoice.dateReceived = new Date(genericForm.dateReceived).getCorrectUCTDate();
    this.partialDependencyLumpSum.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.partialDependencyLumpSum.payee = genericForm.payee;
    this.partialDependencyLumpSum.claimInvoice.invoiceAmount = genericForm.invoiceAmount;
    this.partialDependencyLumpSum.description = genericForm.description;
    this.partialDependencyLumpSum.claimId = this.personEvent.claims[0].claimId;
    this.partialDependencyLumpSum.claimInvoice.claimId = this.personEvent.claims[0].claimId;
    this.partialDependencyLumpSum.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.PartialDependencyLumpsum;
    this.partialDependencyLumpSum.claimInvoice.claimBenefitId = 1374391;  //TODO

    this.partialDependencyLumpSum.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
    this.partialDependencyLumpSum.claimInvoice.capturedDate = genericForm.capturedDate;
    this.partialDependencyLumpSum.noOfFamilyMembersBeforeDeath = formDetails.numberBeforeDeath;
    this.partialDependencyLumpSum.noOfFamilyMembersAfterDeath = formDetails.numberAfterDeath;
    this.partialDependencyLumpSum.deceasedContributionToIncome = formDetails.contribution;
    this.partialDependencyLumpSum.totalFamilyIncome = formDetails.totalFamilyIncome;
    this.partialDependencyLumpSum.avgIncomePerFamilyMember = formDetails.averageIncome;
    this.partialDependencyLumpSum.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;

    return this.partialDependencyLumpSum;
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

  save() {
    this.isLoading$.next(true);
    this.hideEmit.emit(true);

    let partialDependencyLumpSum = this.readForm();
    this.claimInvoiceService.addPartialDependencyLumpSumInvoice(partialDependencyLumpSum).subscribe(result => {
      if (result) {
        this.closeEmit.emit(true);
      }
    })
  }

  update() {
    this.isLoading$.next(true);
    const formDetails = this.form.getRawValue();
    const genericForm = this.invoiceFormService.getGenericForm();
    this.claimInvoiceService.getPartialDependencyLumpSumInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        result.description = genericForm.description ? genericForm.description : String.Empty;
        result.claimInvoice.invoiceDate = genericForm.invoiceDate;
        result.claimInvoice.dateReceived = genericForm.invoiceDate;
        result.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
        result.payee = genericForm.payee;
        result.claimInvoice.invoiceAmount = genericForm.invoiceAmount;
        result.claimInvoice.claimAmount = genericForm.invoiceAmount;

        result.noOfFamilyMembersBeforeDeath = formDetails.numberBeforeDeath;
        result.noOfFamilyMembersAfterDeath = formDetails.numberAfterDeath;
        result.deceasedContributionToIncome = formDetails.contribution;
        result.totalFamilyIncome = formDetails.totalFamilyIncome;
        result.avgIncomePerFamilyMember = formDetails.averageIncome;

        this.claimInvoiceService.updatePartialDependencyLumpsumInvoice(result).subscribe(data => {
          if (data) {
            this.closeEmit.emit(true);
          }
        });
      }
    })
  }

}
