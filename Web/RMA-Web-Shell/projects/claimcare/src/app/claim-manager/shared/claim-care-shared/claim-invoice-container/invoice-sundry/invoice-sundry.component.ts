import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { SundryInvoice } from './sundry-invoice';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { InvoiceFormService } from '../invoice-form.service';
import { SundryServiceProviderTypeEnum } from './sundry-service-provider-type-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { SundryProvider } from './sundry-provider';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceDecisionEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-decision-enum';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { ClaimSundryServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-sundry-service-type-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { ClaimBenefit } from '../../../entities/claim-benefit';
import { PolicyService } from 'projects/fincare/src/app/shared/services/policy.service';
import { Claim } from '../../../entities/funeral/claim.model';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'invoice-sundry',
  templateUrl: './invoice-sundry.component.html',
  styleUrls: ['./invoice-sundry.component.css'],
  providers: [InvoiceFormService]
})
export class InvoiceSundryComponent extends UnSubscribe implements OnChanges {

  @Input() claimInvoice: SundryInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() claim: Claim;
  @Input() isReadOnly = false;
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');
  sundryDescription$: BehaviorSubject<string> = new BehaviorSubject(null);

  form: UntypedFormGroup;
  PayeeTypes: PayeeTypeEnum[];
  vatRates: VatCodeEnum[];
  sundryInvoiceTypes: SundryServiceProviderTypeEnum[];
  sundryProviders: SundryProvider[];
  serviceTypes: ClaimSundryServiceTypeEnum[]
  sundryInvoice: SundryInvoice;
  canSave: boolean;
  selectedPayeeTypes = [PayeeTypeEnum[PayeeTypeEnum.SundryProvider]];
  maxDate = new Date();
  claimBenefits: ClaimBenefit[];
  policy: Policy;
  isAddRecord = false;

