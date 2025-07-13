import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { SundryInvoice } from '../invoice-sundry/sundry-invoice';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { InvoiceFormService } from '../invoice-form.service';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';

@Component({
  selector: 'invoice-teba',
  templateUrl: './invoice-teba.component.html',
  styleUrls: ['./invoice-teba.component.css'],
  providers: [InvoiceFormService]
})
export class InvoiceTebaComponent extends UnSubscribe implements OnChanges {

  @Input() claimInvoice: ClaimInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;

  @Output() closeDialogEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');

  form: UntypedFormGroup;
  sundryInvoice: SundryInvoice;
  PayeeTypes: PayeeTypeEnum[];

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly invoiceFormService: InvoiceFormService) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.claimInvoice.claimInvoiceId) { return; }
    this.createForm();
  }

  getLookups() {
    this.PayeeTypes = this.ToArray(PayeeTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  createForm() {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      invoiceDate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateReceived: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      payeeType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      payee: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      invoiceAmount: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      description: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      supplierInvNumber: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      serviceDate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      providerType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      providerName: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      serviceType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      vatRate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      vat: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      invoiceTotal: [{ value: '', disabled: this.isReadOnly }, Validators.required],
    });
    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      invoiceDate: this.claimInvoice && this.claimInvoice.invoiceDate ? this.claimInvoice.invoiceDate : this.claimInvoice.invoiceDate,
      dateReceived: this.claimInvoice && this.claimInvoice.dateReceived ? this.claimInvoice.dateReceived : this.claimInvoice.dateReceived,
    });

    this.isLoading$.next(false);
  }

  readForm(): any {
    if (!this.form.valid) {
      return;
    }
    const formDetails = this.form.getRawValue();
    const personEvent = this.claimInvoice;

    return personEvent;
  }

  formValid(): boolean {
    return this.invoiceFormService.isValidSave();
  }

  formInValid(): boolean {
    return this.invoiceFormService.formInvalid();
  }

  save() {
    this.isLoading$.next(false);

    let sundryInvoice = this.readForm();
    this.claimInvoiceService.addWidowLumpSumInvoice(sundryInvoice).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      }
    })
  }

  closeDialog() {
    this.closeDialogEmit.emit(true);
  }
}
