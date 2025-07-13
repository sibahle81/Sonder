import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ProsthetistQuote } from '../../../models/prosthetistquote';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MediCarePreAuthService } from '../../../services/medicare-preauth.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PayeeTypeService } from 'projects/shared-services-lib/src/lib/services/payee-type/payee-type.service';
import { TariffBaseUnitCostTypesService } from 'projects/medicare/src/app/medical-invoice-manager/services/tariff-base-unit-cost-types.service';
import { MedicalInvoiceHealthcareProviderService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-healthcare-provider.service';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { QuotationType } from '../../../models/QuotationType';
import { ProsthetistType } from '../../../models/ProsthetistType';
import { ProstheticItem } from '../../../models/ProstheticItem';
import { ProstheticItemCategory } from '../../../models/ProstheticItemCategory';
import { ProstheticQuotationTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/prosthetic-quotation-type-enum';
import { ProstheticQuoteStatusEnum } from 'projects/medicare/src/app/medi-manager/enums/prosthetic-quote-status-enum';
import { ProstheticTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/prosthetic-type-enum';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { isNullOrUndefined } from 'util';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';

@Component({
  selector: 'app-prosthetist-quote-capture',
  templateUrl: './prosthetist-quote-capture.component.html',
  styleUrls: ['./prosthetist-quote-capture.component.css']
})
export class ProsthetistQuoteCaptureComponent extends WizardDetailBaseComponent<ProsthetistQuote> implements OnInit {


  prosthetistQuoteForm: UntypedFormGroup;
  preAuthNo: boolean = false;
  isPaymentDelay: boolean = false;

  invoiceDate: Date;
  healthCareProviderVatAmount: number;
  payeeType = PayeeTypeEnum.HealthCareProvider;
  healthCareProviderId: number;
  tariffId: number;

  // values to pass to tariff search Input
  claimNumber: string;
  tariffSearchType: string;
  tariffTypeId: number = 0;
  preAuthFromDate: Date;
  practitionerTypeId: number;

  //for claim search
  personEventId: number;
  selectedPersonEvent: PersonEventModel;

  submitInvoiceData;
  selectedTariffBaseUnitCostTypeId: number;
  selectedPayeeTypeId: number;

  currentUrl = this.router.url;

  tariffBaseUnitCostTypes;
  payeeTypes;
  jvPartners: HealthCareProviderModel[] = [];
  jvHealthCareProviderId: number;
  isPracticeActive: boolean;
  selectedEvent: EventModel;
  quotationTypeList: QuotationType[]
  prosthetistTypeList: ProsthetistType[]
  prostheticItemList: ProstheticItem[]
  prostheticItemCategoryList: ProstheticItemCategory[]

  prosthetistQuoteId: number;
  rolePlayerId: number;
  prosthetistId: number;
  pensionCaseId: number;
  claimId: number;
  prosthetistQuotationDetails: ProsthetistQuote = new ProsthetistQuote()
  prosthetistQuotationParams: any;
  prosTypeSpecification: string;
  prosthetistTypeId: number;
  quotationTypeId: ProstheticQuotationTypeEnum | null;
  prostheticQuotationTypes: ProstheticQuotationTypeEnum[];
  prostheticQuoteStatuses: ProstheticQuoteStatusEnum[];
  prostheticTypes: ProstheticTypeEnum[];

  documentSet = DocumentSetEnum.MedicalProstheticDocuments;
  requiredDocumentsUploaded = false;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  preAuthId: number;

  constructor(private formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private activeRoute: ActivatedRoute,
    private readonly medicalInvoiceHealthcareProviderService: MedicalInvoiceHealthcareProviderService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly tariffBaseUnitCostTypesService: TariffBaseUnitCostTypesService,
    private readonly payeeTypeService: PayeeTypeService,
    public datepipe: DatePipe,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly toasterService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly eventService: ClaimCareService,
    public dialog: MatDialog) {
    super(appEventsManager, authService, activeRoute,);

    this.createForm();
    this.onLoadLookups();
  }
  loading$ = new BehaviorSubject<boolean>(false);

  onLoadLookups(): void {
    this.getJointVentureMedicalServiceProviders();
  }

  getJointVentureMedicalServiceProviders(): void {
    this.healthcareProviderService.getJvHealthCareProviders().subscribe({
      next: (healthCareProviders) => {
        this.jvPartners = healthCareProviders;
      },
      error: (err) => {
        this.alertService.error('Failed to load JV Health Care Providers', err);
      }
    });
  }

  populateModel(): void {
  if (!this.model) return;

  const formValue = this.prosthetistQuoteForm.getRawValue();
  const currentUser = this.authService.getCurrentUser();

  const model = this.model as ProsthetistQuote;

  model.prosthetistQuoteId = formValue.prosthetistQuoteId > 0 ? formValue.prosthetistQuoteId : 0;
  model.rolePlayerId = this.prosthetistQuotationParams?.healthCareProviderId ?? null;
  model.prosthetistId = 1; // TODO: Link to user table implementation
  model.pensionCaseId = null; // TODO: Set based on claim age logic
  model.claimId = this.prosthetistQuotationParams?.claimId ?? null;
  model.quotationAmount = formValue.quotationAmount;
  model.comments = formValue.comments;
  model.prostheticType = this.prosthetistTypeId;
  model.prosTypeSpecification = this.prosTypeSpecification;
  model.reviewedDateTime = null;
  model.reviewedComments = ""; 
  model.prostheticQuotationType = this.quotationTypeId;
  model.isRejected = null; 
  model.isRequestInfo = null; 
  model.createdBy = currentUser.email;

  
  switch (this.quotationTypeId) {
    case ProstheticQuotationTypeEnum.Orthotic:
      model.reviewedBy = null;
      model.isSentForReview = null;
      model.isAutoApproved = true;
      model.prostheticQuoteStatus = ProstheticQuoteStatusEnum.Authorised;
      model.signedBy = currentUser.id;
      model.isApproved = true;
      break;

    case ProstheticQuotationTypeEnum.Prosthetic:
    case ProstheticQuotationTypeEnum.ProstheticOrthotic:
      model.reviewedBy = this.jvHealthCareProviderId ?? null;
      model.isSentForReview = true;
      model.isAutoApproved = false;
      model.prostheticQuoteStatus = ProstheticQuoteStatusEnum.PendingReview;
      model.signedBy = this.jvHealthCareProviderId ?? null;
      model.isApproved = false;
      break;

    default:
      break;
  }
}


  populateForm(): void {
    let wizardData = JSON.parse(this.context.wizard.data)[0];
    let quotationId = this.context.wizard.linkedItemId;
    this.preAuthId = (wizardData['preAuthId'] > 0) ? wizardData['preAuthId'] : 0;

    this.mediCarePreAuthService.getProsthetistQuotationsById(quotationId).subscribe(
      result => {
        this.model = result;
      });

    if (!this.model) return;
    const form = this.prosthetistQuoteForm.controls;
    const model = this.model;
    this.claimId = model.claimId;

    this.prosthetistQuotationParams = {
      claimId: model["claimId"],
      personEventId: model["personEventId"],
      claimReferenceNumber: model["claimReferenceNumber"],
      eventDate: model["eventDate"],
      healthCareProviderId: model["healthCareProviderId"],
      practitionerTypeId: model["practitionerTypeId"],
      healthCareProviderName: model["healthCareProviderName"],
      practiceNumber: model["practiceNumber"],
      prostheticQuotationType: model["prostheticQuotationType"]
    }

    form.practiceNumber.patchValue(this.prosthetistQuotationParams.practiceNumber);//this.model.practiceNumber;
    // form.prostheticsJV.patchValue(this.model.prosthetistId); --implimentation will come later
    form.serviceProvider.patchValue(this.prosthetistQuotationParams.healthCareProviderName);
    form.quotationAmount.patchValue(this.model.quotationAmount);
    form.prostheticType.patchValue(this.model.prostheticType);
    form.comments.patchValue(this.model.comments);
    form.signedByMCA.patchValue(this.model.signedBy);
    form.isApproved.patchValue(this.model.isApproved);
    form.reviewCommentRMA.patchValue(this.model.reviewedComments);

  }

  onReset() {
    this.prosthetistQuoteForm.reset()
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    //run validations for front end end of wizard - validations will come once all rules are in & data
    // if (this.model != null) {

    return validationResult;
  }
  

  ngOnInit() {

    this.prostheticQuotationTypes = MedicareUtilities.getLookups(ProstheticQuotationTypeEnum);
    this.prostheticQuoteStatuses = MedicareUtilities.getLookups(ProstheticQuoteStatusEnum);
    this.prostheticTypes = MedicareUtilities.getLookups(ProstheticTypeEnum);

  }

  onChangeProstheticJV(event) {
    this.jvHealthCareProviderId = event?.value
  }

  onChangeProstheticType(event) {
    this.prosTypeSpecification = MedicareUtilities.formatLookup(event?.value);
    this.prosthetistTypeId = MedicareUtilities.getProstheticTypeEnumId(event?.value);
  }

  onChangeQuotationType(event) {
    this.quotationTypeId = MedicareUtilities.getProstheticQuotationTypeEnumId(event?.value);
  }

  createForm(): void {
    this.prosthetistQuoteForm = this.formBuilder.group({
      practiceNumber: [''],
      prostheticsJV: [''],
      serviceProvider: [''],
      quotationAmount: [{ value: '' }, Validators.required],
      prostheticType: [{ value: '' }, Validators.required],
      comments: [{ value: '' }, Validators.required],
      signedByMCA: [{ value: '', disabled: true }],
      isApproved: [{ value: '', disabled: true }],
      reviewCommentRMA: [{ value: '', disabled: true }],//conditional implementation will come later
    });
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

  getError(control) {

    switch (control) {
      case 'prostheticsJV':
        if (this.prosthetistQuoteForm.get('prostheticsJV').hasError('required') && this.prosthetistQuoteForm.controls?.prostheticsJV.touched) {
          return 'prostheticsJV required';
        }
        break;
      case 'quotationAmount':
        if (this.prosthetistQuoteForm.get('quotationAmount').hasError('required') && this.prosthetistQuoteForm.controls?.quotationAmount.touched) {
          return 'quotationAmount required';
        }
        break;
      case 'prostheticType':
        if (this.prosthetistQuoteForm.get('prostheticType').hasError('required') && this.prosthetistQuoteForm.controls?.prostheticType.touched) {
          return 'prostheticTyperequired';
        }
        break;
      case 'comments':
        if (this.prosthetistQuoteForm.get('comments').hasError('required') && this.prosthetistQuoteForm.controls?.comments.touched) {
          return 'comments required';
        }
        break;
      case 'signedByMCA':
        if (this.prosthetistQuoteForm.get('signedByMCA').hasError('required') && this.prosthetistQuoteForm.controls?.signedByMCA.touched) {
          return 'signedByMCA required';
        }
        break;

      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
  }

}