  sundry = ClaimInvoiceTypeEnum.SundryInvoice;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly invoiceFormService: InvoiceFormService,
    public readonly claimCareService: ClaimCareService,
    private readonly policyService: PolicyService,
    private readonly datePipe: DatePipe,
  ) {
    super();
    this.getLookups();

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getClaimBenefitsByClaimId();
  }

  getLookups() {
    this.PayeeTypes = this.ToArray(PayeeTypeEnum);
    this.vatRates = this.ToArray(VatCodeEnum);
    this.sundryInvoiceTypes = this.ToArray(SundryServiceProviderTypeEnum);
    this.serviceTypes = this.ToArray(ClaimSundryServiceTypeEnum);
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
      supplierInvNumber: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      serviceDate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      providerType: [{ value: '', disabled: this.isReadOnly }],
      providerName: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      serviceType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      vatRate: [{ value: '', disabled: true }],
      vat: [{ value: '', disabled: true }, Validators.required],
      invoiceTotal: [{ value: '', disabled: true }],
    });

    this.invoiceFormService.addForm(this.form);
    this.populateForm();
  }

  populateForm() {
    if (this.claimInvoice.claimInvoiceId > 0) {
      this.getSundryInvoiceDetails();
      if (this.isRepay) {
        this.isAddRecord = true;
      }
    }
    else {
      this.isAddRecord = true;
      this.claimInvoice.claimInvoice = new ClaimInvoice();
      this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.SundryInvoice;
      this.sundryDescription$.next('');
      this.setForm();
    }
  }

 getPolicy() {
    this.loadingMessages$.next('loading policy...please wait');
    this.policyService.getPolicyWithProductOptionByPolicyId(this.claim.policyId).subscribe(result => {
      if (result) {
        this.policy = result;
      }
      this.sundryProvidersInit();
    }
  );
 }

  getSundryInvoiceDetails() {
    this.claimInvoiceService.getSundryInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        this.sundryInvoice = result;

        this.claimInvoice.payeeTypeId = result.payeeTypeId;
        this.claimInvoice.claimInvoice = new ClaimInvoice();
        this.claimInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.SundryInvoice;
        this.claimInvoice.claimInvoice.dateSubmitted = result.claimInvoice.invoiceDate;
        this.claimInvoice.claimInvoice.dateReceived = result.claimInvoice.dateReceived;
        this.claimInvoice.claimInvoice.invoiceAmount = result.claimInvoice.invoiceAmount;
        this.claimInvoice.claimInvoice.payeeTypeId = result.payeeTypeId;
        this.claimInvoice.claimInvoice.payee = result.payee;
        this.claimInvoice.claimInvoice.payeeRolePlayerId = result.payeeRolePlayerId;

        this.sundryDescription$.next(this.sundryInvoice.description);
        this.getSundryServiceProvider(this.sundryInvoice.providerType);
        this.setForm();
      }
    });
  }

  sundryProvidersInit() {
    this.loadingMessages$.next('loading sundry providers...please wait');
    this.invoiceFormService.sundryProviders.subscribe(result => {
      if (result.length > 0) {
        this.sundryProviders = result;
      }
      this.createForm();
      this.isLoading$.next(false);
    });
  }

  providerTypeChange($event: SundryServiceProviderTypeEnum) {
    this.claimCareService.getSundryServiceProvidersByType($event).subscribe(result => {
      if (result) {
        this.sundryProviders = result;
      }
    });
  }

  providerNameChange($event: any) {
    let provider = this.sundryProviders.find(a => a.rolePlayerId == $event);
    let invoice = this.invoiceFormService.getGenericForm();

    let vatAmount = invoice.invoiceAmount * 0.15;
    let vatRate = provider.isVat ? VatCodeEnum[VatCodeEnum.StandardVATRate] : VatCodeEnum[VatCodeEnum.InvalidVATType];
    let invoiceTotal = provider.isVat ? Number(invoice.invoiceAmount) + vatAmount : Number(invoice.invoiceAmount);

    this.form.patchValue({
      vat: vatAmount,
      vatRate: vatRate,
      invoiceTotal: invoiceTotal
    });
  }

  getSundryServiceProvider(serviceProviderType: SundryServiceProviderTypeEnum) {
    this.claimCareService.getSundryServiceProvidersByType(serviceProviderType).subscribe(result => {
      if (result) {
        this.sundryProviders = result;
      }
    });
  }

  setForm() {
    let vatAmount = this.sundryInvoice?.claimInvoice.invoiceAmount * 0.15;

    this.form.patchValue({
      supplierInvNumber: this.sundryInvoice && this.sundryInvoice.supplierInvoiceNo ? this.sundryInvoice.supplierInvoiceNo : null,
      serviceDate: this.sundryInvoice && this.sundryInvoice.serviceDate ? this.sundryInvoice.serviceDate : null,
      providerType: this.sundryInvoice && this.sundryInvoice.providerType ? SundryServiceProviderTypeEnum[this.sundryInvoice.providerType] : null,
      providerName: this.sundryInvoice && this.sundryInvoice.providerName ? Number(this.sundryInvoice.providerName) : null,
      serviceType: this.sundryInvoice && this.sundryInvoice.serviceType ? ClaimSundryServiceTypeEnum[this.sundryInvoice.serviceType] : null,

      vatRate: this.sundryInvoice && this.sundryInvoice.claimInvoice.authorisedVat ? VatCodeEnum[this.sundryInvoice.claimInvoice.authorisedVat] : null,
      vat: this.sundryInvoice && this.sundryInvoice.claimInvoice.invoiceVat ? this.sundryInvoice.claimInvoice.invoiceVat : null,
      invoiceTotal: this.sundryInvoice && this.sundryInvoice.claimInvoice.authorisedVat
                                          ? Number(this.sundryInvoice.claimInvoice.invoiceAmount) + vatAmount : null,
    });

    this.isLoading$.next(false);
  }

  readForm(): any {

    if (!this.form.valid) { return; }
    const formDetails = this.form.getRawValue();
    const genericForm = this.invoiceFormService.getGenericForm();
    this.sundryInvoice = new SundryInvoice();
    this.sundryInvoice.claimInvoice = new ClaimInvoice();

    this.sundryInvoice.claimInvoice.invoiceDate = genericForm.invoiceDate;
    this.sundryInvoice.claimInvoice.dateReceived = genericForm.dateReceived ? new Date(genericForm.dateReceived) : new Date(genericForm.invoiceDate);
    this.sundryInvoice.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.sundryInvoice.payee = genericForm.payee ? genericForm.payee : 'N/A';
    this.sundryInvoice.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.sundryInvoice.claimInvoice.invoiceAmount = genericForm.invoiceAmount ? genericForm.invoiceAmount : null;
    this.sundryInvoice.supplierInvoiceNo = formDetails.supplierInvNumber ? formDetails.supplierInvNumber : null;
    this.sundryInvoice.serviceDate = genericForm.dateReceived ? new Date(genericForm.dateReceived) : new Date(formDetails.serviceDate);
    this.sundryInvoice.providerType = +SundryServiceProviderTypeEnum[formDetails.providerType];
    this.sundryInvoice.providerName = formDetails.providerName ? formDetails.providerName : 'N/A';
    this.sundryInvoice.description = genericForm.description ? genericForm.description : String.Empty;
    this.sundryInvoice.referenceNumber = this.personEvent.personEventReferenceNumber;
    this.sundryInvoice.serviceType = +ClaimSundryServiceTypeEnum[formDetails.serviceType];
    this.sundryInvoice.claimInvoice.authorisedVat = +VatCodeEnum[formDetails.vatRate];
    this.sundryInvoice.claimInvoice.invoiceVat = formDetails.vat;
    this.sundryInvoice.claimInvoice.claimAmount = genericForm.invoiceAmount;
    this.sundryInvoice.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.SundryInvoice;
    this.sundryInvoice.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
    this.sundryInvoice.claimInvoice.claimBenefitId = this.claimBenefits.filter(x => x.benefitId = EstimateTypeEnum.Sundry).map(x => x.claimBenefitId)[0];
    this.sundryInvoice.claimInvoice.isAuthorised = 1;
    this.sundryInvoice.claimInvoice.externalReferenceNumber = null;
    this.sundryInvoice.claimInvoice.internalReferenceNumber = null;
    this.sundryInvoice.claimInvoice.claimReferenceNumber = this.personEvent.personEventReferenceNumber;
    this.sundryInvoice.claimInvoice.claimId = this.claim.claimId;
    this.sundryInvoice.claimInvoice.policyId = this.claim.policyId ? this.claim.policyId : 0;
    this.sundryInvoice.claimInvoice.product = this.policy.productOption.code;
    this.sundryInvoice.claimInvoice.decision = ClaimInvoiceDecisionEnum.approve;
    this.sundryInvoice.personEventId = this.personEvent.personEventId;
    this.sundryInvoice.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;

    return this.sundryInvoice;
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

  getClaimBenefitsByClaimId() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('loading invoices...please wait');
    this.claimInvoiceService.getClaimBenefitsByClaimId(this.claim.claimId).subscribe(results => {
      this.claimBenefits = results;
      this.getPolicy();

    });
  }
  save() {
    this.isLoading$.next(true);
    this.hideEmit.emit(true);
    this.loadingMessages$.next('saving sundry invoice....please wait');

    let sundryInvoice = this.readForm();
    this.claimInvoiceService.addSundryInvoice(sundryInvoice).subscribe(result => {
      if (result) {
        this.closeEmit.emit(true);
      }
    });
  }

  update() {
    this.isLoading$.next(true);
    const genericForm = this.invoiceFormService.getGenericForm();
    this.claimInvoiceService.getSundryInvoice(this.claimInvoice.claimInvoiceId).subscribe(result => {
      if (result) {
        result.description = genericForm.description ? genericForm.description : String.Empty;
        result.claimInvoice.dateReceived = genericForm.dateReceived
                                                            ? new Date(this.datePipe.transform(genericForm.dateReceived, 'yyyy-MM-dd')).getCorrectUCTDate()
                                                            : new Date(this.datePipe.transform(genericForm.invoiceDate, 'yyyy-MM-dd')).getCorrectUCTDate();
        result.claimInvoice.invoiceAmount = genericForm.invoiceAmount ? genericForm.invoiceAmount : null;
        result.claimInvoice.claimAmount = genericForm.invoiceAmount;
        result.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
        result.payeeRolePlayerId = +genericForm.payeeRolePlayer;

        this.claimInvoiceService.updateSundryInvoice(result).subscribe(result => {
          if (result) {
            this.closeEmit.emit(true);
          }
        });
      }
    })
  }
}
