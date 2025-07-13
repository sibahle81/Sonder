import { Component, EventEmitter, Output, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { isNullOrUndefined } from 'util';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { PreauthTypeEnum } from '../../../enums/preauth-type-enum';

@Component({
  selector: 'preauth-claim-search',
  templateUrl: './preauth-claim-search.component.html',
  styleUrls: ['./preauth-claim-search.component.css']
})

export class PreAuthClaimSearchComponent extends WizardDetailBaseComponent<PreAuthorisation> {

  @Input() claimSearchShowOnlySearchField: boolean;
  @Output() claimSearchResponse: EventEmitter<PreAuthClaimDetail> = new EventEmitter<PreAuthClaimDetail>();

  public form: UntypedFormGroup;
  showSearchProgress = false;
  disabled: boolean = true;
  preAuthClaimDetail: PreAuthClaimDetail;
  isLoadingCategories = false;
  cellNumberPlaceholder = ConstantPlaceholder.cellNumberPlaceholder;
  cellNumberPrefix = ConstantPlaceholder.cellNumberPrefix;
  cellNumberFormat = ConstantPlaceholder.cellNumberFormat;
  claimNumberErrorMessage: string;
  preAuthId: number;
  isInternalUser: boolean = true;
  authType: string;
  wizardData: any;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly userService: UserService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly claimService: ClaimCareService,
    private readonly toasterService: ToastrManager
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  currentUrl = this.activatedRoute.snapshot.params.type;
  
  ngOnInit(): void {
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    this.createForm();
    this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);
    
    if (!isNullOrUndefined(this.context))
      this.wizardData = JSON.parse(this.context?.wizard?.data)[0];

    if (this.currentUrl.includes("capture-preauth-prosthetist-quote") && this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic]) {
      this.preAuthId = this.wizardData['preAuthId'];
    }

    this.loadExistingPreAuthData();
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    ReportFormValidationUtility.FieldRequired('claimNumber', 'Claim Number', this.form, validationResult);
    if (!this.form.get("isPatientVerified").value && !this.isInternalUser) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Please select patient verified check box`);
    }
    return validationResult;
  }

  populateForm(): void {
    if (this.model) {
      if(!(!this.model.temporaryReferenceNo)){
      this.search(this.model.temporaryReferenceNo);
      }
      this.form.controls.isPatientVerified.setValue(this.model.isPatientVerified);
    }    
  }

  search(claimReferenceNumber: string): void {
    this.preAuthClaimDetail = new PreAuthClaimDetail();
    this.showSearchProgress = true;
    this.mediCarePreAuthService.searchPreAuthClaimDetail(btoa(claimReferenceNumber)).subscribe((res) => {
      this.claimSearchResponse.emit(res);
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
        form.employerName.setValue(res.employerName);
        form.industryNumber.setValue(res.industryNumber);
        form.claimContactNo.setValue(res.claimContactNo);
        form.preAuthContactNo.setValue(res.preAuthContactNo);
        form.claimId.setValue(res.claimId);
        form.personEventId.setValue(res.personEventId);
        form.eventTypeId.setValue(res.eventTypeId);
        form.eventDate.setValue(res.eventDate.toString());
        this.preAuthClaimDetail.eventDate = form.eventDate.value;
        this.preAuthClaimDetail.claimReferenceNumber = form.fullClaimNumber.value;
        this.preAuthClaimDetail.claimReferenceNumber = form.claimNumber.value;
        this.preAuthClaimDetail.claimLiabilityStatus = form.claimLiabilityStatus.value;
        this.preAuthClaimDetail.isPensionCase = form.isPensionCase.value;
        this.preAuthClaimDetail.pensionCaseNumber = form.pensionCaseNumber.value;
        this.preAuthClaimDetail.personName = form.personName.value;
        this.preAuthClaimDetail.dateOfBirth = form.dateOfBirth.value;
        this.preAuthClaimDetail.idNumber = form.idNumber.value;
        this.preAuthClaimDetail.passportNumber = form.passportNumber.value;
        this.preAuthClaimDetail.employerName = form.employerName.value;
        this.preAuthClaimDetail.industryNumber = form.industryNumber.value;
        this.preAuthClaimDetail.claimContactNo = form.claimContactNo.value;
        this.preAuthClaimDetail.preAuthContactNo = form.preAuthContactNo.value;
        this.preAuthClaimDetail.claimId = form.claimId.value;
        this.preAuthClaimDetail.personEventId = form.personEventId.value;
        this.preAuthClaimDetail.eventTypeId = form.eventTypeId.value;
        this.mediCarePreAuthService.setCurrentCLaimDetails(this.preAuthClaimDetail);
        this.populateModel();

        this.claimService.checkClaimMedicalBenefits(res.claimId).subscribe((res) => {
          if(!res)            
            this.confirmservice.confirmWithoutContainer('No medical benefit Validation', `No medical benefit exist on this claim.Click OK to Proceed`,
            'Center', 'Center', 'OK').subscribe(result => {
  
            });
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
    this.model.preAuthContactNumber = formModel.preAuthContactNo;
    this.model.personEventId = formModel.personEventId;
    this.model.claimId = formModel.claimId;
    this.model.injuryDate = (this.isInternalUser && !isNullOrUndefined(formModel?.eventDate)? DateUtility.getDate(formModel?.eventDate) : null);
    this.model.eventDate = DateUtility.getDate(formModel?.eventDate);
    this.model.isPatientVerified = formModel.isPatientVerified;
    this.form.controls.isPatientVerified.setValue(formModel.isPatientVerified);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      fullClaimNumber: new UntypedFormControl('', [Validators.minLength(7)]),
      claimNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      claimLiabilityStatus: new UntypedFormControl({ value: '', disabled: this.disabled }),
      isPensionCase: new UntypedFormControl({ value: '', disabled: this.disabled }),
      pensionCaseNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      personName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      dateOfBirth: new UntypedFormControl({ value: '', disabled: this.disabled }),
      idNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      passportNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      employerName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      industryNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      claimContactNo: new UntypedFormControl({ value: '', disabled: this.disabled }),
      preAuthContactNo: new UntypedFormControl({ value: '', disabled: this.disabled }),
      claimId: new UntypedFormControl(''),
      personEventId: new UntypedFormControl(''),
      eventTypeId: new UntypedFormControl(''),
      eventDate: new UntypedFormControl(''),
      isPatientVerified: new UntypedFormControl('')
    });
  }

  clearForm(): void {
    this.form.reset();
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

  getClaimDetails(): PreAuthClaimDetail {
    let preAuthClaimDetail = new PreAuthClaimDetail();
    if (this.form) {
      const form = this.form as UntypedFormGroup;

      preAuthClaimDetail.eventDate = form.controls.eventDate.value;
      preAuthClaimDetail.claimReferenceNumber = form.controls.fullClaimNumber.value;
      preAuthClaimDetail.claimReferenceNumber = form.controls.claimNumber.value;
      preAuthClaimDetail.claimLiabilityStatus = form.controls.claimLiabilityStatus.value;
      preAuthClaimDetail.isPensionCase = form.controls.isPensionCase.value;
      preAuthClaimDetail.pensionCaseNumber = form.controls.pensionCaseNumber.value;
      preAuthClaimDetail.personName = form.controls.personName.value;
      preAuthClaimDetail.dateOfBirth = form.controls.dateOfBirth.value;
      preAuthClaimDetail.idNumber = form.controls.idNumber.value;
      preAuthClaimDetail.passportNumber = form.controls.passportNumber.value;
      preAuthClaimDetail.employerName = form.controls.employerName.value;
      preAuthClaimDetail.industryNumber = form.controls.industryNumber.value;
      preAuthClaimDetail.claimContactNo = form.controls.claimContactNo.value;
      preAuthClaimDetail.preAuthContactNo = form.controls.preAuthContactNo.value;
      preAuthClaimDetail.claimId = form.controls.claimId.value;
      preAuthClaimDetail.personEventId = form.controls.personEventId.value;
      preAuthClaimDetail.eventTypeId = form.controls.eventTypeId.value;

    }
    return preAuthClaimDetail;
  }

  loadExistingPreAuthData() {
    if (!isNullOrUndefined(this.context)) {
      let existingPreAuthModel = JSON.parse(this.context.wizard.data)[0];
      for (let key in existingPreAuthModel) {
        if (key == 'personEventId') {
          let value = existingPreAuthModel[key];
          if (!isNullOrUndefined(value)) {
            this.loadExistingClaimDetails(value);
          }
        }
      }
    }

    let authID = localStorage.getItem('preAuthId');

    if (authID !== undefined && authID !== null) {
      this.preAuthId = Number(authID);
      let preAuthorisationExisting = new PreAuthorisation;
      this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
        preAuthorisationExisting = data as PreAuthorisation;
      },
        (error) => { },
        () => {
          if (!isNullOrUndefined(preAuthorisationExisting)) {
            this.model = preAuthorisationExisting;
            this.form.controls.isPatientVerified.setValue(this.model.isPatientVerified);
            this.model.preAuthStatus = PreAuthStatus.PendingReview;
            this.loadExistingClaimDetails(this.model.personEventId);
          }
        }
      );
    }
    localStorage.removeItem('preAuthId');
  }

  loadExistingClaimDetails(personEventId) {
    this.showSearchProgress = true;


    this.preAuthClaimDetail = new PreAuthClaimDetail();
    if (personEventId > 0) {
      this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(personEventId).subscribe((res) => {
        if (res.claimId > 0) {
          this.preAuthClaimDetail = res;
        }
      },
        (error) => { this.showSearchProgress = false; },
        () => {
          if (this.preAuthClaimDetail) {
            const form = this.form.controls;
            form.fullClaimNumber.setValue(this.preAuthClaimDetail.claimReferenceNumber);
            form.claimNumber.setValue(this.preAuthClaimDetail.claimReferenceNumber);
            form.claimLiabilityStatus.setValue(this.preAuthClaimDetail.claimLiabilityStatus);
            form.isPensionCase.setValue(this.preAuthClaimDetail.isPensionCase);
            form.pensionCaseNumber.setValue(this.preAuthClaimDetail.pensionCaseNumber);
            form.personName.setValue(this.preAuthClaimDetail.personName);
            form.dateOfBirth.setValue(this.preAuthClaimDetail.dateOfBirth.toString());
            form.idNumber.setValue(this.preAuthClaimDetail.idNumber);
            form.passportNumber.setValue(this.preAuthClaimDetail.passportNumber);
            form.employerName.setValue(this.preAuthClaimDetail.employerName);
            form.industryNumber.setValue(this.preAuthClaimDetail.industryNumber);
            form.claimContactNo.setValue(this.preAuthClaimDetail.claimContactNo);
            form.preAuthContactNo.setValue(this.preAuthClaimDetail.preAuthContactNo);
            form.claimId.setValue(this.preAuthClaimDetail.claimId);
            form.personEventId.setValue(this.preAuthClaimDetail.personEventId);
            form.eventTypeId.setValue(this.preAuthClaimDetail.eventTypeId);
            form.eventDate.setValue(this.preAuthClaimDetail.eventDate.toString());
            this.populateModel();
            this.showSearchProgress = false;
          }
        }
      );
    }
  }

}
