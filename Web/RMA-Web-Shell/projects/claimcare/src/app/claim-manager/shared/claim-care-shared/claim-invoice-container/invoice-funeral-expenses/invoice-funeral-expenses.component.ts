import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { InvoiceFormService } from '../invoice-form.service';
import { FuneralExpenseInvoice } from './funeral-expense-invoice';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { DatePipe } from '@angular/common';
import { Claim } from '../../../entities/funeral/claim.model';

@Component({
  selector: 'invoice-funeral-expenses',
  templateUrl: './invoice-funeral-expenses.component.html',
  styleUrls: ['./invoice-funeral-expenses.component.css'],
  providers: [InvoiceFormService]
})
export class InvoiceFuneralExpensesComponent extends UnSubscribe implements OnChanges {

  claimInvoiceType = ClaimInvoiceTypeEnum.FuneralExpenses;
  @Input() claimInvoice: FuneralExpenseInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;
  @Input() claim: Claim;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading funeral expense invoice...please wait');

  form: UntypedFormGroup;
  funeralExpenseInvoice: FuneralExpenseInvoice;
  funeral = ClaimInvoiceTypeEnum.FuneralExpenses;
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
      this.claimInvoice = new FuneralExpenseInvoice();
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
      this.getFuneralExpenseInvoice();
      if (!this.isRepay) {
        this.isEdit = true;
      }
    } else {
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FuneralExpenses;
    }
    this.isLoading$.next(false);
  }

  getFuneralExpenseInvoice() {
    this.claimInvoiceService.getFuneralExpenseInvoice(this.claimInvoice.claimInvoiceId).subscribe(funeral => {
      this.funeralExpenseInvoice = funeral;
      this.claimInvoice.payeeTypeId = funeral.payeeTypeId;
      this.claimInvoice.payeeRolePlayerId = funeral.payeeRolePlayerId;
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FuneralExpenses;
      this.claimInvoice.claimInvoice.dateSubmitted = funeral.claimInvoice.invoiceDate;
      this.claimInvoice.claimInvoice.invoiceAmount = funeral.claimInvoice.invoiceAmount;
      this.claimInvoice.claimInvoice.payeeRolePlayerId = funeral.payeeRolePlayerId;
      this.claimInvoice.claimInvoice.payeeTypeId = funeral.payeeTypeId;
      this.description$.next(funeral.description);
    })
  }

  readForm(): any {
    const genericForm = this.invoiceFormService.getGenericForm();
    this.funeralExpenseInvoice = new FuneralExpenseInvoice();
    this.funeralExpenseInvoice.claimInvoice = new ClaimInvoice();
    this.funeralExpenseInvoice.claimInvoice.invoiceDate = new Date(genericForm.invoiceDate).getCorrectUCTDate();
    this.funeralExpenseInvoice.claimInvoice.dateReceived = genericForm.dateReceived
      ? new Date(genericForm.dateReceived).getCorrectUCTDate()
      : new Date(genericForm.invoiceDate).getCorrectUCTDate();
    this.funeralExpenseInvoice.description = genericForm.description ? genericForm.description : '';   //TODO
    this.funeralExpenseInvoice.claimInvoice.invoiceAmount = genericForm.invoiceAmount;
    this.funeralExpenseInvoice.claimInvoice.claimAmount = genericForm.invoiceAmount;

    this.funeralExpenseInvoice.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.funeralExpenseInvoice.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.funeralExpenseInvoice.claimId = this.claim.claimId;
    this.funeralExpenseInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.FuneralExpenses;
    this.funeralExpenseInvoice.claimInvoice.isAuthorised = 0;
    this.funeralExpenseInvoice.claimInvoice.externalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.funeralExpenseInvoice.claimInvoice.internalReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.funeralExpenseInvoice.claimInvoice.claimReferenceNumber = this.personEvent.claims[0].claimReferenceNumber;
    this.funeralExpenseInvoice.claimInvoice.policyId = this.personEvent.claims[0]?.policyId ? this.personEvent.claims[0]?.policyId : 22880;  //TODO
    this.funeralExpenseInvoice.claimInvoice.product = 'EMP';  //TODO
    this.funeralExpenseInvoice.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
    this.funeralExpenseInvoice.claimInvoice.capturedDate = genericForm.capturedDate;
    this.funeralExpenseInvoice.claimInvoice.claimId = this.claim.claimId;
    this.funeralExpenseInvoice.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;
    return this.funeralExpenseInvoice;
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
    this.loadingMessages$.next('saving funeral expense invoice....please wait');
    
    let funeralInvoice = this.readForm();
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.personEvent.claims[0].claimId)
      .subscribe(result => {
        if (result && result[0].claimBenefitId > 0) {
          funeralInvoice.claimInvoice.claimBenefitId = result[0].claimBenefitId;
          this.claimInvoiceService.addFuneralExpenseInvoice(funeralInvoice).subscribe(result => {
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
    this.claimInvoiceService.getFuneralExpenseInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
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

        this.claimInvoiceService.updateFuneralExpInvoice(result).subscribe(data => {
          if (data) {
            this.closeEmit.emit(true);
          }
        });
      }
    })
  }

}
