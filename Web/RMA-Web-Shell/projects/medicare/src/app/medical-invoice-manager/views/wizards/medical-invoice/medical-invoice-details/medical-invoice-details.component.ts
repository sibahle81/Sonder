import { ViewChild, Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrManager } from 'ng6-toastr-notifications';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { InvoiceCaptureState } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-capture-state.enum';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MedicalInvoiceHealthcareProviderService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-healthcare-provider.service';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { TariffBaseUnitCostTypesService } from 'projects/medicare/src/app/medical-invoice-manager/services/tariff-base-unit-cost-types.service';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreauthViewModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/preauth-view-modal/preauth-view-modal.component';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { MedicalReportViewModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/medical-report-view-modal/medical-report-view-modal.component';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
import { MedicalReportCategoryEnum } from 'projects/digicare/src/app/work-manager/models/enum/medical-report-category.enum';
import { MedicalReportQueryParams } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-report-query-params';
import { InvoiceUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-under-assess-reason';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { MutualInclusiveExclusiveCode } from 'projects/medicare/src/app/medi-manager/models/mutual-inclusive-exclusive-code';
import { InvoiceLineUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-line-under-assess-reason';
import { UnderAssessReasonEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/under-assess-reason.enum';
import { MedicalInvoiceReport } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-report';
import { ValidationStateEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/validation-state-enum';
import { BehaviorSubject } from 'rxjs';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { MedicalInvoiceValidationModel } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-validation-model';
import { MedicareMedicalInvoiceCommonService } from '../../../../services/medicare-medical-invoice-common.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { MedicalUnderAssessReasonServiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-under-assess-reason-service.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { ModifierInput } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier-input';
import { ModifierOutput } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier-output';
import { Modifier } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier';
import { ViewMedicalInvoiceComponent } from '../../../view-medical-invoice/view-medical-invoice.component';
import { TimeSpan } from 'projects/medicare/src/app/shared/time-span';
import { UnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/under-assess-reason';
import { PayeeType } from 'projects/shared-models-lib/src/lib/common/payee-type';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { InvoicePayeeSearchModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-payee-search-modal/invoice-payee-search-modal.component';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'medical-invoice-details',
  templateUrl: './medical-invoice-details.component.html',
  styleUrls: ['./medical-invoice-details.component.css']
})
export class MedicalInvoiceDetailsComponent extends WizardDetailBaseComponent<InvoiceDetails> implements OnInit, OnDestroy {

  medicalInvoiceForm: UntypedFormGroup;
  preAuthNo: boolean = false;
  isPaymentDelay: boolean = false;
  invoiceLineDetails: InvoiceLineDetails[] = [];
  invoiceUnderAssessReasons: InvoiceUnderAssessReason[] = [];
  invoiceLineUnderAssessReason: InvoiceLineUnderAssessReason;
  invoiceLineUnderAssessReasons: InvoiceLineUnderAssessReason[] = [];
  underAssessReasonEnum = UnderAssessReasonEnum;
  lineUnderAssessReasons: UnderAssessReason[] = [];
  invoiceDetails: InvoiceDetails[];
  duplicateInvoiceFound: boolean = false;
  duplicateInvoiceDetails: InvoiceDetails;
  invoiceDate: Date;
  healthCareProviderVatAmount: number;
  payeeType = RolePlayerIdentificationTypeEnum.HealthCareProvider;
  RolePlayerIdentificationTypesEnum: typeof RolePlayerIdentificationTypeEnum = RolePlayerIdentificationTypeEnum;
  rolePlayerIdentificationTypes: any[] = [MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.Person]), MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.HealthCareProvider]), MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.Company])];
  rolePlayerIdentificationTypesList: RolePlayerIdentificationTypeEnum[];
  healthCareProviderId: number;
  tariffId: number;
  invoiceCaptureState = InvoiceCaptureState;
  claimNumber: string;
  tariffSearchType: string;
  tariffTypeIds: string = '0';
  preAuthFromDate: Date;
  practitionerTypeId: number;
  hideTariffAmount: boolean = false;
  hideTariffSearchControl: boolean = false;
  dateTreatmentFromToTarif;
  tarifResultsData;
  icd10CodesDescriptions: ICD10Code[] = [];
  showOnlySearchField: boolean = true;
  isSearchClaimFormHidden: boolean = false;
  isSearchProviderFormHidden: boolean = false;
  claimId: number;
  personEventId: number;
  selectedPersonEvent: PersonEventModel;
  selectedEvent: EventModel;
  icd10ListClaims = [];
  submitInvoiceData;
  newLineItem: InvoiceLineDetails;
  selectedTariffBaseUnitCostTypeId: number;
  selectedPayeeTypeId = RolePlayerIdentificationTypeEnum.HealthCareProvider;
  counter = 0;
  footerSubTotalValidationState = {
    footerSubTotalInvoiceTotalExclValidation: false,
    footerSubTotalInvoiceTotalIncValidation: false,
    footerSubTotalVatRValidation: false
  }
  linkPreAuthNumberList: PreAuthorisation[] = [];
  linkMedicalReportList: MedicalReportForm[] = [];
  linkedPreAuthDetailsList: any[] = [];
  selectedPreAuthNumber: number;
  iCD10CodeValidateState: boolean = false;
  defaultPreAuthNumber: string = "";
  defaultPreAuthId: number = 0;
  invoiceReportList: MedicalInvoiceReport[] = [];
  medicalReportType = WorkItemTypeEnum;
  medicalReportCategoryEnum = MedicalReportCategoryEnum;
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;
  medicalInvoiceValidationModel: MedicalInvoiceValidationModel[] = [];
  invUnitAmountChanged: number = 0;
  selectedInvoicePreAuths: PreAuthorisation[] = [];
  isModifierLine: boolean = false;
  lineItemPublicationId: number = 0;
  selectedPreAccessLineItem: any;
  isAdmissionCode: boolean = false;
  modifierOutput: ModifierOutput;
  resultedTariffBaseUnitCostTypeId: number = 0;
  rolePlayerDetails: RolePlayer;

  @ViewChild('payee', { static: true }) payee: ElementRef;
  @ViewChild('dateTreatmentFrom', { static: true }) dateTreatmentFrom: ElementRef;

  currentUrl = this.router.url;
  dataSource = new MatTableDataSource<InvoiceLineDetails>(this.invoiceLineDetails);

  selection = new SelectionModel<InvoiceLineDetails>(true, []);
  displayType = SelectType.single;

  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.MedicareMedicalInvoice;
  documentTypeEnums = [DocumentTypeEnum.MedicareMedicalInvoice];
  linkedId: number;
  key: string = 'MedicareMedicalInvoice';
  requiredDocumentsUploaded = false;
  documentsEmitted: GenericDocument[];
  forceRequiredDocumentTypeFilter = [DocumentTypeEnum.MedicareMedicalInvoice];

  lineItemClickedCheck: InvoiceLineDetails;
  tariffBaseUnitCostTypes;
  payeeTypes: PayeeType[];
  displayedColumns: string[] = [
    "select",
    'edit',
    'delete',
    "ServiceDate",
    "hcpTariffCode",
    "description",
    "icd10Code",
    "totalTariffAmount",
    "creditAmount",
    "quantity",
    "InvUnitAmount",
    "requestedQuantity",
    "authorisedQuantity",
    "authorisedAmount",
    "requestedAmount",
    "totalTariffVat",
    "totalIncl",
    "approvedSubAmount",
    "ApprovedVAT",
    "ApprovedTotalAmountIncl",
    'Validation'
  ];

  selectType = [
    { text: "Single", value: SelectType.single },
    { text: "Multiple", value: SelectType.multiple }
  ];
  isPracticeActive: boolean;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;
  switchBatchTypeEnum = SwitchBatchType;
  invoiceData: InvoiceDetails;
  loading$ = new BehaviorSubject<boolean>(false);
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);
  loadingLineItems$ = new BehaviorSubject<boolean>(false);
  savingLineItems$ = new BehaviorSubject<boolean>(false);

  constructor(private formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private activeRoute: ActivatedRoute,
    private readonly medicalInvoiceHealthcareProviderService: MedicalInvoiceHealthcareProviderService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly tariffBaseUnitCostTypesService: TariffBaseUnitCostTypesService,
    public datepipe: DatePipe,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly medicalFormService: MedicalFormService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly toasterService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly eventService: ClaimCareService,
    private readonly icd10CodeService: ICD10CodeService,
    public readonly rolePlayerService: RolePlayerService,
    private readonly medicalUnderAssessReasonServiceService: MedicalUnderAssessReasonServiceService,
    public dialog: MatDialog) {
    super(appEventsManager, authService, activeRoute,);

    this.createForm();
  }



  onLoadLookups(): void {

  }

  loadSelectedInvoice() {
    this.isPracticeActive = this.model?.isActive ? true:false;
    if ((this.model && this.model?.switchBatchInvoiceId > 0 && this.model?.switchBatchId > 0) || (this.model?.invoiceLineDetails?.length > 0)) {
      this.selectedPayeeTypeId = this.model.payeeTypeId;     
      this.medicalInvoiceForm.patchValue({
        claimNumber: this.model.claimReferenceNumber,
        claimDate: this.model.invoiceDate,
        serviceProviderName: this.model.healthCareProviderName,
        practiceNumber: this.model.practiceNumber,
        vatRegistered: (this.model.invoiceLineDetails.length > 0 && this.model.invoiceLineDetails[0].vatCode == 1) ? VatCodeEnum[1] : VatCodeEnum[3],
        payeeType: this.payeeType,
        payee: this.model.healthCareProviderName,
        invoiceNo: this.model.invoiceNumber,
        patientAccNo: this.model.hcpAccountNumber,
        dateOfConsultation: this.model.invoiceDate,
        dateReceived: this.model.dateReceived,
        dateSubmitted: this.model.dateSubmitted,
        dateTreatmentFrom: this.model.dateAdmitted,
        dateTreatmentTo: this.model.dateDischarged,
        hcpInvoiceNumber: this.model.hcpInvoiceNumber,
        preAuthorisationNo: (this.defaultPreAuthNumber.length > 1) ? true : false,//checkbox status
        preAuthNoInvoice: (this.defaultPreAuthNumber.length > 1) ? true : false,///checkbox Autolink PreAuthNo 
        isPaymentDelay: this.model.isPaymentDelay,
        isPreauthorised: this.model.isPreauthorised,
        subTotalsSection: {
          invoiceTotalInc: this.model.invoiceTotalInclusive,
          vatRate: (this.model.isVat) ? VatCodeEnum[1] : VatCodeEnum[3],
          invoiceTotalExcl: this.model.invoiceAmount,
          vatR: this.model.invoiceVat
        }
      });

      //for tariff search and other fields population & recalculation on edit
      this.healthCareProviderId = this.model.healthCareProviderId;
      this.practitionerTypeId = this.model.practitionerTypeId;
      this.dateTreatmentFromToTarif = this.datepipe.transform(this.model.dateAdmitted, 'yyyy-MM-dd');
      //if on edit or batch processing auto populate sub-totals
      this.footerSubTotalTotalsCalculation()

      this.mediCarePreAuthService.getInvoicePreAuthNumbers(this.model.dateAdmitted, this.model.healthCareProviderId, this.model.personEventId).subscribe(res => {
        if (res.length > 0) {
          if(this.model.switchBatchInvoiceId > 0)
          {
            this.defaultPreAuthNumber = res[0].preAuthNumber;
          }
          this.linkedPreAuthDetailsList = res;
          this.selectPreAuths();
        } else {
          this.mediCarePreAuthService.getPreAuthsForPractitionerTypeTreatmentBasket(this.model.personEventId, this.model.practitionerTypeId, this.model.dateAdmitted).subscribe(result => {
            this.linkedPreAuthDetailsList = result;
            this.selectPreAuths();
          })
        }
      });
    }
    
    let personEventIdParam = !isNullOrUndefined(this.model?.personEventId)?this.model?.personEventId:0;
    this.getEvent(personEventIdParam) 
  }

  selectPreAuths(): void {
    if(this.model.switchBatchInvoiceId > 0)
    {
      this.linkedPreAuthDetailsList?.forEach(preAuthLine => { preAuthLine.selected = true; });
      this.selectedInvoicePreAuths = this.linkedPreAuthDetailsList;
    }
    else
    {
      this.linkedPreAuthDetailsList?.forEach(preAuthLine => {
        var selectedPreAuth = this.model.medicalInvoicePreAuths?.find(x => x.preAuthId == preAuthLine.preAuthId);
        if (selectedPreAuth != null) {
          preAuthLine.selected = true;
        }
      });
    }
    
  }

  populateModel(): void {
    if (!this.model) return;
    let medicalInvoiceForm = this.medicalInvoiceForm.getRawValue();

    this.model.invoiceId = (this.model.invoiceId > 0) ? this.model.invoiceId : 0;
    this.model.hcpInvoiceNumber = medicalInvoiceForm.hcpInvoiceNumber;
    this.model.hcpAccountNumber = medicalInvoiceForm.patientAccNo;
    this.model.serviceDate = this.datepipe.transform(medicalInvoiceForm.serviceDate, 'yyyy-MM-dd');
    this.model.serviceTimeStart = medicalInvoiceForm.serviceTimeStart;
    this.model.serviceTimeEnd = medicalInvoiceForm.serviceTimeEnd;
    this.model.invoiceDate = this.datepipe.transform(medicalInvoiceForm.dateOfConsultation, 'yyyy-MM-dd');
    this.model.dateSubmitted = this.datepipe.transform(medicalInvoiceForm.dateSubmitted, 'yyyy-MM-dd');
    this.model.dateReceived = this.datepipe.transform(medicalInvoiceForm.dateReceived, 'yyyy-MM-dd');
    this.model.dateAdmitted = this.datepipe.transform(medicalInvoiceForm.dateTreatmentFrom, 'yyyy-MM-dd');
    this.model.dateDischarged = this.datepipe.transform(medicalInvoiceForm.dateTreatmentTo, 'yyyy-MM-dd');
    this.model.invoiceStatus = (this.model.invoiceId > 0) ? this.model.invoiceStatus : InvoiceStatusEnum.Captured;
    this.model.invoiceTotalInclusive = medicalInvoiceForm.subTotalsSection.invoiceTotalInc;
    this.model.invoiceAmount = medicalInvoiceForm.subTotalsSection.invoiceTotalExcl;
    this.model.invoiceVat = (medicalInvoiceForm.subTotalsSection.vatR > 0) ? medicalInvoiceForm.subTotalsSection.vatR : 0;
    this.model.authorisedAmount = 0;
    this.model.authorisedVat = 0;
    this.model.payeeId = (this.selectedPayeeTypeId == RolePlayerIdentificationTypeEnum.HealthCareProvider) ? this.healthCareProviderId : this.model.payeeId; //In 99% of the cases Payee is the same as HealthCareProvider | So for now we assign HealthCareProviderId to the PayeeId
    this.model.payeeTypeId = this.selectedPayeeTypeId;
    this.model.underAssessedComments = "";
    this.model.holdingKey = "";
    this.model.isPaymentDelay = (medicalInvoiceForm.isPaymentDelay == "") ? false : true;
    this.model.isPreauthorised = (this.selectedInvoicePreAuths.length > 0) ? true : false;
    this.model.preAuthXml = "";
    this.model.comments = "";
    this.model.isActive = true;
    this.model.invoiceLines = this.invoiceLineDetails;
    this.model.invoiceLineDetails = this.invoiceLineDetails;//for execute rules method because it looks at this property -> invoiceLineDetails
    this.model.invoiceUnderAssessReasons = this.invoiceUnderAssessReasons;
    if (this.linkMedicalReportList.length > 0)
      this.model.isMedicalReportExist = true;
    for (var i = 0; i < this.linkMedicalReportList.length; i++) {
      let invoiceReport = {
        dateTreatmentFrom: this.datepipe.transform(medicalInvoiceForm.dateTreatmentFrom, 'yyyy-MM-dd'),
        dateTreatmentTo: this.datepipe.transform(medicalInvoiceForm.dateTreatmentTo, 'yyyy-MM-dd'),
        reportDate: this.linkMedicalReportList[i].reportDate,
        reportId: this.linkMedicalReportList[i].medicalReportFormId
      }
      this.invoiceReportList.push(invoiceReport as MedicalInvoiceReport);
    }

    this.model.medicalInvoiceReports = this.invoiceReportList;
    this.model.medicalInvoicePreAuths = this.selectedInvoicePreAuths;
  }

  populateForm(): void {
    if (!this.model) return;
    const form = this.medicalInvoiceForm.controls;
    const model = this.model;
    this.healthCareProviderId = model.healthCareProviderId;
    this.practitionerTypeId = model.practitionerTypeId;
    form.vatRegistered.patchValue(this.model.isVat ? 'Yes' : 'No');
    form.practiceNumber.patchValue(this.model.practiceNumber);
    form.payee.patchValue(this.model.healthCareProviderName);
    form.patientAccNo.patchValue(this.model.hcpAccountNumber);
    form.dateOfConsultation.patchValue(new Date(this.model.invoiceDate).getFullYear() > 1 ? this.model.invoiceDate : '');
    form.dateSubmitted.patchValue(this.model.dateSubmitted);
    form.dateReceived.patchValue(this.model.dateReceived);
    form.dateTreatmentFrom.patchValue(this.model.dateAdmitted);
    form.dateTreatmentTo.patchValue(this.model.dateDischarged);
    form.hcpInvoiceNumber.patchValue(this.model.hcpInvoiceNumber);
    if (this.model.invoiceId > 0 && ((!isNullOrUndefined(this.model.hcpInvoiceNumber) && this.model.hcpInvoiceNumber != '') 
        || (!isNullOrUndefined(this.model.hcpAccountNumber) && this.model.hcpAccountNumber != ''))) {
      this.invoiceNoChange(this.model.hcpInvoiceNumber);
    }
    this.setPayeeTypeDefault(RolePlayerIdentificationTypeEnum.HealthCareProvider);
    this.medicalInvoiceForm.patchValue({
      subTotalsSection: {
        invoiceTotalInc: this.model.invoiceTotalInclusive,
        invoiceTotalExcl: this.model.invoiceAmount,
        vatR: this.model.invoiceVat,
        vatRate: (this.model.isVat) ? VatCodeEnum[1] : VatCodeEnum[3]
      }
    });
    this.loadSelectedInvoice();
    if (!isNullOrUndefined(this.model) && this.model?.invoiceLineDetails?.length > 0){
      this.executeInvoiceLineValidations();
      this.loadMedicalReportsForInvoice(this.model.dateDischarged);
    }

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      let dateTreatmentFrom = this.dateWithoutTime((new Date(this.model.dateAdmitted)));
      let dateTreatmentTo = this.dateWithoutTime((new Date(this.model.dateDischarged)));
      DateCompareValidator.compareDates(new Date(dateTreatmentFrom), this.dateWithoutTime(new Date()), 'Treatment From date cannot be in future', validationResult);
      DateCompareValidator.compareDates(new Date(dateTreatmentTo), this.dateWithoutTime(new Date()), 'Treatment To date cannot be in future', validationResult);
      DateCompareValidator.compareDates(new Date(dateTreatmentTo), this.dateWithoutTime(new Date(this.model.invoiceDate)), 'Treatment To date cannot be after invoice date', validationResult);
      DateCompareValidator.compareDates(this.dateWithoutTime(new Date(this.model.serviceDate)), this.dateWithoutTime(new Date(this.model.invoiceDate)), 'Service date cannot be after invoice date', validationResult);
    }

    if ((!this.requiredDocumentsUploaded || this.documentsEmitted.length <= 0) && this.model?.switchBatchId <= 0) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('Medical invoice document required');
    }

    return validationResult;
  }

  dateWithoutTime(dateTime) {
    var date = new Date(dateTime.getTime());
    date.setHours(0, 0, 0, 0);
    return date;
  }

  ngOnInit() {

    this.tariffBaseUnitCostTypesService.GetTariffBaseUnitCostTypes().subscribe(res => {
      this.tariffBaseUnitCostTypes = res;
    });

    this.rolePlayerIdentificationTypesList = this.ToArray(RolePlayerIdentificationTypeEnum);
    let filteredRolePlayerType = this.rolePlayerIdentificationTypesList.find(r => +RolePlayerIdentificationTypeEnum[r] == RolePlayerIdentificationTypeEnum.HealthCareProvider);
    this.setPayeeTypeDefault(filteredRolePlayerType);
  }

  setPayeeTypeDefault(payeeTypeDefault) {
    this.medicalInvoiceForm.patchValue({
      payeeType: payeeTypeDefault
    });
  }

  createForm(): void {
    this.medicalInvoiceForm = this.formBuilder.group({
      claimNumber: [''],
      claimDate: [''],
      serviceProviderName: [''],
      vatRegistered: [{ value: '', disabled: true }],
      practiceNumber: [{ value: '', disabled: true }],
      payeeType: ['', Validators.required],
      payee: [{ value: '', disabled: true }],
      invoiceNo: [{ value: '', disabled: true }, Validators.required],
      patientAccNo: [''],
      dateOfConsultation: ['', Validators.required],
      dateReceived: ['', Validators.required],
      dateSubmitted: [''],
      dateTreatmentFrom: ['', Validators.required],
      dateTreatmentTo: ['', Validators.required],
      hcpInvoiceNumber: ['', Validators.required],
      preAuthorisationNo: [{ value: '', disabled: (this.defaultPreAuthNumber.length > 1) ? true : false }],
      preAuthNoInvoice: ['', Validators.required],
      isPaymentDelay: [''],

      newInvoiceCapture: this.formBuilder.group({
        invoiceLineId: [{ value: 0, disabled: true }],
        serviceDate: ['', Validators.required],
        serviceTimeStart: [''],
        serviceTimeEnd: [''],
        tariffBaseUnitCostType: [''],
        tariffCode: [{ value: '', disabled: true }, Validators.required],
        description: [{ value: '', disabled: true }, Validators.required],
        totalTariffAmount: [{ value: '', disabled: true }, Validators.required],
        quantity: [{ value: '', disabled: true }, Validators.required],
        timeUnits: [{ value: '', disabled: true }],
        invUnitAmount: ['', Validators.required],
        requestedQuantity: ['', Validators.required],
        invTotalAmount: [{ value: '', disabled: true }, Validators.required],
        creditAmount: [0],
        subTotalEx: [{ value: '', disabled: true }],
        vatCode: [{ value: '', disabled: true }],
        totalIncl: [{ value: '', disabled: true }],
        icd10Code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        treatmentCode: [''],
      }),

      subTotalsSection: this.formBuilder.group({
        invoiceTotalInc: ['', Validators.required],
        vatRate: [{ value: '', disabled: true }],
        invoiceTotalExcl: ['', Validators.required],
        vatR: ['', Validators.required],
      })
    });
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  onResetNewCapturedLineItemInvoice() {
    // resetting edit clicked flag
    this.lineItemClickedCheck = undefined;

    if (this.currentUrl.includes("capture-medical-invoice")) {
      this.medicalInvoiceForm.get('newInvoiceCapture').reset();
    }

    if (this.currentUrl.includes("edit-medical-invoice")) {
      this.medicalInvoiceForm.reset();
      this.reloadCurrentRoute();
    }
  }

  onResetAllFormFields() {
    // resetting edit clicked flag
    this.lineItemClickedCheck = undefined;

    if (this.currentUrl.includes("capture-medical-invoice")) {
      this.medicalInvoiceForm.reset();
    }

    if (this.currentUrl.includes("edit-medical-invoice")) {
      this.medicalInvoiceForm.reset();
      this.reloadCurrentRoute()
    }
  }

  onCancelInvoiveCapture() {
    this.router.navigate(['/medicare/medical-invoice-list']);
  }

  onDeleteLineItem(id: number) {
    //position or index of line to edit
    const i = this.invoiceLineDetails.findIndex(e => +e.invoiceLineId == +id);
    if (i !== -1) {
      if (id > 0) {
        this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this lineitem?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result === true) {
              for (let i = 0; this.invoiceLineDetails.length > i; i++) {
                if (id == this.invoiceLineDetails[i].invoiceLineId) {
                  //updating isDeleted flag property - record not returned on get
                  this.invoiceLineDetails[i].isActive = false;
                  this.invoiceLineDetails[i].isDeleted = true;
                }
                //true = deleted = hide on and false = show
                this.applyFilter((this.invoiceLineDetails[i].isDeleted) ? 'false' : 'true');
              }
              this.alertService.success(`Line Item deleted successfully`);
              this.dataSource.data = this.dataSource.data;
            }
          });
      }
      else {
        this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this lineitem?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result === true) {
              this.invoiceLineDetails.splice(i, 1);
              this.alertService.error(`Line Item deleted successfully`);
              this.dataSource.data = this.dataSource.data;
            }
          });

      }

    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    if (filterValue === 'false') {
      this.dataSource.filterPredicate = function (data, filter: string): boolean {
        return (
          //true = deleted = hide on and false = show | invert value
          data.isDeleted == Boolean(!filter)
        );
      };
    }
    this.dataSource.filter = filterValue;
  }

  selectHandler(row: InvoiceLineDetails) {
    if (this.displayType == SelectType.single) {
      if (!this.selection.isSelected(row)) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row);
  }

  onEditLineItem(item) {
    this.lineItemClickedCheck = this.invoiceLineDetails.find(o => o.invoiceLineId == item.invoiceLineId);
    let invUnitAmount = (item.requestedAmount > 0) ? (item.requestedAmount + item.requestedVat) : 0;
    let quantity = (item.requestedQuantity > 0) ? item.requestedQuantity : 0;
    let timeUnits = item.timeUnits;
    let discount = (item.creditAmount > 0) ? item.creditAmount : 0;
    this.tariffId = item.tariffId;
    //recalculate vat percentage from rariff figures on edit
    this.healthCareProviderVatAmount = (item.vatCode == 1) ? (item.totalTariffVat / item.totalTariffAmount) * 100 : 0;

    //trigger serviceDate change event for onInvoiceServiceDateChange() to run in other to get TarifftypeId
    this.onInvoiceServiceDateChange(this.lineItemClickedCheck.serviceDate, this.invoiceCaptureState[2]);

    if (this.serviceDateRangeCheck(this.lineItemClickedCheck.serviceDate)) {
      this.medicalInvoiceForm.patchValue({
        newInvoiceCapture: {
          serviceDate: this.lineItemClickedCheck.serviceDate,
          serviceTimeStart: this.lineItemClickedCheck.serviceTimeStart,
          serviceTimeEnd: this.lineItemClickedCheck.serviceTimeEnd,
          invoiceLineId: this.lineItemClickedCheck.invoiceLineId,
          tariffCode: this.lineItemClickedCheck.hcpTariffCode,
          description: this.lineItemClickedCheck.description,
          totalTariffAmount: this.lineItemClickedCheck.totalTariffAmount,
          quantity: this.lineItemClickedCheck.defaultQuantity,//always default to standard
          timeUnits: this.calculateTimeUnits(this.lineItemClickedCheck.hcpTariffCode, this.lineItemClickedCheck.serviceTimeStart, this.lineItemClickedCheck.serviceTimeEnd),
          invUnitAmount: invUnitAmount,
          requestedQuantity: this.lineItemClickedCheck.requestedQuantity,
          invTotalAmount: this.getInvTotalAmount(invUnitAmount, quantity),
          creditAmount: this.lineItemClickedCheck.creditAmount,
          subTotalEx: this.getSubTotalEx(invUnitAmount, quantity, discount),
          vatCode: this.lineItemClickedCheck.totalTariffVat,
          totalIncl: this.getTotalIncl(invUnitAmount, quantity, discount),
          icd10Code: this.lineItemClickedCheck.icd10Code,
          treatmentCode: this.lineItemClickedCheck.treatmentCodeId,
        }
      });

      //force icd10 validation on edit line item
      this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code').markAsTouched();
      this.onValidateICD10CodeFormat(item.icd10Code);
    }
    else {
      this.alertService.error("Service Date Should fall between DateTreatmentFrom & DateTreatmentTo");
    }
  }

  onSaveNewCapturedLineItemInvoice(medicalInvoiceNewCapture) {
    this.savingLineItems$.next(true);
    var isDuplicate = false;
    let lineItemId = medicalInvoiceNewCapture.newInvoiceCapture.invoiceLineId;
    lineItemId = lineItemId == null ? 0 : lineItemId;   
    if (!isDuplicate && lineItemId == 0) {
      this.medicareMedicalInvoiceCommonService.isDuplicateLineItem(lineItemId, this.model.personEventId, this.healthCareProviderId, this.tariffId,
        this.datepipe.transform(medicalInvoiceNewCapture.newInvoiceCapture.serviceDate, 'yyyy-MM-dd'))
        .subscribe((result: boolean) => {
          if (result) {
            this.savingLineItems$.next(false);
            this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `Duplicate line item found, do you still want to continue?`,
              'Center', 'Center', 'Yes', 'No').subscribe(result => {
                  if (result === true) {
                    this.saveLineItemInvoice(medicalInvoiceNewCapture);
                  }
                });
          }
          else
            this.saveLineItemInvoice(medicalInvoiceNewCapture);
        });
    }
    else if (isDuplicate) {
      this.savingLineItems$.next(false);
      this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `Duplicate line item found, do you still want to continue?`,
      'Center', 'Center', 'Yes', 'No').subscribe(result => {
          if (result === true) {
            this.saveLineItemInvoice(medicalInvoiceNewCapture);
          }
        });
    }
    else
    {
      this.saveLineItemInvoice(medicalInvoiceNewCapture);
    }

  }

  saveLineItemInvoice(medicalInvoiceNewCapture) {
    this.savingLineItems$.next(true);
    let lineItemId = medicalInvoiceNewCapture.newInvoiceCapture.invoiceLineId;
    lineItemId = lineItemId == null ? 0 : lineItemId;
    let newLineItem = {
      invoiceLineId: (lineItemId == 0) ? this.counter -= 1 : lineItemId,//check if = edit new local or edit db saved record
      invoiceId: (this.model.invoiceId > 0) ? this.model.invoiceId : 0,
      serviceDate: this.datepipe.transform(medicalInvoiceNewCapture.newInvoiceCapture.serviceDate, 'yyyy-MM-dd'),
      serviceTimeStart: medicalInvoiceNewCapture.newInvoiceCapture.serviceTimeStart,
      serviceTimeEnd: medicalInvoiceNewCapture.newInvoiceCapture.serviceTimeEnd,
      requestedQuantity: medicalInvoiceNewCapture.newInvoiceCapture.requestedQuantity,
      authorisedQuantity: 0,
      requestedAmount: medicalInvoiceNewCapture.newInvoiceCapture.subTotalEx,
      requestedVat: medicalInvoiceNewCapture.newInvoiceCapture.vatCode,
      authorisedAmount: 0,
      authorisedVat: 0,
      totalTariffAmount: medicalInvoiceNewCapture.newInvoiceCapture.totalTariffAmount,
      totalTariffVat: medicalInvoiceNewCapture.newInvoiceCapture.totalTariffAmount * this.healthCareProviderVatAmount / 100,
      creditAmount: medicalInvoiceNewCapture.newInvoiceCapture.creditAmount,
      vatCode: (this.model.isVat) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
      vatPercentage: this.healthCareProviderVatAmount,
      tariffId: this.tariffId,
      treatmentCodeId: 1,
      medicalItemId: 1,
      hcpTariffCode: medicalInvoiceNewCapture.newInvoiceCapture.tariffCode,
      tariffBaseUnitCostTypeId: this.resultedTariffBaseUnitCostTypeId,
      description: medicalInvoiceNewCapture.newInvoiceCapture.description,
      summaryInvoiceLineId: 0,
      isPerDiemCharge: false,
      isDuplicate: false,
      duplicateInvoiceLineId: 0,
      calculateOperands: "",
      icd10Code: medicalInvoiceNewCapture.newInvoiceCapture.icd10Code,
      //default empty values because type InvoiceLineDetails used for both saving and diplaying
      requestedAmountInclusive: 0,//DB computed = RequestedAmount + RequestedVAT
      authorisedAmountInclusive: 0,//DB computed = AuthorisedAmount + AuthorisedVAT
      totalTariffAmountInclusive: 0,//DB computed = TotalTariffAmount + TotalTariffVAT
      tariffBaseUnitCostType: "",
      tariffDescription: "",
      defaultQuantity: medicalInvoiceNewCapture.newInvoiceCapture.quantity,
      //base properties
      isActive: true,//will update when on invoice delete
      isDeleted: false,
      validationMark: "done",
      //for UnderAssessReason -  empty
      invoiceLineUnderAssessReasons: [],
      isModifier: this.isModifierLine,
      publicationId: this.lineItemPublicationId
    }

    if (this.invoiceLineDetails.length > 0 && !isNullOrUndefined(this.lineItemClickedCheck)) {
      //updating existing values
      let id = this.invoiceLineDetails.findIndex(e => +e.invoiceLineId == lineItemId);
      if (id !== -1) {
        //as for BaseClass
        newLineItem.tariffId = this.tariffId > 0 ? this.tariffId : this.invoiceLineDetails[id].tariffId;
        this.invoiceLineDetails[id] = newLineItem as InvoiceLineDetails;
        this.isMutualExclusiveCode(newLineItem.hcpTariffCode, lineItemId);
        this.alertService.success(`Line item updated successfully`);
      }
    }
    else {
      //as for BaseClass
      this.invoiceLineDetails.push(newLineItem as InvoiceLineDetails);
      this.isMutualExclusiveCode(newLineItem.hcpTariffCode, 0);
      this.alertService.success(`Line item added successfully`);
    }

    // resetting edit clicked flag
    this.lineItemClickedCheck = undefined;
    this.medicalInvoiceForm.get('newInvoiceCapture').reset();
    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        serviceDate: medicalInvoiceNewCapture.newInvoiceCapture.serviceDate,
        serviceTimeStart: medicalInvoiceNewCapture.newInvoiceCapture.serviceTimeStart,
        serviceTimeEnd: medicalInvoiceNewCapture.newInvoiceCapture.serviceTimeEnd
      }
    });
    this.populateModel();
    this.model = { ...this.model };
    this.dataSource = new MatTableDataSource<InvoiceLineDetails>(this.dataSource.data);
    //auto update sub-totals
    this.footerSubTotalTotalsCalculation()
    //validate lines
    this.medicareMedicalInvoiceCommonService.ExecuteInvoiceLineValidations(this.model).subscribe(invoiceValidationResults => {

      this.savingLineItems$.next(false);
      this.indexPaperInvoiceDocument();
      this.icd10ListClaims = MedicareUtilities.Icd10CodesListForAllLines(this.model.invoiceLineDetails.map(r => r.icd10Code))

      if (invoiceValidationResults.lineUnderAssessReasons.length > 0) {
        //clearing previously set underAssessReasons
        for (let x = 0; x < this.model.invoiceLineDetails.length; x++) {
          this.model.invoiceLineDetails[x].invoiceLineUnderAssessReasons.length = 0;
        }

        invoiceValidationResults.lineUnderAssessReasons.forEach(element => {

          if (element.underAssessReasonId == this.underAssessReasonEnum.icd10CodeMismatchToClaimICD10) {
            this.alertService.error(`Icd10 Code Mismatch To Claim ICD10`);
          }

          for (let index = 0; index < this.model.invoiceLineDetails.length; index++) {
            if (element.invoiceLineId == this.model.invoiceLineDetails[index].invoiceLineId) {
              this.model.invoiceLineDetails[index].invoiceLineUnderAssessReasons.push(element);
            }
          }

        });
      }

    });
    this.dataSource = new MatTableDataSource<InvoiceLineDetails>(this.model.invoiceLineDetails);

  }

  isModifier(modifierCode: string): boolean {
    this.medicalInvoiceService.isModifier(modifierCode).subscribe(data => {return data;});
    return false;
  }

  getModifier(modifierCode: string): Modifier {
    let modifier = new Modifier();
    this.medicalInvoiceService.getModifier(modifierCode).subscribe(data => {
      if(!isNullOrUndefined(data))
      {
        modifier.Code = data.Code;
        modifier.Description = data.Description;
      }
    });
    return modifier;
  }

  calculateModifier(modifierInput: ModifierInput): ModifierOutput {
    let modifierOutput = new ModifierOutput();
    this.medicalInvoiceService.calculateModifier(modifierInput).subscribe(data => {
      if(!isNullOrUndefined(data))
      {
        modifierOutput.modifierCode = data.modifierCode;
        modifierOutput.modifierDescription = data.modifierDescription;
        modifierOutput.modifierServiceDate = data.modifierServiceDate;
        modifierOutput.modifierAmount = data.modifierAmount;
        modifierOutput.modifierQuantity = data.modifierQuantity;
        this.modifierOutput = modifierOutput;
        this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue(this.modifierOutput.modifierQuantity);
        this.medicalInvoiceForm.controls.newInvoiceCapture.get('quantity').setValue(this.modifierOutput.modifierQuantity);
        this.medicalInvoiceForm.controls.newInvoiceCapture.get('totalTariffAmount').setValue(this.modifierOutput.modifierAmount);
      }
    });
    return modifierOutput;
  }

  calculateTimeUnits(tariffCode: string, serviceStartTime: string, serviceEndTime: string) {
    let startTime = TimeSpan.fromTime(1,2,3,4,5);
    let endTime = TimeSpan.fromTime(1,2,3,4,5);
    let totalTimeUnits = endTime.subtract(startTime);
    return totalTimeUnits;
  }

  indexPaperInvoiceDocument() {
    this.linkedId = this.model?.invoiceId > 0 ? this.model?.invoiceId : this.context?.wizard.id;
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

  allDocumentsEmitted($event: GenericDocument[]) {
    this.documentsEmitted = $event;
  }

  isMutualExclusiveCode(hcpTariffCode: string, invoiceLineId: number): boolean {
    this.invoiceLineUnderAssessReasons.length = 0;
    var isMutualExclusiveCode = false;
    if (this.invoiceLineDetails !== null && this.invoiceLineDetails !== undefined && this.invoiceLineDetails.length > 1) {
      this.mediCarePreAuthService.getMutualExclusiveCodes(hcpTariffCode)
        .subscribe((mutualExclusiveCodes: MutualInclusiveExclusiveCode[]) => {
          if (mutualExclusiveCodes !== null && mutualExclusiveCodes !== undefined && mutualExclusiveCodes.length > 0) {
            for (let invoiceLine of this.invoiceLineDetails) {
              for (let mutualExclusiveCode of mutualExclusiveCodes) {
                if (mutualExclusiveCode.matchedCode === invoiceLine.hcpTariffCode && hcpTariffCode !== invoiceLine.hcpTariffCode) {
                  isMutualExclusiveCode = true;
                  let id = this.invoiceLineDetails.findIndex(e => e.hcpTariffCode == hcpTariffCode);
                  if (id !== -1) {
                    let invoiceLineUnderAssessReason = {
                      invoiceLineId: invoiceLineId,
                      underAssessReasonId: this.underAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService,
                      isActive: true
                    };
                    let reasonId = this.invoiceLineUnderAssessReasons.findIndex(e => e.underAssessReasonId == this.underAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService);
                    if (reasonId == -1) {
                      this.invoiceLineUnderAssessReasons.push(invoiceLineUnderAssessReason as InvoiceLineUnderAssessReason);
                    }
                    this.invoiceLineDetails[id].validationMark = "clear";
                    this.invoiceLineDetails[id].invoiceLineUnderAssessReasons = this.invoiceLineUnderAssessReasons;
                  }
                  this.toasterService.errorToastr(mutualExclusiveCode.matchedCode + " and " + hcpTariffCode + " are mutual exclusive codes. Please capture a different tariff code.");
                  break;
                }
              }
            }
          }
        }
        );
    }
    return isMutualExclusiveCode;
  }

  serviceDateRangeCheck(serviceDate) {
    let dateTreatmentFrom = new Date(this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd')).getTime();
    let dateTreatmentTo = new Date(this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentTo').value, 'yyyy-MM-dd')).getTime();
    let serviceDateRecieved = new Date(this.datepipe.transform(serviceDate, 'yyyy-MM-dd')).getTime();

    let isServiceDateWithin = false;
    if (serviceDateRecieved >= dateTreatmentFrom && serviceDateRecieved <= dateTreatmentTo) {
      isServiceDateWithin = true;
    }
    return isServiceDateWithin;
  }

  serviceDatePrepopulate() {
    let dateTreatmentFrom = new Date(this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd')).getTime();
    let dateTreatmentTo = new Date(this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentTo').value, 'yyyy-MM-dd')).getTime();
    let isTreatmentFromToSame = undefined;
    if (dateTreatmentFrom == dateTreatmentTo) {
      isTreatmentFromToSame = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');
    }
    return isTreatmentFromToSame;
  }

  onValidateICD10CodeFormat(ICD10Code) {

    let icd10CodeControl = this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code');

    if (!icd10CodeControl.hasError('required') && !icd10CodeControl.hasError('minlength') && !icd10CodeControl.hasError('maxlength')) {
      let icd10Array: any[] = ICD10Code.split(/[ /]+/);//need to add extra delimeters
      let isValidICD10Format: boolean[] = [];
      for (let i = 0; i < icd10Array.length; i++) {
        isValidICD10Format.push(this.validateICD10CodeFormat(icd10Array[i].trim()));
      }

      if (!isValidICD10Format.includes(true)) {
        this.iCD10CodeValidateState = true;
        this.getError('icd10Code');//icd10 validation format failed - no true icd in list and therefore this is a fail
      }
      else {
        this.iCD10CodeValidateState = false;
      }

    }
    else {
      //required/min or max validation failed
      this.iCD10CodeValidateState = true;
      this.getError('icd10Code');
    }
  }

  validateICD10CodeFormat(ICD10Code): boolean {
    //ICD10 format(eg: S24.01, format: [a-zA-Z][0-9]{2}([.][0-9]{1,2})?
    let regex = new RegExp(/[a-zA-Z][0-9]{2}([.][0-9]{1,2})?/);
    let regexpResults = regex.test(ICD10Code);
    return (regexpResults) ? true : false;
  }

  onDateTreatmentFromChange(event, type) {
    if (this.model.personEventId && this.model.personEventId > 0 && this.model.practitionerTypeId) {
    // (dateChange)="onDateTreatmentFromChange($event,invoiceCaptureState[1])" --will use this enum for more checks once all data is available
    let date = (type == "captureNewLine") ? event.value : event;
    let dateTreatmentFrom = this.datepipe.transform(date, 'yyyy-MM-dd');
    this.mediCarePreAuthService.getInvoicePreAuthNumbers(dateTreatmentFrom, this.model.healthCareProviderId, this.model.personEventId).subscribe(res => {     
      if (res.length > 0) {
        this.linkPreAuthNumberList = res;
        this.selectedInvoicePreAuths = res.slice(0);
      } else {
        this.mediCarePreAuthService.getPreAuthsForPractitionerTypeTreatmentBasket(this.model.personEventId, this.model.practitionerTypeId, dateTreatmentFrom).subscribe(result => {
          if (result.length > 0) {
            this.linkPreAuthNumberList = result;
            this.selectedInvoicePreAuths = result.slice(0);
          }
        });
      }
    });
   }
  }

  onDateTreatmentToChange(event, type) {
    let date = (type == "captureNewLine") ? event.value : event;
    let dateTreatmentTo = this.datepipe.transform(date, 'yyyy-MM-dd');
    let dateTreatmentFrom = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');

    let medicalReportQueryParams: MedicalReportQueryParams = {
      personEventId: this.model.personEventId,
      healthCareProviderId: this.model.healthCareProviderId,
      dateTreatmentFrom: dateTreatmentFrom,
      dateTreatmentTo: dateTreatmentTo,
      practitionerTypeId: this.model.practitionerTypeId
    }

      this.loading$.next(true);
      this.medicalFormService.getMedicalReportsForInvoice(medicalReportQueryParams).subscribe(res => {
        this.linkMedicalReportList = res;
        this.loading$.next(false);
      });
  }

  onChangeTariffBaseUnitCostType(e) {
    this.selectedTariffBaseUnitCostTypeId = e.value;
  }

  onChangePayeeType(e) {
    if (Number(e.value) != this.selectedPayeeTypeId) {
      this.selectedPayeeTypeId = e.value;
      this.model.payeeId = (RolePlayerIdentificationTypeEnum.Person == this.selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.insuredLifeId
        : (RolePlayerIdentificationTypeEnum.Company == this.selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.companyRolePlayerId
          : (RolePlayerIdentificationTypeEnum.HealthCareProvider == this.selectedPayeeTypeId) ? this.model?.healthCareProviderId : 0;

      if (this.model.payeeId > 0) {
        this.rolePlayerService.getRolePlayer(this.model.payeeId).subscribe(result => {
          this.rolePlayerDetails = result
          this.updatePayeeFields(this.rolePlayerDetails)
          this.isLoading$.next(false);
        });
      }
    }
  }

  searchPayee() {
    const dialogRef = this.dialog.open(InvoicePayeeSearchModalComponent, {
      width: '85%'
    });

    dialogRef.afterClosed().subscribe((result: RolePlayer) => {
      if (result) {
        this.rolePlayerDetails = result;
        this.updatePayeeFields(result)
        this.isLoading$.next(false);
      }
    });
  }

  updatePayeeFields(rolePlayer: RolePlayer) {
    this.medicalInvoiceForm.patchValue({
      payeeType: rolePlayer.rolePlayerIdentificationType,
      payee: rolePlayer.displayName.length > 0 ? rolePlayer.displayName : "N/A"
    });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    //format enum values for HTML display purposes example: ChronicMedication to Chronic Medication
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  onInvoiceServiceDateChange(event, type) {
    this.dateTreatmentFromToTarif = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');
    let dateTreatmentTo = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentTo').value, 'yyyy-MM-dd');
    let date = (type == "captureNewLine") ? event.value : event;
    let invoiceDate = this.datepipe.transform(date, 'yyyy-MM-dd');
    let isChronic = MedicareUtilities.isChronic(new Date(this.dateTreatmentFromToTarif), new Date(dateTreatmentTo));
    this.practitionerTypeId

    this.medicalInvoiceHealthcareProviderService.GetHealthCareProviderVatAmount(this.model.isVat, invoiceDate).subscribe(healthCareProviderVatAmount => {
      this.healthcareProviderService.getHealthCareProviderAgreedTariffTypeIds(this.model.healthCareProviderId, isChronic, this.dateTreatmentFromToTarif).subscribe((res: string) => {
        this.tariffTypeIds = res;
      });
      if (healthCareProviderVatAmount > 1) {
        this.healthCareProviderVatAmount = healthCareProviderVatAmount;
      }
      else {
        this.healthCareProviderVatAmount = 0;
      }
    });

    this.medicalInvoiceForm.patchValue({
      subTotalsSection: {
        vatRate: (this.model.isVat) ? VatCodeEnum[1] : VatCodeEnum[3]
      }
    });
  }

  getInvTotalAmount(invUnitAmount: number, quantity: number): number {
    let totalAmount = invUnitAmount * quantity;
    return parseFloat(totalAmount.toFixed(2));
  }

  getTotalIncl(invUnitAmount: number, quantity: number, discount: number): number {
    const totalIncDiscount = (invUnitAmount * quantity) - discount;
    let totalIncl = totalIncDiscount;
    return parseFloat(totalIncl.toFixed(2));
  }

  getTotalVAT(invUnitAmount: number, quantity: number, discount: number): number {
    let totalVat = ((invUnitAmount * quantity) - discount) * this.healthCareProviderVatAmount / 100;
    return parseFloat(totalVat.toFixed(2))
  }

  getVatFromTotal(total: number, quantity: number) {
    let vatOnly = total * this.healthCareProviderVatAmount / 100;
    let totalVatAmount = vatOnly * quantity;
    return parseFloat(totalVatAmount.toFixed(2));
  }

  getSubTotalEx(invUnitAmount: number, quantity: number, discount: number): number {
    let vatOnly = ((invUnitAmount * quantity) - discount) * this.healthCareProviderVatAmount / 100;
    let unitAmountEx = (invUnitAmount * quantity) - discount;
    let subTotalEx = unitAmountEx - vatOnly;
    return parseFloat(subTotalEx.toFixed(2))
  }

  onRequestedQuantityDiscountCalculate(formData) {
    //take value from rariff search response or field value if already stored/saved
    let invUnitAmount = formData.value.newInvoiceCapture.invUnitAmount;
    let quantity = formData.value.newInvoiceCapture.requestedQuantity;
    let discount = formData.value.newInvoiceCapture.creditAmount;

    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        invTotalAmount: this.getInvTotalAmount(invUnitAmount, quantity),
        subTotalEx: this.getSubTotalEx(invUnitAmount, quantity, discount),
        vatCode: this.getTotalVAT(invUnitAmount, quantity, discount),
        totalIncl: this.getTotalIncl(invUnitAmount, quantity, discount),
      }
    });
  }

  onInvUnitAmountCalculate(formData) {
    this.invUnitAmountChanged = formData.value.newInvoiceCapture.invUnitAmount;
    let invUnitAmount = formData.value.newInvoiceCapture.invUnitAmount;
    let quantity = formData.value.newInvoiceCapture.requestedQuantity;
    let discount = formData.value.newInvoiceCapture.creditAmount;

    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        invTotalAmount: this.getInvTotalAmount(invUnitAmount, quantity),
        subTotalEx: this.getSubTotalEx(invUnitAmount, quantity, discount),
        vatCode: this.getTotalVAT(invUnitAmount, quantity, discount),
        totalIncl: this.getTotalIncl(invUnitAmount, quantity, discount)
      }
    });
  }

  onSearchTarifResponse(tariffResponse) {
    this.tariffId = tariffResponse.tariffId;
    this.tarifResultsData = tariffResponse;
    let invUnitAmount = +tariffResponse.tariffAmount;
    let quantity = +tariffResponse.defaultQuantity;
    let discount = this.medicalInvoiceForm.value.newInvoiceCapture.creditAmount;
    this.isModifierLine = tariffResponse.isModifier;
    this.isAdmissionCode = tariffResponse.isAdmissionCode;
    this.lineItemPublicationId = tariffResponse.publicationId;
    this.resultedTariffBaseUnitCostTypeId = tariffResponse.tariffBaseUnitCostTypeId;
  
    let invoiceLineCount = this.invoiceLineDetails.length;
    if(invoiceLineCount > 0)
    {
      if(tariffResponse.isModifier)
      {
        this.confirmservice.confirmWithoutContainer('Modifier Validation', `Searched tariff code is a Modifier.`,
                      'Center', 'Center', 'OK').subscribe(result => {
          
              });
  
        let previousLine = this.invoiceLineDetails[invoiceLineCount - 1];
        let modifierInput = new ModifierInput();
        modifierInput.ModifierCode = tariffResponse.tariffCode;
        modifierInput.ModifierDescription = tariffResponse.tariffDescription;
        modifierInput.HealthCareProviderId = this.healthCareProviderId;
        modifierInput.ModifierServiceDate = tariffResponse.tariffDate;
        modifierInput.TimeUnits = this.getTimeUnits();
        modifierInput.TariffTypeId = tariffResponse.tariffTypeId;
        modifierInput.TariffBaseUnitCostTypeId = tariffResponse.TariffBaseUnitCostTypeId;
        modifierInput.IsModifier = tariffResponse.isModifier;
        modifierInput.TariffCode = previousLine.hcpTariffCode;
        modifierInput.TariffAmount = previousLine.totalTariffAmount;
        modifierInput.TariffDiscount = previousLine.creditAmount;
        modifierInput.TariffQuantity = previousLine.requestedQuantity;
        modifierInput.PublicationId = previousLine.publicationId;
        modifierInput.TariffServiceDate = new Date(this.datepipe.transform(previousLine.serviceDate, 'yyyy-MM-dd'));
        modifierInput.PreviousInvoiceLine = previousLine;
        modifierInput.PreviousInvoiceLines = this.invoiceLineDetails;
        modifierInput.PreviousLinesTotalAmount = this.invoiceLineDetails.reduce(function (sum, line) {return sum + line.totalTariffAmount;}, 0);
        this.modifierOutput = this.calculateModifier(modifierInput);
      }
      else if (this.isAdmissionCode)
      {
        this.CalculateAndSetLineValues();
        this.modifierOutput = null;
      }
      else{
        this.modifierOutput = null;
      }
    }
  
    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        tariffCode: tariffResponse.tariffCode,
        tariffAmount: tariffResponse.tariffAmount,
        quantity: tariffResponse.isModifier ? this.modifierOutput.modifierQuantity : tariffResponse.defaultQuantity,
        invUnitAmount: tariffResponse.isModifier ? this.modifierOutput.modifierAmount : tariffResponse.tariffAmount,
        invTotalAmount: this.getInvTotalAmount(invUnitAmount, quantity),
        requestedQuantity: tariffResponse.defaultQuantity,//always default to standard
        creditAmount: 0,//default 0 until changed by user
        description: tariffResponse.tariffDescription,
        totalTariffAmount: this.getInvTotalAmount(invUnitAmount, quantity),
        subTotalEx: this.getSubTotalEx(invUnitAmount, quantity, discount),
        vatCode: this.getTotalVAT(invUnitAmount, quantity, discount),
        totalIncl: this.getTotalIncl(invUnitAmount, quantity, discount)
      }
    });
  }
  
  CalculateAndSetLineValues(): void {
    let serviceDateValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceDate').value;
    let serviceTimeStartValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeStart').value;
    let serviceTimeEndValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeEnd').value; 

    if (serviceDateValue && serviceTimeStartValue && serviceTimeEndValue) {
  
      var serviceDateStartTime = new Date(serviceDateValue);
      serviceDateStartTime.setUTCHours(serviceTimeStartValue.split(':')[0]);
      serviceDateStartTime.setUTCMinutes(serviceTimeStartValue.split(':')[1]);

      var serviceDateEndTime = new Date(serviceDateValue);
      serviceDateEndTime.setUTCHours(serviceTimeEndValue.split(':')[0]);
      serviceDateEndTime.setUTCMinutes(serviceTimeEndValue.split(':')[1]);

      if (serviceDateStartTime >= serviceDateEndTime) {
        this.confirmservice.messageBoxWithoutContainer('Service Start Time and End Time Validation', `Service End Time cannot be same or before the Service Start Time`,
            'Center', 'Center', 'OK').subscribe(() => {
              this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeStart').reset();
              this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeEnd').reset();
            });

            return;
      } 
      else
      {
        if(this.isModifierLine){
          this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue(this.modifierOutput.modifierQuantity);
        }
        else if (this.isAdmissionCode) {
          let timeDifference = serviceDateEndTime.getTime() - serviceDateStartTime.getTime();
          let timeUnitsValue = Math.ceil((timeDifference/60000)/15.0); //Convert milliseconds into minutes
          this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue(timeUnitsValue);
        }
        else
        {
          this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue('');
        }
      }
    }
  }

  getTimeUnits() {
    let totalTimeUnits = 0;    
    let serviceDateValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceDate').value;
    let serviceTimeStartValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeStart').value;
    let serviceTimeEndValue = this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeEnd').value; 
  
    if (serviceDateValue && serviceTimeStartValue && serviceTimeEndValue) {

      var serviceDateStartTime = new Date(serviceDateValue);
      serviceDateStartTime.setUTCHours(serviceTimeStartValue.split(':')[0]);
      serviceDateStartTime.setUTCMinutes(serviceTimeStartValue.split(':')[1]);

      var serviceDateEndTime = new Date(serviceDateValue);
      serviceDateEndTime.setUTCHours(serviceTimeEndValue.split(':')[0]);
      serviceDateEndTime.setUTCMinutes(serviceTimeEndValue.split(':')[1]);

      if (serviceDateStartTime >= serviceDateEndTime) {
        this.confirmservice.messageBoxWithoutContainer('Service Start Time and End Time Validation', `Service End Time cannot be same or before the Service Start Time`,
            'Center', 'Center', 'OK').subscribe(() => {
              this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeStart').reset();
              this.medicalInvoiceForm.controls.newInvoiceCapture.get('serviceTimeEnd').reset();
            });

            totalTimeUnits = 0;
            this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue(totalTimeUnits);

            return totalTimeUnits;
      } 
      else
      {
        let timeDifference = serviceDateEndTime.getTime() - serviceDateStartTime.getTime();
        let timeUnitsValue = Math.ceil(timeDifference/60000);
        totalTimeUnits = timeUnitsValue;
        this.medicalInvoiceForm.controls.newInvoiceCapture.get('timeUnits').setValue(totalTimeUnits);
      }
    }
    return totalTimeUnits;
  }

  footerSubTotalTotalsCalculation() {
    let subTotalEx = 0;
    let invoiceTotalExcl = this.invoiceLineDetails.map(t => t.requestedAmount).reduce((acc, value) => acc + value, 0).toFixed(2);
    let vatR = this.invoiceLineDetails.map(t => t.requestedVat).reduce((acc, value) => acc + value, 0).toFixed(2);
    this.invoiceLineDetails.forEach(a => subTotalEx += (a.totalTariffAmount * a.requestedQuantity) - a.creditAmount);
    subTotalEx = parseFloat(subTotalEx.toFixed(2))
    let invoiceTotalExclValue = parseFloat(invoiceTotalExcl) + parseFloat(vatR)
    //once batch processing is in place will need to check and get values from eaither batch or manual captured
    this.medicalInvoiceForm.patchValue({
      subTotalsSection: {
        invoiceTotalInc: Number(invoiceTotalExclValue.toFixed(2)),
        invoiceTotalExcl: Number(invoiceTotalExcl).toFixed(2),
        vatR: Number(vatR),
      }
    });

    this.footerSubTotalValidation(Number(invoiceTotalExcl), Number(invoiceTotalExclValue.toFixed(2)), Number(vatR));
  }

  footerSubTotalValidation(subTotalEx, invoiceTotalInc, vatR): void {
    this.footerSubTotalValidationState.footerSubTotalInvoiceTotalExclValidation =
      (subTotalEx !== Number(this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalExcl').value)) ? true : false;

    this.footerSubTotalValidationState.footerSubTotalInvoiceTotalIncValidation =
      (invoiceTotalInc !== Number(this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalInc').value)) ? true : false;

    this.footerSubTotalValidationState.footerSubTotalVatRValidation =
      (vatR !== Number(this.medicalInvoiceForm.controls?.subTotalsSection.get('vatR').value)) ? true : false;

  }

  onSubTotalAdjustValues(medicalInvoiceForm) {
    let invoiceTotalExcl = 0;
    let invoiceTotalInc = this.invoiceLineDetails.map(t => t.requestedAmount).reduce((acc, value) => acc + value, 0);
    let vatR = this.invoiceLineDetails.map(t => t.requestedVat * t.requestedQuantity).reduce((acc, value) => acc + value, 0);
    this.invoiceLineDetails.forEach(a => invoiceTotalExcl += (a.requestedAmount * a.requestedQuantity) - a.creditAmount);

    this.footerSubTotalValidation(Number(invoiceTotalExcl), Number(invoiceTotalInc), Number(vatR));
  }

  //open preAuth modal on dropdown list icon select
  openPreauthViewModal(preAuthId): void {
    const dialogRef = this.dialog.open(PreauthViewModalComponent, {
      width: '85%',
      data: {
        id: preAuthId,
        switchBatchType: this.switchBatchType
      }
    });
  }

  //open MedicalFormReport modal
  openMedicalFormViewerModal(medicalReportFormId): void {
    const dialogRef = this.dialog.open(MedicalReportViewModalComponent, {
      width: '85%',
      data: { id: medicalReportFormId }
    });
  }

  onPreAuthNoAutolinkChange(selectedPreAuth: PreAuthorisation) {
    const index = this.selectedInvoicePreAuths.findIndex(s => s === selectedPreAuth);
    if (index >= 0) {
      this.selectedInvoicePreAuths.splice(index, 1);
    } else {
      this.selectedInvoicePreAuths.push(selectedPreAuth);
    }
  }

  getError(control) {
    switch (control) {
      case 'invoiceNo':
        if (this.medicalInvoiceForm.get('invoiceNo').hasError('required') && this.medicalInvoiceForm.controls?.invoiceNo.touched) {
          return 'Invoice number required';
        }
        break;
      case 'dateOfConsultation':
        if (this.medicalInvoiceForm.get('dateOfConsultation').hasError('required') && this.medicalInvoiceForm.controls?.dateOfConsultation.touched) {
          return 'Date of Invoice required';
        }
        break;
      case 'dateSubmitted':
        if (this.medicalInvoiceForm.get('dateSubmitted').hasError('required') && this.medicalInvoiceForm.controls?.dateSubmitted.touched) {
          return 'Date Submitted required';
        }
        break;
      case 'dateReceived':
        if (this.medicalInvoiceForm.get('dateReceived').hasError('required') && this.medicalInvoiceForm.controls?.dateReceived.touched) {
          return 'Date Received required';
        }
        break;
      case 'dateTreatmentFrom':
        if (this.medicalInvoiceForm.get('dateTreatmentFrom').hasError('required') && this.medicalInvoiceForm.controls?.dateTreatmentFrom.touched) {
          return 'Date Treatment From required';
        }
        break;
      case 'dateTreatmentTo':
        if (this.medicalInvoiceForm.get('dateTreatmentTo').hasError('required') && this.medicalInvoiceForm.controls?.dateTreatmentTo.touched) {
          return 'Date Treatment To required';
        }
        break;
      case 'hcpInvoiceNumber':
        if (this.medicalInvoiceForm.get('hcpInvoiceNumber').hasError('required') && this.medicalInvoiceForm.controls?.hcpInvoiceNumber.touched) {
          return 'HCP Invoice Number required';
        }
        break;
      case 'preAuthNoInvoice':
        if (this.medicalInvoiceForm.get('preAuthNoInvoice').hasError('required') && this.medicalInvoiceForm.controls?.dateTreatmentTo.touched) {
          return 'PreAuthNoInvoice required';
        }
        break;
      case 'serviceDate':
        if (this.medicalInvoiceForm.controls?.newInvoiceCapture.get('serviceDate').hasError('required') && this.invoiceLineDetails.length < 1) {
          return 'Service Date required';
        }
        //ServiceDate Range check should always be between dateTreatmentFrom & dateTreatmentTo
        break;
      case 'icd10Code':
        if (this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code').touched) {
          if (this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code').hasError('required') ||
            this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code').hasError('minlength') ||
            this.medicalInvoiceForm.controls?.newInvoiceCapture.get('icd10Code').hasError('maxlength')) {
            return 'Please make sure ICD10Code exist and has valid code';
          }
          else if (this.iCD10CodeValidateState) {
            return 'ICD10Code Validation Failed';
          }
        }
        break;
      case 'invoiceTotalInc':
        if (this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalInc').hasError('required') &&
          this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalInc').touched) {
          return 'Invoice TotalInc required';
        }
        break;
      case 'invoiceTotalExcl':
        if (this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalExcl').hasError('required') &&
          this.medicalInvoiceForm.controls?.subTotalsSection.get('invoiceTotalExcl').touched) {
          return 'Invoice TotalExc required';
        }
        break;
      case 'vatR':
        if (this.medicalInvoiceForm.controls?.subTotalsSection.get('vatR').hasError('required') &&
          this.medicalInvoiceForm.controls?.subTotalsSection.get('vatR').touched) {
          return 'VAT Amount required';
        }
        break;
      case 'footerSubTotalInvoiceTotalExclValidation':
        if (control == 'footerSubTotalInvoiceTotalExclValidation') {
          return 'InvoiceTotalExcl SubTotalsdo not match line items totals';
        }
        break;
      case 'footerSubTotalInvoiceTotalIncValidation':
        if (control == 'footerSubTotalInvoiceTotalIncValidation') {
          return 'InvoiceTotalInc SubTotals do not match line items totals';
        }
        break;
      case 'footerSubTotalVatRValidation':
        if (control == 'footerSubTotalVatRValidation') {
          return 'VatR SubTotalsdo not match line items totals';
        }
        break;
      default:
        return '';
    }
  }

  getEvent(PersonEventIdParam) {
    if (PersonEventIdParam > 0) {
      this.loadingClaimsData$.next(true);
      this.eventService.getPersonEventDetails(PersonEventIdParam).subscribe(result => {
        this.selectedEvent = result;
        this.personEventId = result.personEvents[0].personEventId;
        this.loadingClaimsData$.next(false);
      })
    }
  }

  executeInvoiceLineValidations(): void {
    this.loadingLineItems$.next(true);
    if (this.model?.invoiceLineDetails?.length > 0) {
      this.icd10ListClaims = MedicareUtilities.Icd10CodesListForAllLines(this.model.invoiceLineDetails.map(r => r.icd10Code))
      this.indexPaperInvoiceDocument();
    }

    this.medicareMedicalInvoiceCommonService.ExecuteInvoiceLineValidations(this.model).subscribe(invoiceValidationResults => {
      if (invoiceValidationResults.lineUnderAssessReasons.length > 0) {
        //clearing previously set underAssessReasons
        for (let x = 0; x < this.model.invoiceLineDetails.length; x++) {
          this.model.invoiceLineDetails[x].invoiceLineUnderAssessReasons.length = 0;
        }

        invoiceValidationResults.lineUnderAssessReasons.forEach(element => {
          for (let index = 0; index < this.model.invoiceLineDetails.length; index++) {
            if (element.invoiceLineId == this.model.invoiceLineDetails[index].invoiceLineId) {
              this.model.invoiceLineDetails[index].invoiceLineUnderAssessReasons.push(element);
            }
          }

        });
      }
      if (this.model.invoiceLineDetails !== null && this.model.invoiceLineDetails !== undefined && this.model.invoiceLineDetails.length > 0) {
        this.invoiceLineDetails = this.model.invoiceLineDetails;

        var lastLineItem = this.model.invoiceLineDetails.sort((a) => a.invoiceLineId).slice(0, 1);
        this.counter = lastLineItem[0].invoiceLineId;
        this.dataSource = new MatTableDataSource<InvoiceLineDetails>(this.invoiceLineDetails);
        this.footerSubTotalTotalsCalculation()
      }
      this.loadingLineItems$.next(false);
    });    
  }

  loadMedicalReportsForInvoice(treatmentToDate: any): void {
    let dateTreatmentTo = this.datepipe.transform(treatmentToDate, 'yyyy-MM-dd');
    let dateTreatmentFrom = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');

    let medicalReportQueryParams: MedicalReportQueryParams = {
      personEventId: this.model.personEventId,
      healthCareProviderId: this.model.healthCareProviderId,
      dateTreatmentFrom: dateTreatmentFrom,
      dateTreatmentTo: dateTreatmentTo,
      practitionerTypeId: this.model.practitionerTypeId
    }

      this.loading$.next(true);
      this.medicalFormService.getMedicalReportsForInvoice(medicalReportQueryParams).subscribe(res => {
        this.linkMedicalReportList = res;
        this.loading$.next(false);
      });
  }

  setPersonEvent(event: PersonEventModel) {
    this.selectedPersonEvent = event;
  }


  invoiceNoChange(hcpInvoiceNumber: string) {
    this.isLoading$.next(true);
    var form = this.medicalInvoiceForm.getRawValue();
    const hcpAccountNumber = form.patientAccNo;
    
    this.medicareMedicalInvoiceCommonService.getDuplicateInvoiceDetails(this.model.invoiceId, this.model.personEventId, this.model.healthCareProviderId, hcpInvoiceNumber, hcpAccountNumber)
      .subscribe(invoiceDetails => {
        this.duplicateInvoiceDetails = invoiceDetails;
        if (this.duplicateInvoiceDetails.invoiceId > 0)
          this.duplicateInvoiceFound = true;
        this.isLoading$.next(false);
    });
  }

  viewDuplicateInvoice() {
      const dialogRef = this.dialog.open(ViewMedicalInvoiceComponent, {
        width: '85%',
        maxHeight: '700px',
        data: {duplicateInvoiceDetails: this.duplicateInvoiceDetails}
      });
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.lineItemClickedCheck
    this.invoiceLineDetails = [];
  }

  getUnderAssessReasons(){
    this.medicalUnderAssessReasonServiceService.getLineUnderAssessReasons().subscribe(res => {
      if (res.length > 0) {
        this.lineUnderAssessReasons = res;
      }
    });
  }

}
    



