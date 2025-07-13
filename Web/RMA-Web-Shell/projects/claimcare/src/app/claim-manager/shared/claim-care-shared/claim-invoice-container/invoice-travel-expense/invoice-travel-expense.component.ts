import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { InvoiceFormService } from '../invoice-form.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { TravelExpenseInvoice } from './travel-expense-invoice';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { Claim } from '../../../entities/funeral/claim.model';
import { DatePipe } from '@angular/common';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';

@Component({
  selector: 'invoice-travel-expense',
  templateUrl: './invoice-travel-expense.component.html',
  styleUrls: ['./invoice-travel-expense.component.css'],
  providers: [InvoiceFormService]
})
export class InvoiceTravelExpenseComponent extends UnSubscribe implements OnChanges {

  claimInvoiceType = ClaimInvoiceTypeEnum.TravelAward;
  @Input() claimInvoice: TravelExpenseInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;
  @Input() claim: Claim;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading travel expense invoice...please wait');

  form: UntypedFormGroup;
  travelExpenseInvoice: TravelExpenseInvoice;
  travel = ClaimInvoiceTypeEnum.TravelAward;
  description$: BehaviorSubject<string> = new BehaviorSubject(null);
  isEdit = false;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly invoiceFormService: InvoiceFormService,
    private readonly datePipe: DatePipe,) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.claimInvoice) {
      this.claimInvoice = new TravelExpenseInvoice();
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = +this.claimInvoiceType;
    }
    this.createForm();
  }

  getLookups() {
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      supplierInvNumber: [{ value: '', disabled: this.isReadOnly }],
      serviceDate: [{ value: '', disabled: this.isReadOnly }],
      providerType: [{ value: '', disabled: this.isReadOnly }],
      providerName: [{ value: '', disabled: this.isReadOnly }],
      serviceType: [{ value: '', disabled: this.isReadOnly }],
      vatRate: [{ value: '', disabled: this.isReadOnly }],
      vat: [{ value: '', disabled: this.isReadOnly }],
      invoiceTotal: [{ value: '', disabled: this.isReadOnly }],
    });

    this.invoiceFormService.addForm(this.form);
    this.populateForm();
  }

  populateForm() {
    if (this.claimInvoice.claimInvoiceId > 0) {
      this.getTravelExpenseInvoice();
      if (!this.isRepay) {
        this.isEdit = true;
      }
    } else {
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.TravelAward;
    }
    this.isLoading$.next(false);
  }

  getTravelExpenseInvoice() {
    this.claimInvoiceService.getTravelExpenseInvoice(this.claimInvoice.claimInvoiceId).subscribe(travelInvoice => {
      this.travelExpenseInvoice = travelInvoice;
      this.claimInvoice.payeeTypeId = travelInvoice.payeeTypeId;
      this.claimInvoice.payeeRolePlayerId = travelInvoice.payeeRolePlayerId;
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.TravelAward;
      this.claimInvoice.claimInvoice.dateSubmitted = travelInvoice.claimInvoice.invoiceDate;
      this.claimInvoice.claimInvoice.invoiceAmount = travelInvoice.claimInvoice.invoiceAmount;
      this.claimInvoice.claimInvoice.payeeRolePlayerId = travelInvoice.payeeRolePlayerId;
      this.claimInvoice.claimInvoice.payeeTypeId = travelInvoice.payeeTypeId;
      this.description$.next(travelInvoice.description);
    })
  }

  readForm(): any {
    const genericForm = this.invoiceFormService.getGenericForm();
    this.travelExpenseInvoice = new TravelExpenseInvoice();
    this.travelExpenseInvoice.claimInvoice = new ClaimInvoice();
    this.travelExpenseInvoice.claimInvoice.invoiceDate = new Date(genericForm.invoiceDate).getCorrectUCTDate();
    this.travelExpenseInvoice.claimInvoice.dateReceived = genericForm.dateReceived
      ? new Date(genericForm.dateReceived).getCorrectUCTDate()
      : new Date(genericForm.invoiceDate).getCorrectUCTDate();
    this.travelExpenseInvoice.description = genericForm.description ? genericForm.description : '';   //TODO
    this.travelExpenseInvoice.claimInvoice.invoiceAmount = genericForm.invoiceAmount;
    this.travelExpenseInvoice.claimInvoice.claimAmount = genericForm.invoiceAmount;

    this.travelExpenseInvoice.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.travelExpenseInvoice.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.travelExpenseInvoice.claimId = this.claim.claimId;
    this.travelExpenseInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FuneralExpenses;
    this.travelExpenseInvoice.claimInvoice.isAuthorised = 0;
    this.travelExpenseInvoice.claimInvoice.externalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.travelExpenseInvoice.claimInvoice.internalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.travelExpenseInvoice.claimInvoice.claimReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.travelExpenseInvoice.claimInvoice.policyId = this.personEvent.claims[0]?.policyId ? this.personEvent.claims[0]?.policyId : 22880;  //TODO
    this.travelExpenseInvoice.claimInvoice.product = 'EMP';  //TODO
    this.travelExpenseInvoice.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
    this.travelExpenseInvoice.claimInvoice.capturedDate = genericForm.capturedDate;
    this.travelExpenseInvoice.claimInvoice.claimId = this.claim.claimId;
    this.travelExpenseInvoice.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;
    return this.travelExpenseInvoice;
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
    this.loadingMessages$.next('saving travel expense invoice....please wait');
    
    let travelInvoice = this.readForm();
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.personEvent.claims[0].claimId)
      .subscribe(result => {
        if (result && result[0].claimBenefitId > 0) {
          travelInvoice.claimInvoice.claimBenefitId = result[0].claimBenefitId;
          this.claimInvoiceService.addTravelExpenseInvoice(travelInvoice).subscribe(result => {
            if (result) {
              this.closeEmit.emit(true);
            }
          })
        }
      });
  }

  update() {
    this.isLoading$.next(true);
    const formDetails = this.form.getRawValue();
    const genericForm = this.invoiceFormService.getGenericForm();
    this.claimInvoiceService.getTravelExpenseInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        result.description = genericForm.description ? genericForm.description : String.Empty;
        result.claimInvoice.invoiceDate = new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
        result.claimInvoice.dateReceived = genericForm.dateReceived
          ? new Date(this.datePipe.transform(genericForm.dateReceived, 'yyyy-MM-dd')).getCorrectUCTDate()
          : new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();

        result.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
        result.payeeRolePlayerId = +genericForm.payeeRolePlayer;
        result.claimInvoice.invoiceAmount = genericForm.invoiceAmount;
        result.claimInvoice.claimAmount = genericForm.invoiceAmount;

        this.claimInvoiceService.updateTravelExpInvoice(result).subscribe(data => {
          if (data) {
            this.closeEmit.emit(true);
          }
        });
      }
    })
  }

}
