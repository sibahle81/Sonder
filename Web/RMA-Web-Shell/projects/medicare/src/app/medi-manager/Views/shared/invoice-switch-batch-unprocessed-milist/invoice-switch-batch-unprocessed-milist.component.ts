import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicalSwitchBatch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch';
import { MedicalSwitchBatchInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-invoice';
import { MedicalSwitchBatchInvoiceLine } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-invoice-line';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { MedicalInvoiceSearchBatchCriteria } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-batch-criteria';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceSwitchBatchViewerModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-viewer-modal/invoice-switch-batch-viewer-modal.component';
import { InvoiceSwitchBatchDeleteReasonComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-delete-reason/invoice-switch-batch-delete-reason.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { isNullOrUndefined } from 'util';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { InvoiceSwitchBatchSearchPevModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-search-pev/invoice-switch-batch-search-pev.component';
import { MedicalSwitchBatchUnmappedParams } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-unmapped-params';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { SwitchInvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/switch-invoice-status-enum';
import { SwitchInvoiceStatusConditionalIconEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/switch-invoice-status-conditional-icon-enum';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { TebaInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice';
import { TebaInvoiceLine } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice-line';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { HealthcareProviderService } from '../../../services/healthcareProvider.service';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { LookupTypeEnum } from 'projects/shared-models-lib/src/lib/enums/lookup-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Utility } from '../../../constants/utility';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-invoice-switch-batch-unprocessed-milist',
  templateUrl: './invoice-switch-batch-unprocessed-milist.component.html',
  styleUrls: ['./invoice-switch-batch-unprocessed-milist.component.css']
})
export class InvoiceSwitchBatchUnprocessedMilistComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  loading$ = new BehaviorSubject<boolean>(false);
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  switchInvoiceStatusEnum: typeof SwitchInvoiceStatusEnum = SwitchInvoiceStatusEnum;
  switchInvoiceStatusConditionalIconEnum: typeof SwitchInvoiceStatusConditionalIconEnum = SwitchInvoiceStatusConditionalIconEnum;
  selection = new SelectionModel<InvoiceDetails>(true, []);
  form: UntypedFormGroup;
  canDelete = true;
  icd10ListClaims = [];
  claimId: number = 0;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private readonly authorizationService: AuthService,
    private readonly healthCareProviderService: HealthcareProviderService,
    private readonly lookupService: LookupService,
    private readonly toasterService: ToastrManager,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private readonly wizardService: WizardService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly eventService: ClaimCareService,
    public dialog: MatDialog,
    private readonly location: Location) { }

  displayedColumnsSwitchBatchInvoiceDetails: string[] = [
    'deleteInvoice',
    'viewSwitchInvoice',
    'mapToPersonEvent',
    'addBatchInvoice',
    'status',
    'healthCareProviderName',
    'spInvoiceNumber',
    'spAccountNumber',
    'serviceDate',
    'invoiceDate',
    'invoiceTotalInc',
    'authTotalInc',
    'batchNo',
    'patientName',
    'claimRef'
  ];

  switchBatchSearchResponse$: Observable<MedicalSwitchBatchInvoice[]>
  medicalInvoiceDetailsList: MedicalSwitchBatchInvoice[] = [];
  dataSourceSwitchBatchInvoiceDetails

  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;

  invoiceLineItems: MedicalSwitchBatchInvoiceLine[] = [];
  resolvedData: MedicalSwitchBatchInvoice[];
  switchBatchInvoicesData;

  dataSource = new MatTableDataSource<MedicalSwitchBatchInvoiceLine>(this.invoiceLineItems);

  switchBatchSearchResponse: MedicalSwitchBatch;
  switchBatchSearchResponseData$: Observable<MedicalSwitchBatch[]>;
  searchBatchSearchCrateria: MedicalInvoiceSearchBatchCriteria
  switchBatchAssignToUsersList: User[];
  selectedAssignToUser: User;
  selectedRowIndex: any;


  invoiceId: number
  claimReferenceNumber: string
  possiblePersonEventId: string
  medicalSwitchBatchUnmappedParams: MedicalSwitchBatchUnmappedParams;
  selectedPersonEvent: PersonEventModel;
  selectedEvent: EventModel;
  personEventId: number = 0;
  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType;
  healthCareProviderModel:HealthCareProviderModel;

  ngOnInit() {

    this.loading$.next(true);

    this.createForm();
    this.checkUserPermissions();

    this.activeRoute.params.subscribe(params => {
      if (params.switchBatchType){
        this.switchBatchType = +params.switchBatchType;

        switch (this.switchBatchType) {
          case SwitchBatchType.Teba:
            this.getTebaPracticeNumberKey();
            break;
          case SwitchBatchType.MedEDI:
            this.getMediPracticeByPracticeNumber(params.practiceNumber);
            break;
          default:
            break;
        }
      }

      this.medicalSwitchBatchUnmappedParams = {
        medicalInvoiceId: params['invoiceId'] > 0 ? params['invoiceId'] : 0,
        claimReferenceNumber: !isNullOrUndefined(params['claimReferenceNumber']) ? params['claimReferenceNumber'] : "",
        possiblePersonEventId: params['possiblePersonEventId'] > 0 ? params['possiblePersonEventId'] : 0,
        possibleEventId: params['possibleEventId'] > 0 ? params['possibleEventId'] : 0,
        switchBatchId: params['switchBatchId'] > 0 ? params['switchBatchId'] : 0,
        switchBatchNumber: !isNullOrUndefined(params['switchBatchNumber']) ? params['switchBatchNumber'] : "",
        switchBatchInvoiceId: params['switchBatchInvoiceId'] > 0 ? params['switchBatchInvoiceId'] : 0
      }

      this.medicareMedicalInvoiceSwitchBatchService.getUnmappedMiSwitchRecords(this.medicalSwitchBatchUnmappedParams).subscribe(res => {
        this.medicalInvoiceDetailsList = res;

        if (this.medicalInvoiceDetailsList[0].switchBatchInvoiceLines.length > 0 && this.switchBatchType != SwitchBatchType.Teba) {
          this.icd10ListClaims = MedicareUtilities.Icd10CodesListForAllLines(this.medicalInvoiceDetailsList[0]?.switchBatchInvoiceLines.map(r => r.icd10Code))
        }

        this.dataSourceSwitchBatchInvoiceDetails = new MatTableDataSource<MedicalSwitchBatchInvoice>(this.medicalInvoiceDetailsList);
        this.dataSourceSwitchBatchInvoiceDetails.sort = this.sort;
        this.dataSourceSwitchBatchInvoiceDetails.paginator = this.paginator;

        this.loading$.next(false);
      });

    });
    this.getEvent(this.medicalSwitchBatchUnmappedParams.possibleEventId)
  }

  getTebaPracticeNumberKey() {
    const tebaPracticeNumberKey: string = Utility.TEBA_PRACTICE_NUMBER_KEY;
    this.lookupService.getItemByKey(tebaPracticeNumberKey).subscribe(
      tebaKeyVal => {
        if (tebaKeyVal.length > 0) {
          this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(tebaKeyVal).subscribe(healthCareProvider => {
            this.healthCareProviderModel = healthCareProvider;
          });
        }
      }
     );
  }

  getMediPracticeByPracticeNumber(practiceNumber) {
    this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      this.healthCareProviderModel = healthCareProvider;
    });
  }

  getEvent(PossibleEventId) {
    if (PossibleEventId > 0) {
      this.loadingClaimsData$.next(true);
      this.eventService.getEventDetails(PossibleEventId).subscribe(result => {
        this.selectedEvent = result;
        this.personEventId = result.personEvents[0].personEventId;
        this.claimId = result.personEvents[0].claims[0].claimId;
        this.loadingClaimsData$.next(false);
      })
    }
  }

  highlightSeletectedRecord(row) {
    this.selectedRowIndex = row.spInvoiceNumber;
  }

  setAssignToUserDefaultUser(assignToUseDefault) {
    this.form.patchValue({
      assignToUse: assignToUseDefault
    })
  }

  createForm() {
    this.form = this.formBuilder.group({
      assignToUse: [''],
    });
  }

  onResetForm() {
    this.form.reset();
  }

  checkUserPermissions(): void {
    this.canDelete = userUtility.hasPermission('DeleteSwitchBatchMedicalInvoice');
  }

  onViewSwitchInvoice(batchInvoiceDataClicked) {
    const dialogRef = this.dialog.open(InvoiceSwitchBatchViewerModalComponent, {
      width: '85%',
      data: { invoiceDataClicked: batchInvoiceDataClicked }
    });
  }

  onDeleteInvoiceReasonModal(batchInvoiceDataClicked): void {
    const dialogRef = this.dialog.open(InvoiceSwitchBatchDeleteReasonComponent, {
      width: '50%',
      data: { switchBatchInvoiceToDelete: batchInvoiceDataClicked }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading$.next(true);
        this.dataSourceSwitchBatchInvoiceDetails.data = null;
        this.medicareMedicalInvoiceSwitchBatchService.getUnmappedMiSwitchRecords(this.medicalSwitchBatchUnmappedParams).subscribe(res => {
          this.medicalInvoiceDetailsList = res;
          this.refreshTableDataSource(res)
          this.loading$.next(false);
        });
      }
    });
  }

  refreshTableDataSource(data) {
    this.dataSourceSwitchBatchInvoiceDetails.data = data;
  }

  onMapToPersonEventSwitchInvoice(batchInvoiceDataClicked) {
    const dialogRef = this.dialog.open(InvoiceSwitchBatchSearchPevModalComponent, {
      width: '85%',
      data: { invoiceDataClicked: batchInvoiceDataClicked, switchBatchType: this.switchBatchType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result) && result != false) {
        if (result.switchBatchInvoiceId > 0) {
          batchInvoiceDataClicked.possiblePersonEventId = result.possiblePersonEventId;
          batchInvoiceDataClicked.possibleEventId = result.possibleEventId;
          batchInvoiceDataClicked.claimId = result.claimId;
          batchInvoiceDataClicked.claimReferenceNumberMatch = result.claimReferenceNumberMatch;
          if (result.claimId > 0) {
            this.onAddBatchInvoice(batchInvoiceDataClicked);
          }
          else {
            this.toasterService.warningToastr('No claimReference number match, search for a valid claim...');
          }

        }
      }
    });
  }

  onAddBatchInvoice(element) {
    this.loading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = 0;
    let wizardModel: InvoiceDetails | TebaInvoice;
    let wizardType: string = "";
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        wizardType = 'capture-medical-invoice';
        wizardModel = this.getMedEDIData(element)
        break;
      case SwitchBatchType.Teba:
        wizardType = 'capture-teba-invoice';
        wizardModel = this.getTebaData(element)
        break;
      default:
        break;
    }

    startWizardRequest.type = wizardType;
    startWizardRequest.data = JSON.stringify(wizardModel);
    this.toasterService.warningToastr('Capture process loading, please wait...');
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.loading$.next(false);
        this.router.navigateByUrl(`medicare/work-manager/${wizard.type}/continue/${wizard.id}`);
      })
  }

  setPersonEvent(event: PersonEventModel) {
    this.selectedPersonEvent = event;
  }

  getSwitchInvoiceStatus(invoice: MedicalSwitchBatchInvoice): string {
    if (invoice.invoiceId && invoice.invoiceId > 0) {
      return invoice.status;
    }
    else {
      switch (invoice.switchInvoiceStatus) {
        case SwitchInvoiceStatusEnum.Deleted:
          if (!String.isNullOrEmpty(invoice.activeUnderAssessReason))
            return invoice.status + " :" + invoice.activeUnderAssessReason
          else
            return invoice.status;
        default:
          return invoice.status;
      }
    }
  }

  back(): void {
    this.location.back();
  }

  getMedEDIData(switchBatchInvoice: MedicalSwitchBatchInvoice): InvoiceDetails {
    //header
    let medInvoiceDetailsResult: InvoiceDetails = {
      serviceDate: switchBatchInvoice.switchBatchInvoiceLines?.find(x => isNullOrUndefined(x.serviceDate))?.serviceDate ?? '',
      serviceTimeStart: switchBatchInvoice.switchBatchInvoiceLines.find(x => isNullOrUndefined(x.serviceTimeStart)).serviceTimeStart,
      serviceTimeEnd: switchBatchInvoice.switchBatchInvoiceLines.find(x => isNullOrUndefined(x.serviceTimeEnd)).serviceTimeEnd,
      eventDate: '',
      dateOfDeath: '',
      claimReferenceNumber: switchBatchInvoice.claimReferenceNumberMatch,
      healthCareProviderName: switchBatchInvoice.healthCareProviderName,
      payeeName: switchBatchInvoice.healthCareProviderName,
      payeeType: '',
      underAssessReason: '',
      practitionerTypeId: this.healthCareProviderModel.providerTypeId,
      practitionerTypeName: '',
      practiceNumber: this.healthCareProviderModel.practiceNumber,
      isVat: this.healthCareProviderModel.isVat,
      vatRegNumber: this.healthCareProviderModel.vatRegNumber,
      greaterThan731Days: MedicareUtilities.isChronic(new Date(switchBatchInvoice.dateAdmitted), new Date(switchBatchInvoice.dateDischarged)),
      invoiceLineDetails: [],//initially empty and it is being set below on forEach
      paymentConfirmationDate: '',
      batchNumber: switchBatchInvoice.switchBatchNumber,
      invoiceStatusDesc: '',
      eventId: switchBatchInvoice.possibleEventId,
      person: '',
      status: '',
      invoiceId: 0,
      claimId: switchBatchInvoice.claimId > 0 ? switchBatchInvoice.claimId : this.claimId,
      personEventId: switchBatchInvoice.possiblePersonEventId > 0 ? switchBatchInvoice.possiblePersonEventId : this.personEventId,
      healthCareProviderId: this.healthCareProviderModel.rolePlayerId,
      hcpInvoiceNumber: switchBatchInvoice.spInvoiceNumber,
      hcpAccountNumber: switchBatchInvoice.spAccountNumber,
      invoiceNumber: '',
      invoiceDate: switchBatchInvoice.invoiceDate == null ? new Date().toISOString() : switchBatchInvoice.invoiceDate,
      dateSubmitted: switchBatchInvoice.dateSubmitted,
      dateReceived: switchBatchInvoice.dateReceived,
      dateAdmitted: switchBatchInvoice.dateAdmitted,
      dateDischarged: switchBatchInvoice.dateDischarged,
      invoiceStatus: InvoiceStatusEnum.Unknown,
      invoiceAmount: switchBatchInvoice.totalInvoiceAmount,
      invoiceVat: switchBatchInvoice.totalInvoiceVat,
      invoiceTotalInclusive: switchBatchInvoice.totalInvoiceAmountInclusive,
      authorisedAmount: 0,
      authorisedVat: 0,
      authorisedTotalInclusive: 0,
      payeeId: this.healthCareProviderModel.rolePlayerId, //In 99% of the cases Payee is the same as HealthCareProvider | So for now we assign HealthCareProviderId to the PayeeId
      payeeTypeId: PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 
      underAssessReasonId: 0,
      underAssessedComments: '',
      switchBatchInvoiceId: switchBatchInvoice.switchBatchInvoiceId,
      switchBatchId: switchBatchInvoice.switchBatchId,
      holdingKey: '',
      isPaymentDelay: false,
      isPreauthorised: false,
      preAuthXml: '',
      comments: '',
      invoiceLines: [],
      invoiceUnderAssessReasons: [],
      isMedicalReportExist: false,
      medicalInvoiceReports: [],
      medicalInvoicePreAuths: [],
      id: 0,
      createdBy: this.authorizationService.getCurrentUser().email,
      modifiedBy: this.authorizationService.getCurrentUser().email,
      createdDate: new Date(),
      modifiedDate: new Date(),
      isActive: false,
      isDeleted: false,
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: []
    }

    switchBatchInvoice.switchBatchInvoiceLines.forEach((element, index) => {
      //line
      let elementMedInvoiceLine: InvoiceLineDetails = {
        invoiceLineId: -index,
        invoiceId: 0,
        tariffBaseUnitCostType: '',
        tariffDescription: '',
        defaultQuantity: +element.quantity,
        serviceDate: element?.serviceDate,
        serviceTimeStart: element.serviceTimeStart,
        serviceTimeEnd: element.serviceTimeEnd,
        requestedQuantity: +element.quantity,
        authorisedQuantity: 0,
        requestedAmount: element.totalInvoiceLineCost,
        requestedVat: element.totalInvoiceLineVat,
        requestedAmountInclusive: 0,
        authorisedAmount: 0,
        authorisedVat: 0,
        authorisedAmountInclusive: 0,
        totalTariffAmount: element.totalInvoiceLineCost,
        totalTariffVat: element.totalInvoiceLineVat,
        totalTariffAmountInclusive: 0,
        tariffAmount: 0,
        creditAmount: element.creditAmount > 0 ? element.creditAmount : 0,
        vatCode: (element.totalInvoiceLineVat > 0) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
        vatPercentage: 0,
        tariffId: 0,
        treatmentCodeId: 0,
        medicalItemId: 0,
        hcpTariffCode: element.tariffCode,
        tariffBaseUnitCostTypeId: 0,
        description: element.description,
        summaryInvoiceLineId: 0,
        isPerDiemCharge: false,
        isDuplicate: false,
        duplicateInvoiceLineId: 0,
        calculateOperands: '',
        icd10Code: element.icd10Code,
        invoiceLineUnderAssessReasons: [],
        quantity: 0,
        totalInvoiceLineCost: 0,
        totalInvoiceLineVat: 0,
        totalInvoiceLineCostInclusive: 0,
        isModifier: false,
        publicationId: 0,
        id: 0,
        createdBy: this.authorizationService.getCurrentUser().email,
        modifiedBy: this.authorizationService.getCurrentUser().email,
        createdDate: new Date(),
        modifiedDate: new Date(),
        isActive: true,
        isDeleted: false,
        canEdit: false,
        canAdd: false,
        canRemove: false,
        permissionIds: [],
        validationMark: 'done',
      }

      medInvoiceDetailsResult.invoiceLineDetails.push(elementMedInvoiceLine)//addining processed to line item
    });

    return medInvoiceDetailsResult

  }

  getTebaData(switchBatchInvoice: MedicalSwitchBatchInvoice): TebaInvoice {
    //header
    let invoiceTotKilometers = switchBatchInvoice.switchBatchInvoiceLines.map(t => Number(t.quantity)).reduce((acc, value) => acc + value, 0);
    let tariffCode =  switchBatchInvoice.switchBatchInvoiceLines.find(t => t.tariffCode.length > 0).tariffCode;
    let selectedTravelRateTypeId = Number(tariffCode);

    let tebaInvoiceDetailsResult: TebaInvoice = {
      tebaInvoiceId: 0, 
      claimId: switchBatchInvoice.claimId > 0 ? switchBatchInvoice.claimId : this.claimId,
      personEventId: switchBatchInvoice.possiblePersonEventId > 0 ? switchBatchInvoice.possiblePersonEventId : this.personEventId,
      healthCareProviderId: this.healthCareProviderModel.rolePlayerId,
      hcpInvoiceNumber: switchBatchInvoice.spInvoiceNumber,
      hcpAccountNumber: switchBatchInvoice.spAccountNumber,
      invoiceNumber: '',
      invoiceDate: switchBatchInvoice.invoiceDate == null ? new Date().toISOString() : switchBatchInvoice.invoiceDate,
      dateSubmitted: switchBatchInvoice.dateSubmitted,
      dateReceived: switchBatchInvoice.dateReceived,
      preAuthId: null,
      invoiceStatus: InvoiceStatusEnum.Captured,
      kilometers: invoiceTotKilometers,
      kilometerRate: selectedTravelRateTypeId,
      dateTravelledFrom: switchBatchInvoice.dateAdmitted,
      dateTravelledTo: switchBatchInvoice.dateDischarged,
      TebaTariffCode: selectedTravelRateTypeId.toString(),
      invoiceAmount: switchBatchInvoice.totalInvoiceAmount, //requestedAmount
      invoiceVat: switchBatchInvoice.totalInvoiceVat, //requestedVat
      invoiceTotalInclusive: switchBatchInvoice.totalInvoiceAmountInclusive, //requestedAmountInclusive
      authorisedAmount: 0,
      authorisedVat: 0,
      authorisedTotalInclusive: 0, //authorisedAmountInclusive
      payeeId: this.healthCareProviderModel.rolePlayerId, //need values for Teba awaiting feedback from business
      payeeTypeId: PayeeTypeEnum.Teba, //need values for Teba awaiting feedback from business//PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 
      holdingKey: null,
      isPaymentDelay: false,
      isPreauthorised: false,
      vatPercentage: 0,
      vatCode: (this.healthCareProviderModel.isVat) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
      switchBatchId: switchBatchInvoice.switchBatchId,
      switchTransactionNo: null,
      tebaInvoiceLines: [], //initially empty and it is being set below on forEach
      invoiceUnderAssessReasons: [],
      isMedicalReportExist: false,
      medicalInvoiceReports: [],
      medicalInvoicePreAuths: [],
      id: 0,
      createdBy: this.authorizationService.getCurrentUser().email,
      modifiedBy: this.authorizationService.getCurrentUser().email,
      createdDate: new Date(),
      modifiedDate: new Date(),
      isActive: true,
      isDeleted: false,
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: [],
      //
      invoicerId: this.healthCareProviderModel.rolePlayerId, //Teba awaiting feedback from business,
      invoicerTypeId: PayeeTypeEnum.Teba, //Teba awaiting feedback from business//PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 ,
      dateCompleted: '',
      description: SwitchBatchType[this.switchBatchType].toString(),
      calcOperands: '',
      switchBatchType: SwitchBatchType.Teba,
      switchBatchInvoiceId: switchBatchInvoice.switchBatchInvoiceId,
      claimReferenceNumber: switchBatchInvoice.claimReferenceNumberMatch,
      healthCareProviderName: this.healthCareProviderModel.name,
      practiceNumber: this.healthCareProviderModel.practiceNumber
    }

    switchBatchInvoice.switchBatchInvoiceLines.forEach((element, index) => {
      //line
      let elementTebaInvoiceLine: TebaInvoiceLine = {
        tebaInvoiceLineId: -index,//for new entry values must be nagative and for saved records it positive
        tebaInvoiceId: 0,
        serviceDate: element.serviceDate,
        requestedQuantity: Number(element.quantity),
        requestedAmount: element.totalInvoiceLineCost,
        requestedVat: element.totalInvoiceLineVat,
        requestedAmountInclusive: 0,
        authorisedQuantity: 0,
        authorisedAmount: 0,
        authorisedVat: 0,
        authorisedAmountInclusive: 0,
        totalTariffAmount: 0,
        totalTariffVat: 0,
        totalTariffAmountInclusive: 0,
        tariffAmount: 0,
        creditAmount: element.creditAmount > 0 ? element.creditAmount : 0,
        vatCode: (this.healthCareProviderModel.isVat) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
        vatPercentage: 0,
        tariffId: 0,
        treatmentCodeId: 0,
        medicalItemId: 0,
        hcpTariffCode: element.tariffCode,
        tariffBaseUnitCostTypeId: 0,
        description: element.description,
        summaryInvoiceLineId: undefined,
        isPerDiemCharge: false,
        isDuplicate: false,
        duplicateTebaInvoiceLineId: 0,
        calculateOperands: undefined,
        invoiceLineUnderAssessReasons: [],
        validationMark: 'done',
        id: 0,
        createdBy: this.authorizationService.getCurrentUser().email,
        modifiedBy: this.authorizationService.getCurrentUser().email,
        createdDate: new Date(),
        modifiedDate: new Date(),
        isActive: true,
        isDeleted: false,
        canEdit: false,
        canAdd: false,
        canRemove: false,
        permissionIds: []
      }

      tebaInvoiceDetailsResult.tebaInvoiceLines.push(elementTebaInvoiceLine)//adding processed to line item
    });

    return tebaInvoiceDetailsResult
  }



}
