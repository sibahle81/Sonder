import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { isNullOrUndefined } from 'util';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { PreauthTypeEnum } from '../../../enums/preauth-type-enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { TebaInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { TebaInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/teba-invoice.service';
import { invoicesDetails } from 'projects/legalcare/src/app/legal-manager/views/common-dailog/common-dailog.component';

@Component({
  selector: 'invoice-claim-search',
  templateUrl: './invoice-claim-search.component.html',
  styleUrls: ['./invoice-claim-search.component.css']
})

export class InvoiceClaimSearchComponent extends WizardDetailBaseComponent<InvoiceDetails | TebaInvoice> {

  public form: UntypedFormGroup;
  @Input() claimSearchShowOnlySearchField: boolean;
  showSearchProgress = false;
  disabled: boolean = true;
  cellNumberPlaceholder = ConstantPlaceholder.cellNumberPlaceholder;
  cellNumberPrefix = ConstantPlaceholder.cellNumberPrefix;
  cellNumberFormat = ConstantPlaceholder.cellNumberFormat;
  claimNumberErrorMessage: string;
  invoiceId: number;
  authType: string;
  preAuthId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly medicalInvoiceClaimService: MedicalInvoiceClaimService,
    private readonly claimService: ClaimCareService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private tebaInvoiceService: TebaInvoiceService,
    private readonly toasterService: ToastrManager
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm();
  }

  currentUrl = this.activatedRoute.snapshot.params.type;
  wizardData
  switchBatchType: SwitchBatchType
  rolePlayerId: number;

  ngOnInit(): void {

    this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);

    if (!isNullOrUndefined(this.context)) {
      this.wizardData = JSON.parse(this.context?.wizard?.data)[0];
      if (+this.wizardData['switchBatchType'] > 0)
        this.switchBatchType = +this.wizardData['switchBatchType'];
      if (+this.wizardData['healthCareProviderId'] > 0)
        this.rolePlayerId = +this.wizardData['healthCareProviderId'];

      this.getClaimsDetails()
    }

    if (this.currentUrl.includes("capture-preauth-prosthetist-quote") && this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic]) {
      this.preAuthId = this.wizardData['preAuthId'];
    }
    this.loadSelectedInvoice();
  }

  getClaimsDetails() {
    if (!isNullOrUndefined(+this.wizardData['claimId']) && +this.wizardData['claimId'] > 0) {
      this.showSearchProgress = true;
      this.claimService.GetClaim(Number(this.wizardData['claimId'])).subscribe((res) => {
        this.showSearchProgress = false;
        if (!res) {
          this.toasterService.errorToastr('Please provide claimReferenceNumber.');
        }
        else {
          this.search(res?.claimReferenceNumber);
        }
      });
    }
  }

  onLoadLookups(): void {

  }

  loadSelectedInvoice() {
    let invoiceId = localStorage.getItem('invoiceId');
    if (isNullOrUndefined(invoiceId) && this.context?.wizard?.linkedItemId > 0) {
      invoiceId = String(this.context?.wizard?.linkedItemId);
    }

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        if (!isNullOrUndefined(invoiceId) && Number(invoiceId) > 0) {
          this.invoiceId = Number(invoiceId);
          this.medicareMedicalInvoiceCommonService.getInvoiceDetails(this.invoiceId).subscribe((data) => {
            this.model = data as InvoiceDetails;
            const form = this.form.controls;
            if (form !== undefined && form !== null) {
              form.fullClaimNumber.setValue(this.model?.claimReferenceNumber);
              form.claimId.setValue(this.model?.claimId);
              form.personEventId.setValue(this.model?.personEventId);
              this.search(this.model?.claimReferenceNumber);
            }
          }
          );
        }
        break;
      case SwitchBatchType.Teba:
        this.tebaInvoiceService.getTebaInvoice(this.invoiceId).subscribe((data) => {
          this.model = data as TebaInvoice;
          const form = this.form.controls;
          if (form !== undefined && form !== null) {
            form.fullClaimNumber.setValue(this.model?.claimReferenceNumber);
            form.claimId.setValue(this.model?.claimId);
            form.personEventId.setValue(this.model?.personEventId);
            this.search(this.model?.claimReferenceNumber);
          }
        }
        );
        break;
      default:
        break;
    }

    localStorage.removeItem('invoiceId');
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.invoiceId <= 0) {
      ReportFormValidationUtility.FieldRequired('claimNumber', 'Claim Number', this.form, validationResult);
    }
    return validationResult;
  }

  populateForm(): void {
    if ('claimReferenceNumber' in this.model) {
      if (this.model && !(!this.model?.claimReferenceNumber)) {
        this.search(this.model.claimReferenceNumber);
      }
    }
  }

  search(claimReferenceNumber: string): void {
    this.showSearchProgress = true;
    this.mediCarePreAuthService.searchPreAuthClaimDetail(btoa(claimReferenceNumber)).subscribe((res) => {
      if (res.claimId > 0) {
        this.claimNumberErrorMessage = undefined;
        const form = this.form.controls;
        form.fullClaimNumber.setValue(res.claimReferenceNumber);
        form.claimNumber.setValue(res.claimReferenceNumber);
        form.claimLiabilityStatus.setValue(res.claimLiabilityStatus);
        form.isPensionCase.setValue(res.isPensionCase);
        form.pensionCaseNumber.setValue(res.pensionCaseNumber);
        form.personName.setValue(res.personName);
        form.dateOfBirth.setValue(res.dateOfBirth.toString());
        form.idNumber.setValue(res.idNumber);
        form.passportNumber.setValue(res.passportNumber);
        form.claimId.setValue(res.claimId);
        form.personEventId.setValue(res.personEventId);
        form.eventTypeId.setValue(res.eventTypeId);
        form.eventDate.setValue(res.eventDate.toString());
        if (res.dateOfDeath != null)
          form.dateOfDeath.setValue(res.dateOfDeath.toString());

        this.medicalInvoiceClaimService.validateMedicalBenefit(res.claimId, '0001-01-01').subscribe((res) => {
          if (!res)
            this.toasterService.errorToastr('No medical benefit exist on this claim.');
        });
      }
      else {
        this.claimNumberErrorMessage = 'Invalid claim, please capture correct claim reference number.';
        this.clearForm();
      }

      this.showSearchProgress = false;
    });
  }

  populateModel(): void {
    if (!this.model) return;
    const formModel = this.form.getRawValue();
    this.model.personEventId = formModel.personEventId;
    this.model.claimId = formModel.claimId;
    this.model.claimReferenceNumber = formModel.fullClaimNumber;
    if ('eventDate' in this.model && 'dateOfDeath' in this.model) {
      this.model.eventDate = formModel.eventDate;
      this.model.dateOfDeath = formModel.dateOfDeath;
    }
  }

  createForm(): void {
    if (this.form) { return; }
    let invoiceId = localStorage.getItem('invoiceId');
    this.form = this.formBuilder.group({
      fullClaimNumber: new UntypedFormControl({ value: '', disabled: (invoiceId !== undefined && invoiceId !== null && Number(invoiceId) > 0) }, [Validators.minLength(7)]),
      claimNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      claimLiabilityStatus: new UntypedFormControl({ value: '', disabled: this.disabled }),
      isPensionCase: new UntypedFormControl({ value: '', disabled: this.disabled }),
      pensionCaseNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      personName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      dateOfBirth: new UntypedFormControl({ value: '', disabled: this.disabled }),
      idNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      passportNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      claimId: new UntypedFormControl(''),
      personEventId: new UntypedFormControl(''),
      eventTypeId: new UntypedFormControl(''),
      eventDate: new UntypedFormControl(''),
      dateOfDeath: new UntypedFormControl('')
    });
  }

  clearForm(): void {
    this.form.patchValue({
      fullClaimNumber: '',
      claimNumber: '',
      claimLiabilityStatus: '',
      isPensionCase: '',
      pensionCaseNumber: '',
      personName: '',
      dateOfBirth: '',
      idNumber: '',
      passportNumber: '',
      claimId: '',
      personEventId: '',
      eventTypeId: '',
      eventDate: '',
      dateOfDeath: ''
    });
  }

  onKeypressEvent(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) {
      // invalid character, prevent input
      event.preventDefault();
    }
    if (event.currentTarget.value && (event.currentTarget.value.length == 3 || event.currentTarget.value.length == 7))
      event.currentTarget.value = event.currentTarget.value + '-';
  }

}
