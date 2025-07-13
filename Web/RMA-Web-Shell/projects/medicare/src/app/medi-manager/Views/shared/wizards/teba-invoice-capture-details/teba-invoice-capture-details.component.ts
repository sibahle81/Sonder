import { ViewChild, Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrManager } from 'ng6-toastr-notifications';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
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
import { PayeeTypeService } from 'projects/shared-services-lib/src/lib/services/payee-type/payee-type.service';
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
// import { MedicareMedicalInvoiceCommonService } from '../../../../services/medicare-medical-invoice-common.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { MedicalUnderAssessReasonServiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-under-assess-reason-service.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { TimeSpan } from 'projects/medicare/src/app/shared/time-span';
import { UnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/under-assess-reason';
import { PayeeType } from 'projects/shared-models-lib/src/lib/common/payee-type';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { InvoicePayeeSearchModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-payee-search-modal/invoice-payee-search-modal.component';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { ViewMedicalInvoiceComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/view-medical-invoice/view-medical-invoice.component';
import { MedicalInvoiceBreakdownDetailsComponent } from 'projects/medicare/src/app/shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { AuthorisationsFormService } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-authorisations-container/claim-authorisations-form.service';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { TravelAuthorisedParty } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/travel-authorised-Party';
import { TravelRateType } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/travelRateType';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { LookupValue } from 'projects/shared-models-lib/src/lib/lookup/lookup-value';
import { TebaInvoiceLine } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice-line';
import { TebaInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { TariffBaseUnitCostType } from 'projects/medicare/src/app/medical-invoice-manager/models/tariff-base-unit-cost-type';
import { Utility } from '../../../../constants/utility';
import { LookupTypeEnum } from 'projects/shared-models-lib/src/lib/enums/lookup-type-enum';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { MedicareTravelauthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-travelauth.service';
import { TravelAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/travel-authorisation';
import { TebaTariffCodeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/teba-tariff-code-type-enum';
import { TebaInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/teba-invoice.service';
import { TebaTariff } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-tariff';


@Component({
  selector: 'app-teba-invoice-capture-details',
  templateUrl: './teba-invoice-capture-details.component.html',
  styleUrls: ['./teba-invoice-capture-details.component.css']
})
export class TebaInvoiceCaptureDetailsComponent extends WizardDetailBaseComponent<TebaInvoice> implements OnInit, OnDestroy {

  medicalInvoiceForm: UntypedFormGroup;
  preAuthNo: boolean = false;
  isPaymentDelay: boolean = false;
  invoiceLineDetails: TebaInvoiceLine[] = [];
  invoiceUnderAssessReasons: InvoiceUnderAssessReason[] = [];
  invoiceLineUnderAssessReason: InvoiceLineUnderAssessReason;
  invoiceLineUnderAssessReasons: InvoiceLineUnderAssessReason[] = [];
  underAssessReasonEnum = UnderAssessReasonEnum;
  lineUnderAssessReasons: UnderAssessReason[] = [];
  invoiceDetails: TebaInvoice[];
  duplicateInvoiceFound: boolean = false;
  duplicateInvoiceDetails: TebaInvoice;
  invoiceDate: Date;
  healthCareProviderVatAmount: number = 0;//might need to chek the vat default val
  payeeType = PayeeTypeEnum.Teba;
  RolePlayerIdentificationTypesEnum: typeof RolePlayerIdentificationTypeEnum = RolePlayerIdentificationTypeEnum;
  rolePlayerIdentificationTypes: any[] = [MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.Person]), MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.HealthCareProvider]), MedicareUtilities.formatLookup(RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.Company])];
  rolePlayerIdentificationTypesList: RolePlayerIdentificationTypeEnum[];
  healthCareProviderId: number;
  healthCareProviderModel:HealthCareProviderModel;
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
  selectedPayeeTypeId = PayeeTypeEnum.Teba;
  counter = 0;
  footerSubTotalValidationState = {
    footerSubTotalInvoiceTotalExclValidation: false,
    footerSubTotalInvoiceTotalIncValidation: false,
    footerSubTotalVatRValidation: false
  }
  linkPreAuthNumberList: TravelAuthorisation[] = [];
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
  selectedInvoicePreAuths: TravelAuthorisation[] = [];

  lineItemPublicationId: number = 0;
  selectedPreAccessLineItem: any;
  isAdmissionCode: boolean = false;

  resultedTariffBaseUnitCostTypeId: number = 0;
  rolePlayerDetails: RolePlayer;

  @ViewChild('payee', { static: true }) payee: ElementRef;
  @ViewChild('dateTreatmentFrom', { static: true }) dateTreatmentFrom: ElementRef;

  currentUrl = this.router.url;
  dataSource = new MatTableDataSource<TebaInvoiceLine>(this.invoiceLineDetails);

  selection = new SelectionModel<TebaInvoiceLine>(true, []);

  lineItemClickedCheck: TebaInvoiceLine;
  tariffBaseUnitCostTypes: TariffBaseUnitCostType;
  payeeTypes: PayeeType[];
  authorisedParties: TravelAuthorisedParty[] = [];
  tebaTariffCodeTypeEnum: TebaTariffCodeTypeEnum[];
  switchBatchType: SwitchBatchType = SwitchBatchType.Teba;

  isPracticeActive: boolean;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedTravelRateTypeId: TebaTariffCodeTypeEnum;
  resultTebaTariff : TebaTariff  = new TebaTariff ()

  constructor(private formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private activeRoute: ActivatedRoute,
    private readonly medicalInvoiceHealthcareProviderService: MedicalInvoiceHealthcareProviderService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly tariffBaseUnitCostTypesService: TariffBaseUnitCostTypesService,
    private lookupService: LookupService,
    private tebaInvoiceService: TebaInvoiceService,
    private readonly authorizationService: AuthService,
    public datepipe: DatePipe,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly medicalFormService: MedicalFormService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly medicareTravelAuthService: MedicareTravelauthService,
    private readonly toasterService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly eventService: ClaimCareService,
    private readonly icd10CodeService: ICD10CodeService,
    public readonly rolePlayerService: RolePlayerService,
    public readonly authorisationsFormService: AuthorisationsFormService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public userService: UserService,
    private readonly medicalUnderAssessReasonServiceService: MedicalUnderAssessReasonServiceService,
    public dialog: MatDialog) {
    super(appEventsManager, authService, activeRoute,);

    this.getLookups();
  }

  loading$ = new BehaviorSubject<boolean>(false);
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);
  loadingLineItems$ = new BehaviorSubject<boolean>(false);
  savingLineItems$ = new BehaviorSubject<boolean>(false);

  onLoadLookups(): void {

  }

  loadSelectedInvoice() {
    this.isPracticeActive = this.model?.isActive ? true : false;
    if ((this.model && this.model?.switchBatchInvoiceId > 0 && this.model?.switchBatchId > 0) || (this.model?.tebaInvoiceLines?.length > 0)) {
      this.selectedPayeeTypeId = this.model.payeeTypeId;

      this.medicalInvoiceForm.patchValue({
        payeeType: this.payeeType,
        payee: PayeeTypeEnum[PayeeTypeEnum.Teba],
        dateReceived: this.model.dateReceived,
        dateSubmitted: this.model.dateSubmitted,
        dateTreatmentFrom: this.model.dateTravelledFrom,
        dateTreatmentTo: this.model.dateTravelledTo,
        preAuthorisationNo: (this.defaultPreAuthNumber.length > 1) ? true : false,//checkbox status
        preAuthNoInvoice: (this.defaultPreAuthNumber.length > 1) ? true : false,///checkbox Autolink PreAuthNo 
        subTotalsSection: {
          invoiceTotalInc: this.model.invoiceAmount,
          invoiceTotalExcl: this.model.invoiceTotalInclusive - this.model.invoiceVat,
          vatR: this.model.invoiceVat
        }
      });

      this.healthCareProviderId = this.model.healthCareProviderId;

      this.medicareTravelAuthService.getTebaInvoiceAuthorisations(this.model.dateTravelledFrom, this.model.healthCareProviderId, this.model.personEventId).subscribe(res => {
        if (res.length > 0) {
          this.linkPreAuthNumberList = res;
          this.updateHCPVal(this.linkPreAuthNumberList,this.model.healthCareProviderId)
          this.selectedInvoicePreAuths = this.linkPreAuthNumberList.slice(0);
        } 
      });
      //if on edit or batch processing auto populate sub-totals
      this.footerSubTotalTotalsCalculation()

    }

    let personEventIdParam = !isNullOrUndefined(this.model?.personEventId) ? this.model?.personEventId : 0;
    this.getEvent(personEventIdParam)
  }

  updateHCPVal(array:TravelAuthorisation[],val:number){
    array.forEach(item => {
        item.payeeId = val;
    });
  }

  selectPreAuths(): void {
    if (this.model.switchBatchId > 0) {
      this.linkedPreAuthDetailsList?.forEach(preAuthLine => { preAuthLine.selected = true; });
      this.selectedInvoicePreAuths = this.linkedPreAuthDetailsList;
    }
    else {
      this.linkedPreAuthDetailsList?.forEach(preAuthLine => {
        var selectedPreAuth = this.model.medicalInvoicePreAuths?.find(x => x.preAuthId == preAuthLine.travelAuthorisationId);
        if (selectedPreAuth != null) {
          preAuthLine.selected = true;
        }
      });
    }

  }

  populateModel(): void {
    if (!this.model) return;
    let medicalInvoiceForm = this.medicalInvoiceForm.getRawValue();

    this.model.tebaInvoiceId = (this.model.tebaInvoiceId > 0) ? this.model.tebaInvoiceId : 0;
    this.model.hcpAccountNumber = medicalInvoiceForm.patientAccNo;
    this.model.dateSubmitted = this.datepipe.transform(this.medicalInvoiceForm.get('dateSubmitted').value, 'yyyy-MM-dd');
    this.model.dateReceived = this.datepipe.transform(this.medicalInvoiceForm.get('dateReceived').value, 'yyyy-MM-dd');
    this.model.dateTravelledFrom = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');
    this.model.dateTravelledTo = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentTo').value, 'yyyy-MM-dd');
    this.model.invoiceStatus = (this.model.tebaInvoiceId > 0) ? this.model.invoiceStatus : InvoiceStatusEnum.Captured;
    this.model.invoiceTotalInclusive = medicalInvoiceForm.subTotalsSection.invoiceTotalInc;
    this.model.invoiceAmount = medicalInvoiceForm.subTotalsSection.invoiceTotalExcl;
    this.model.invoiceDate = new Date().toDateString();//awiating feedback as to whether default always
    this.model.TebaTariffCode = this.selectedTravelRateTypeId?.toString();
    this.model.invoicerId = this.model.healthCareProviderId;
    this.model.authorisedAmount = 0;
    this.model.authorisedVat = 0;
    this.model.payeeId = PayeeTypeEnum.Teba, //Teba awaiting feedback from business

    this.model.hcpInvoiceNumber = medicalInvoiceForm.hcpInvoiceNumber;
    this.model.hcpAccountNumber = medicalInvoiceForm.hcpAccountNumber;
    this.model.dateCompleted = null;
    this.model.invoiceVat = medicalInvoiceForm.subTotalsSection.vatR
    this.model.description = medicalInvoiceForm.description;
    this.model.kilometerRate = !isNullOrUndefined(this.resultTebaTariff.costValue) ? this.resultTebaTariff.costValue : 0;//awaiting feedback from business
    this.model.kilometers = medicalInvoiceForm.subTotalsSection.kilometerTotal;
    this.model.invoicerTypeId = this.selectedPayeeTypeId;
    this.model.payeeTypeId = this.selectedPayeeTypeId;
    this.model.holdingKey = "";
    this.model.isActive = true;
    this.model.vatCode = this.healthCareProviderModel.isVat ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt;
    this.model.isPreauthorised = (this.selectedInvoicePreAuths?.length > 0) ? true : false;
    this.model.createdBy = this.authorizationService.getCurrentUser().email;
    this.model.modifiedBy = this.authorizationService.getCurrentUser().email;
    this.model.createdDate = new Date();
    this.model.modifiedDate = new Date();

    this.model.tebaInvoiceLines = this.invoiceLineDetails;//for execute rules method because it looks at this property -> invoiceLineDetails
    this.model.invoiceUnderAssessReasons = this.invoiceUnderAssessReasons;
    this.model.medicalInvoicePreAuths = [];
    this.model.preAuthId = this.selectedInvoicePreAuths?.length >= 1 ? this.selectedInvoicePreAuths[0].travelAuthorisationId : null;
  }

  populateForm(): void {
    if (!this.model) return;
    const form = this.medicalInvoiceForm.controls;
    const model = this.model;
    if ((this.model?.switchBatchId > 0 && this.model?.switchBatchInvoiceId > 0) || this.model?.tebaInvoiceId > 0 || this.model?.tebaInvoiceLines?.length > 0) {
      let invoiceTotKilometers = this.model.tebaInvoiceLines.map(t => Number(t.requestedQuantity)).reduce((acc, value) => acc + value, 0);
      let tariffCode = this.model.TebaTariffCode;
      this.selectedTravelRateTypeId = Number(tariffCode);
    }
    
    this.healthCareProviderId = model.healthCareProviderId;
    if (this.model?.dateSubmitted != Utility.MIN_DATE)
      form.dateSubmitted.patchValue(this.model?.dateSubmitted);
    form.dateReceived.patchValue(this.model?.dateReceived);
    form.dateTreatmentFrom.patchValue(this.model?.dateTravelledFrom);
    form.dateTreatmentTo.patchValue(this.model?.dateTravelledTo);
    form.description.patchValue(this.model?.description);
    form.hcpInvoiceNumber.patchValue(this.model?.hcpInvoiceNumber);
    form.hcpAccountNumber.patchValue(this.model?.hcpAccountNumber);
    this.setPayeeTypeDefault(RolePlayerIdentificationTypeEnum.Teba);
    this.medicalInvoiceForm.patchValue({
      subTotalsSection: {
        invoiceTotalInc: this.model.invoiceAmount,
        invoiceTotalExcl: this.model.invoiceTotalInclusive - this.model.invoiceVat,
        vatCode: this.healthCareProviderModel.isVat ? VatCodeEnum[1] : VatCodeEnum[3],
        vatR: this.model.invoiceVat,
      }
    });

    this.loadSelectedInvoice();
    if (!isNullOrUndefined(this.model) && this.model?.tebaInvoiceLines?.length > 0) {
      this.executeInvoiceLineValidations();
    }

  }

  executeInvoiceLineValidations(): void {
    this.loadingLineItems$.next(true);

    if (this.model.tebaInvoiceLines !== null && this.model.tebaInvoiceLines !== undefined && this.model.tebaInvoiceLines.length > 0) {
      this.invoiceLineDetails = this.model.tebaInvoiceLines;

      var lastLineItem = this.model.tebaInvoiceLines.sort((a) => a.tebaInvoiceLineId).slice(0, 1);
      this.counter = lastLineItem[0].tebaInvoiceLineId;//this counter is crucial and used for adding and editing if already exist
      //force update for breakdown
      this.dataSource.data = [...this.invoiceLineDetails];
      this.dataSource = new MatTableDataSource<TebaInvoiceLine>(this.dataSource.data);
      this.footerSubTotalTotalsCalculation()
    }
    this.loadingLineItems$.next(false);

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      let dateTreatmentFrom = this.dateWithoutTime((new Date(this.model.dateTravelledFrom)));
      let dateTreatmentTo = this.dateWithoutTime((new Date(this.model.dateTravelledTo)));
      DateCompareValidator.compareDates(new Date(dateTreatmentFrom), this.dateWithoutTime(new Date()), 'Travelled From date cannot be in future', validationResult);
      DateCompareValidator.compareDates(new Date(dateTreatmentTo), this.dateWithoutTime(new Date()), 'Travelled To date cannot be in future', validationResult);
    }

    if (this.model?.tebaInvoiceLines?.length <= 0 || isNullOrUndefined(this.model.tebaInvoiceLines)) {
      validationResult.errors++;
      validationResult.errorMessages.push('Atleast 1 Teba Invoice Lines must be captured');
    }

    return validationResult;
  }

  dateWithoutTime(dateTime) {
    var date = new Date(dateTime.getTime());
    date.setHours(0, 0, 0, 0);
    return date;
  }

  ngOnInit() {
    this.getTebaPracticeNumberKey();


    this.rolePlayerIdentificationTypesList = this.ToArray(RolePlayerIdentificationTypeEnum);
    this.setPayeeTypeDefault(RolePlayerIdentificationTypeEnum.Teba);
    this.getTravelAuthorisedParties()
  }

  getLookups() {
    this.tebaTariffCodeTypeEnum = this.ToArray(TebaTariffCodeTypeEnum);
    this.createForm();
  }

  getTebaPracticeNumberKey() {
    const tebaPracticeNumberKey: string = Utility.TEBA_PRACTICE_NUMBER_KEY;
    this.lookupService.getItemByKey(tebaPracticeNumberKey).subscribe(
      tebaKeyVal => {
        if (tebaKeyVal.length > 0) {
          this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(tebaKeyVal).subscribe(healthCareProvider => {
            this.healthCareProviderModel = healthCareProvider;
          });
        }
      }
    );
  }

  getTravelAuthorisedParties() {
    this.claimInvoiceService.GetTravelAuthorisedParties().subscribe(result => {
      if (result) {
        this.authorisedParties = result;
      }
    });
  }

  getLookUpValueByLookupTypeEnum(selectedTravelRateTypeId: number, date: Date, kilometersTravelled: number): void {
    this.savingLineItems$.next(true);
    this.tebaInvoiceService.GetTebaTariff(selectedTravelRateTypeId, date).subscribe(
      data => {
        this.resultTebaTariff = data
        if (!isNullOrUndefined(data)) {
          this.medicalInvoiceForm.patchValue({
            newInvoiceCapture: {
              kilometersTravelled: kilometersTravelled,//kilometersTravelled is equivalent to Quantity
              tariffCode: this.selectedTravelRateTypeId,//rateType is equivalent to tariffCode
              description: TebaTariffCodeTypeEnum[+this.selectedTravelRateTypeId],
              ratePerKMInclVAT: this.resultTebaTariff.costValue * kilometersTravelled,
              subTotalEx: this.getSubTotalEx(this.resultTebaTariff.costValue, kilometersTravelled, 0),
              rateVatCode: this.getTotalVAT(this.resultTebaTariff.costValue, kilometersTravelled, 0),
              totalIncl: this.getTotalIncl(this.resultTebaTariff.costValue, kilometersTravelled, 0),
              rateSubTotalEx: this.resultTebaTariff.costValue,
              rateTotalIncl: this.getTotalIncl(this.resultTebaTariff.costValue, kilometersTravelled, 0) //awaiting business to automate the vat %
            }
          });
        }
        else {
          this.toasterService.warningToastr("Rates not found for selected TravelRateType & Service date, please try using different TravelRateType & Service date");
        }

        this.savingLineItems$.next(false);

      }
    );
  }

  setPayeeTypeDefault(payeeTypeDefault) {
    this.medicalInvoiceForm.patchValue({
      payeeType: +payeeTypeDefault,
      payee: PayeeTypeEnum[PayeeTypeEnum.Teba]

    });
  }

  createForm(): void {

    this.medicalInvoiceForm = this.formBuilder.group({
      travelServiceProvider: [{ value: RolePlayerIdentificationTypeEnum.Teba, disabled: true }],
      payeeType: [{ value: '', disabled: true }],
      payee: [{ value: '', disabled: true }],
      dateReceived: ['', Validators.required],
      dateSubmitted: ['', Validators.required],
      dateTreatmentFrom: ['', Validators.required],
      dateTreatmentTo: ['', Validators.required],
      preAuthorisationNo: [{ value: '', disabled: (this.defaultPreAuthNumber.length > 1) ? true : false }],

      hcpInvoiceNumber: [{ value: '', disabled: true }],
      hcpAccountNumber:  [''],

      description: [''],

      newInvoiceCapture: this.formBuilder.group({
        invoiceLineId: [{ value: 0, disabled: true }],
        serviceDate: ['', Validators.required],
        kilometersTravelled: [''],
        rateType: [''],
        ratePerKMInclVAT: [{ value: '', disabled: true }],
        tariffCode: [{ value: '', disabled: true }, Validators.required],
        description: [{ value: '', disabled: true }, Validators.required],

        creditAmount: [0],
        subTotalEx: [{ value: '', disabled: true }],
        rateVatCode: [{ value: '', disabled: true }],
        totalIncl: [{ value: '', disabled: true }],

        rateSubTotalEx: [{ value: '', disabled: true }],
        rateTotalIncl: [{ value: '', disabled: true }],

      }),

      subTotalsSection: this.formBuilder.group({
        invoiceTotalInc: ['', Validators.required],
        invoiceTotalExcl: ['', Validators.required],
        kilometerTotal: ['', Validators.required],
        vatCode: [{ value: '', disabled: true }],
        vatR: ['', Validators.required]
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

    if (this.currentUrl.includes("capture-teba-invoice")) {
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

    if (this.currentUrl.includes("capture-teba-invoice")) {
      this.medicalInvoiceForm.reset();
    }

    if (this.currentUrl.includes("edit-medical-invoice")) {
      this.medicalInvoiceForm.reset();
      this.reloadCurrentRoute()
    }
  }

  onCancelInvoiveCapture() {
    this.router.navigate(['/medicare/work-manager/teba-invoice-list']);
  }

  onDeleteLineItem(id: number) {
    //position or index of line to edit
    const i = this.invoiceLineDetails.findIndex(e => +e.tebaInvoiceLineId == +id);
    if (i !== -1) {
      if (id > 0) {
        this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this lineitem?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result === true) {
              for (let i = 0; this.invoiceLineDetails.length > i; i++) {
                if (id == this.invoiceLineDetails[i].tebaInvoiceLineId) {
                  //updating isDeleted flag property - record not returned on get
                  this.invoiceLineDetails[i].isActive = false;
                  this.invoiceLineDetails[i].isDeleted = true;
                }
                //true = deleted = hide on and false = show
                this.applyFilter((this.invoiceLineDetails[i].isDeleted) ? 'false' : 'true');
              }
              this.alertService.success(`Line Item deleted successfully`);
              //force update for breakdown
              this.dataSource.data = [...this.invoiceLineDetails];
              this.dataSource = new MatTableDataSource<TebaInvoiceLine>(this.dataSource.data);
              //auto update sub-totals
              this.footerSubTotalTotalsCalculation()
            }
          });
      }
      else {
        this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this lineitem?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result === true) {
              this.invoiceLineDetails.splice(i, 1);
              this.alertService.error(`Line Item deleted successfully`);
              //force update for breakdown
              this.dataSource.data = [...this.invoiceLineDetails];
              this.dataSource = new MatTableDataSource<TebaInvoiceLine>(this.dataSource.data);
              //auto update sub-totals
              this.footerSubTotalTotalsCalculation()
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



  onEditLineItem(item) {
    this.lineItemClickedCheck = this.invoiceLineDetails.find(o => o.tebaInvoiceLineId == item.tebaInvoiceLineId);
    let invUnitAmount = (item.requestedAmount > 0) ? (item.requestedAmount + item.requestedVat) : 0;
    let kilometersTravelled = (item.requestedQuantity > 0) ? item.requestedQuantity : 0;
    let discount = (item.creditAmount > 0) ? item.creditAmount : 0;
    this.tariffId = item.tariffId;
    this.resultTebaTariff.costValue = item.tariffAmount;
    this.resultTebaTariff.tariffId = item.tariffId;
    this.resultTebaTariff.tariffCode = item.hcpTariffCode;
    //recalculate vat percentage from rariff figures on edit
    this.healthCareProviderVatAmount = (item.vatCode == VatCodeEnum.StandardVATRate) ? item.vatPercentage : 0;
    this.selectedTravelRateTypeId = Number(item.hcpTariffCode);

    if (this.serviceDateRangeCheck(item.serviceDate)) {
      this.medicalInvoiceForm.patchValue({
        newInvoiceCapture: {
          serviceDate: item.serviceDate,
          invoiceLineId: item.tebaInvoiceLineId,
          kilometersTravelled: kilometersTravelled,//kilometersTravelled is equivalent to Quantity requestedQuantity
          tariffCode: this.selectedTravelRateTypeId,//rateType is equivalent to tariffCode
          rateType: TebaTariffCodeTypeEnum[+this.selectedTravelRateTypeId],
          description: TebaTariffCodeTypeEnum[+this.selectedTravelRateTypeId],
          ratePerKMInclVAT: item.tariffAmount * kilometersTravelled,
          subTotalEx: this.getSubTotalEx(item.tariffAmount, kilometersTravelled, 0),
          rateVatCode: this.getTotalVAT(item.tariffAmount, kilometersTravelled, 0),
          totalIncl: this.getTotalIncl(item.tariffAmount, kilometersTravelled, 0),
          rateSubTotalEx: item.tariffAmount,
          rateTotalIncl: this.getTotalIncl(item.tariffAmount, kilometersTravelled, 0) //awaiting business to automate the vat %
        }
      });

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
    this.saveLineItemInvoice(medicalInvoiceNewCapture);

  }

  saveLineItemInvoice(medicalInvoiceNewCapture) {
    this.savingLineItems$.next(true);
    let lineItemId = medicalInvoiceNewCapture.newInvoiceCapture.invoiceLineId;
    lineItemId = lineItemId == null ? 0 : lineItemId;

    let newLineItem: TebaInvoiceLine = {
      tebaInvoiceLineId: (lineItemId == 0) ? this.counter -= 1 : lineItemId, //check if = edit new local or edit db saved record
      tebaInvoiceId: (this?.model?.tebaInvoiceId > 0) ? this.model.tebaInvoiceId : 0,
      serviceDate: this.datepipe.transform(medicalInvoiceNewCapture.newInvoiceCapture.serviceDate, 'yyyy-MM-dd'),
      requestedQuantity: medicalInvoiceNewCapture.newInvoiceCapture.kilometersTravelled,
      requestedAmount: medicalInvoiceNewCapture.newInvoiceCapture.subTotalEx,
      requestedVat: medicalInvoiceNewCapture.newInvoiceCapture.rateVatCode,
      authorisedQuantity: 0,
      requestedAmountInclusive: 0,//db auto calculated
      authorisedAmount: 0,
      authorisedVat: 0,
      authorisedAmountInclusive: 0,//db auto calculated
      totalTariffAmount: medicalInvoiceNewCapture.newInvoiceCapture.rateSubTotalEx,
      totalTariffVat: medicalInvoiceNewCapture.newInvoiceCapture.rateVatCode,
      totalTariffAmountInclusive: 0,
      tariffAmount: medicalInvoiceNewCapture.newInvoiceCapture.rateSubTotalEx,
      creditAmount: 0,
      vatCode: this.healthCareProviderModel.isVat ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
      vatPercentage: this.healthCareProviderVatAmount,
      tariffId: 0,
      treatmentCodeId: 0,
      medicalItemId: 0,//Unknown Medical Item - awaiting feedback whether to drop this
      hcpTariffCode: TebaTariffCodeTypeEnum[medicalInvoiceNewCapture.newInvoiceCapture.rateType],
      tariffBaseUnitCostTypeId: undefined,
      description: medicalInvoiceNewCapture.newInvoiceCapture.rateType,
      summaryInvoiceLineId: undefined,
      isPerDiemCharge: false,
      isDuplicate: false,
      duplicateTebaInvoiceLineId: 0,
      calculateOperands: undefined,

      isActive: true, //will update when on invoice delete
      isDeleted: false,
      validationMark: "done",
      invoiceLineUnderAssessReasons: [],
      id: 0,
      createdBy: this.authorizationService.getCurrentUser().email,
      modifiedBy: this.authorizationService.getCurrentUser().email,
      createdDate: new Date(),
      modifiedDate: new Date(),
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: []
    }

    if (this.invoiceLineDetails.length > 0 && !isNullOrUndefined(this.lineItemClickedCheck)) {
      //updating existing values
      let id = this.invoiceLineDetails.findIndex(e => +e.tebaInvoiceLineId == lineItemId);
      if (id !== -1) {
        //as for BaseClass
        this.invoiceLineDetails[id] = newLineItem as TebaInvoiceLine;
        this.alertService.success(`Line item updated successfully`);
      }
    }
    else {
      //as for BaseClass
      this.invoiceLineDetails.push(newLineItem as TebaInvoiceLine);
      this.alertService.success(`Line item added successfully`);
    }

    // resetting edit clicked flag
    this.lineItemClickedCheck = undefined;
    this.medicalInvoiceForm.get('newInvoiceCapture').reset();
    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        serviceDate: medicalInvoiceNewCapture.newInvoiceCapture.serviceDate
      }
    });

    this.populateModel();
    this.model = { ...this.model };
    //force update for breakdown
    this.dataSource.data = [...this.invoiceLineDetails];
    this.dataSource = new MatTableDataSource<TebaInvoiceLine>(this.dataSource.data);
    //auto update sub-totals
    this.footerSubTotalTotalsCalculation()
    this.savingLineItems$.next(false);

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


  onDateTreatmentFromChange(event, type) {

    let date = (type == "captureNewLine") ? event.value : event;
    let dateTreatmentFrom = this.datepipe.transform(date, 'yyyy-MM-dd');
    this.medicareTravelAuthService.getTebaInvoiceAuthorisations(dateTreatmentFrom, this.model.healthCareProviderId, this.model.personEventId).subscribe(res => {
      if (res.length > 0) {
        this.linkPreAuthNumberList = res;
        this.updateHCPVal(this.linkPreAuthNumberList, this.model.healthCareProviderId)
        this.selectedInvoicePreAuths = this.linkPreAuthNumberList.slice(0);
      }
    });
  }

  onDateTreatmentToChange(event, type) {//mmight need to remove this - no need for medical report
    let date = (type == "captureNewLine") ? event.value : event;
    let dateTreatmentTo = this.datepipe.transform(date, 'yyyy-MM-dd');
    let dateTreatmentFrom = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');

    let medicalReportQueryParams: MedicalReportQueryParams = {
      personEventId: this.model.personEventId,
      healthCareProviderId: this.model.healthCareProviderId,
      dateTreatmentFrom: dateTreatmentFrom,
      dateTreatmentTo: dateTreatmentTo,
      practitionerTypeId: this.model.payeeId//
    }

  }


  onChangeTravelRateType(e) {
    this.selectedTravelRateTypeId = +TebaTariffCodeTypeEnum[e.value];
    this.onInvoiceServiceDateChange()
  }

  onChangePayeeType(e) {
    if (Number(e.value) != this.selectedPayeeTypeId && this.switchBatchType == SwitchBatchType.MedEDI) {
      this.selectedPayeeTypeId = e.value;
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
      payee: rolePlayer.displayName.length > 0 ? rolePlayer.displayName : RolePlayerIdentificationTypeEnum[RolePlayerIdentificationTypeEnum.Teba]
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

  onInvoiceServiceDateChange() {
    let serviceDate = this.datepipe.transform(this.medicalInvoiceForm.controls?.newInvoiceCapture.get('serviceDate').value, 'yyyy-MM-dd');
    let kilometersTravelled = this.medicalInvoiceForm.controls?.newInvoiceCapture.get('kilometersTravelled').value;

    if (!isNullOrUndefined(this.selectedTravelRateTypeId) && !isNullOrUndefined(serviceDate) && !isNullOrUndefined(kilometersTravelled)) {
      this.savingLineItems$.next(true);
      var form = this.medicalInvoiceForm.controls.newInvoiceCapture.getRawValue();

      this.medicalInvoiceHealthcareProviderService.GetHealthCareProviderVatAmount(this.healthCareProviderModel.isVat, serviceDate).subscribe(healthCareProviderVatAmount => {
        this.savingLineItems$.next(false);
        this.healthCareProviderVatAmount = (healthCareProviderVatAmount > 1) ? healthCareProviderVatAmount : 0;
        this.getLookUpValueByLookupTypeEnum(this.selectedTravelRateTypeId, new Date(serviceDate), kilometersTravelled);
      });

    }

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

  onInvUnitAmountCalculate(formData) {
    this.invUnitAmountChanged = formData.value.newInvoiceCapture.invUnitAmount;
    let invUnitAmount = formData.value.newInvoiceCapture.invUnitAmount;
    let quantity = formData.value.newInvoiceCapture.requestedQuantity;
    let discount = formData.value.newInvoiceCapture.creditAmount;

    this.medicalInvoiceForm.patchValue({
      newInvoiceCapture: {
        invTotalAmount: this.getInvTotalAmount(invUnitAmount, quantity),
        subTotalEx: this.getSubTotalEx(invUnitAmount, quantity, discount),
        rateVatCode: this.getTotalVAT(invUnitAmount, quantity, discount),
        totalIncl: this.getTotalIncl(invUnitAmount, quantity, discount)
      }
    });
  }
  invoiceTotalInc
  footerSubTotalTotalsCalculation() {
    let subTotalEx = 0;
    let invoiceTotalExcl = this.invoiceLineDetails.map(t => t.requestedAmount).reduce((acc, value) => acc + value, 0).toFixed(2);
    let vatR = this.invoiceLineDetails.map(t => t.requestedVat).reduce((acc, value) => acc + value, 0).toFixed(2);
    this.invoiceLineDetails.forEach(a => subTotalEx += (a.totalTariffAmount * a.requestedQuantity) - a.creditAmount);
    subTotalEx = parseFloat(subTotalEx.toFixed(2))
    let invoiceTotalExclValue = parseFloat(invoiceTotalExcl) + parseFloat(vatR)
    let invoiceTotKilometers = this.invoiceLineDetails.map(t => t.requestedQuantity).reduce((acc, value) => acc + value, 0);
    //once batch processing is in place will need to check and get values from eaither batch or manual captured
    this.medicalInvoiceForm.patchValue({
      subTotalsSection: {
        invoiceTotalInc: Number(invoiceTotalExclValue.toFixed(2)),
        invoiceTotalExcl: Number(invoiceTotalExcl).toFixed(2),
        kilometerTotal:  Number(invoiceTotKilometers),
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
    let invoiceTotKilometers = this.invoiceLineDetails.map(t => t.requestedQuantity).reduce((acc, value) => acc + value, 0);

    this.footerSubTotalValidation(Number(invoiceTotalExcl), Number(invoiceTotalInc), Number(vatR));
  }

  //open preAuth modal on dropdown list icon select
  openPreauthViewModal(travelAuthorisationId): void {
    const dialogRef = this.dialog.open(PreauthViewModalComponent, {
      width: '85%',
      data: { id: travelAuthorisationId, switchBatchType: this.switchBatchType }
    });
  }

  onPreAuthNoAutolinkChange(selectedPreAuth: TravelAuthorisation) {
    const index = this.selectedInvoicePreAuths.findIndex(s => s === selectedPreAuth);
    if (index >= 0) {
      this.selectedInvoicePreAuths.splice(index, 1);
    } else {
      this.selectedInvoicePreAuths.push(selectedPreAuth);
    }
  }

  getError(control) {
    switch (control) {

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

  loadMedicalReportsForInvoice(treatmentToDate: any): void {
    let dateTreatmentTo = this.datepipe.transform(treatmentToDate, 'yyyy-MM-dd');
    let dateTreatmentFrom = this.datepipe.transform(this.medicalInvoiceForm.get('dateTreatmentFrom').value, 'yyyy-MM-dd');

    let medicalReportQueryParams: MedicalReportQueryParams = {
      personEventId: this.model.personEventId,
      healthCareProviderId: this.model.healthCareProviderId,
      dateTreatmentFrom: dateTreatmentFrom,
      dateTreatmentTo: dateTreatmentTo,
      practitionerTypeId: 0, //awaiting feedback from business //this.model.practitionerTypeId
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

  viewDuplicateInvoice() {
    const dialogRef = this.dialog.open(ViewMedicalInvoiceComponent, {
      width: '85%',
      maxHeight: '700px',
      data: { duplicateInvoiceDetails: this.duplicateInvoiceDetails }
    });
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.lineItemClickedCheck
    this.invoiceLineDetails = [];
  }

  getUnderAssessReasons() {
    this.medicalUnderAssessReasonServiceService.getLineUnderAssessReasons().subscribe(res => {
      if (res.length > 0) {
        this.lineUnderAssessReasons = res;
      }
    });
  }

}

