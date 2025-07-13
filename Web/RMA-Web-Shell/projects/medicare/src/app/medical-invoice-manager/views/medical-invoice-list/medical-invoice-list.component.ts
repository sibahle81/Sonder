import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import {
  ActivatedRoute,
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule
} from '@angular/router';
import { BehaviorSubject, merge } from 'rxjs';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceSwitchBatchService } from '../../services/medicare-medical-invoice-switch-batch.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MedicalInvoiceAssessModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/medical-invoice-assess/medical-invoice-assess.component';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { InvoiceUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-under-assess-reason';
import { MedicalInvoiceListDatasource } from 'projects/medicare/src/app/medi-manager/datasources/medical-invoice-list-datasource';
import { tap } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { MedicalInvoiceSearchCriteria } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-criteria';
import { ValidationStateEnum } from '../../enums/validation-state-enum';
import { MedicareMedicalInvoiceCommonService } from '../../services/medicare-medical-invoice-common.service';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { UnderAssessReasonEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/under-assess-reason.enum';
import { MedicalInvoiceRejectPendModalComponentComponent } from '../../modals/medical-invoice-reject-pend-modal-component/medical-invoice-reject-pend-modal-component.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import { MedicareItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medicare-item-type-enum';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PaymentReversalNotesComponent } from 'projects/shared-components-lib/src/lib/payment-reversal-notes/payment-reversal-notes.component';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MedicalInvoiceBreakdownDetailsComponent } from '../../../shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { UnderAssessReasonsViewerComponent } from '../../../shared/components/under-assess-reasons-viewer/under-assess-reasons-viewer.component';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from '../../pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { MedicalInvoiceStatusColorPipe } from '../../pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceTotalsCalculationsPipe } from '../../pipes/medical-invoice-totals-calculations.pipe';
import { MedicalInvoiceValidationsPipe } from '../../pipes/medical-invoice-validations.pipe';
import { SwitchBatchInvoiceStatusColorPipe } from '../../pipes/switch-batch-invoice-status-color.pipe';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { MedicareSearchMenusComponent } from '../../../shared/components/medicare-search-menus/medicare-search-menus.component';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { TebaInvoice } from '../../models/teba-invoice';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { HealthcareProviderService } from '../../../medi-manager/services/healthcareProvider.service';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { Utility } from '../../../medi-manager/constants/utility';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'app-medical-invoice-list',
  templateUrl: './medical-invoice-list.component.html',
  styleUrls: ['./medical-invoice-list.component.css'],
  standalone: true,
  imports: [MedicalInvoiceBreakdownDetailsComponent,MedicalInvoiceLineUnderAssessReasonColorPipe,
    MedicalInvoiceStatusColorPipe,
    MedicalInvoiceTotalsCalculationsPipe,
    MedicalInvoiceValidationsPipe,MedicareSearchMenusComponent,
    SwitchBatchInvoiceStatusColorPipe, UnderAssessReasonsViewerComponent, CommonModule, RouterModule, MatMenuModule, SharedComponentsLibModule]
})
export class MedicalInvoiceListComponent implements OnInit, AfterViewInit {
  canAdd = true;
  canEdit = true;
  canAssess = true;
  canAutoPay = true;
  canReinstate = true;
  canDeleteInvoiceAllocation = false;
  canPendReject = true;
  hasOverrideReinstatementPermission = false;
  navigating = false;
  @Input() personEventId = 0;
  @Input() searchByHealthCareProvider = false;
  claimId: number = 0;
  isExternalUser: boolean = false;
  isLoadingPayment$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isReversingPayment$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  RoleEnum = RoleEnum;
  healthCareProviderModel: HealthCareProviderModel;

  constructor(private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private lookupService: LookupService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private readonly auditService: AuditLogService,
    private readonly paymentService: PaymentService,
    public dialog: MatDialog,
    private readonly confirmService: ConfirmationDialogsService) {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.navigating = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.navigating = false;
          break;
        }
        default: {
          break;
        }
      }
    });
    
    this.dataSource = new MedicalInvoiceListDatasource(this.medicareMedicalInvoiceCommonService);
    this.getRouteData()
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MedicalInvoiceListDatasource;
  pageSize: number = 5;
  pageIndex: number = 0;
  orderBy: string = "invoiceId";
  sortDirection: string = "desc";

  @Output() onSortPagingSearchedInvoiceTable: EventEmitter<[string, string, number, number]> = new EventEmitter();
  @Input() medicalInvoiceDetailsListSearchCrateria: InvoiceDetails[] = [];
  @Input() previousUrl: string;//for navigation between screens
  @Input() previousSearchParams: MedicalInvoiceSearchCriteria;//search screen search params
  @Input() switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
  medicalInvoiceDetailsList: InvoiceDetails[] = [];
  medicalInvoiceBreakdownDetailsList: InvoiceLineDetails[] = [];
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;
  paymentTypeEnum: PaymentTypeEnum;
  dataSourceInvoiceBreakdown = new MatTableDataSource<InvoiceLineDetails>(this.medicalInvoiceBreakdownDetailsList);
  loading$ = new BehaviorSubject<boolean>(false);
  processing$ = new BehaviorSubject<boolean>(false);
  currentUrl = this.router.url;
  switchBatchTypeEnum = SwitchBatchType

  displayedColumnsInvoiceBreakdown: string[] = [
    'serviceDate',
    'hcpTariffCode',
    'requestedQuantity',
    'requestedAmountEx',
    'requestedVat',
    'creditAmount',
    'requestedAmount',
    'totalTariffAmount',
    'assessIncl',
    'tarrifDescription',
    'assessReason',
    'underAssessReason'
  ];

  selection = new SelectionModel<InvoiceDetails>(true, []);
  selectedInvoice: InvoiceDetails[] = [];

  displayedColumnsInvoiceDetails: string[] = [
    'select',
    'claimReferenceNumber',
    'hcpInvoiceNumber',
    'invoiceNumber',
    'invoiceStatus',
    'healthCareProviderName',
    'hcpAccountNumber',
    'dateAdmitted',
    'invoiceDate',
    'paymentConfirmationDate',
    'invoiceTotalInclusive',
    'authorisedTotalInclusive',
    'SCare',
    'preAuthNumber',
    'actions'
  ];

  selectType = [
    { text: "Single", value: SelectType.single },
    { text: "Multiple", value: SelectType.multiple }
  ];

  displayType = SelectType.single;

  selectHandler(row: InvoiceDetails) {
    if (this.displayType == SelectType.single) {
      if (!this.selection.isSelected(row)) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row);
    this.dataSourceInvoiceBreakdown = new MatTableDataSource<InvoiceLineDetails>((this.selection.selected.length == 0) ? [] : this.selection.selected[0].invoiceLineDetails);
    this.selectedInvoice = this.selection.selected;
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(invoice: InvoiceDetails) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      ...(this.isExternalUser && this.isHealthCareProvider()) ? [] : [{
        title: 'Edit', url: '',
        disable: (this.invoiceStatusEnum[invoice.invoiceStatus] == this.invoiceStatusEnum[3] ||
          this.invoiceStatusEnum[invoice.invoiceStatus] == this.invoiceStatusEnum[5] ||
          this.invoiceStatusEnum[invoice.invoiceStatus] == this.invoiceStatusEnum[6] ||
          this.invoiceStatusEnum[invoice.invoiceStatus] == this.invoiceStatusEnum[14]) ? false : true
      }],
      ...(this.isExternalUser && this.isHealthCareProvider()) ? [] : [{
        title: 'Assess Invoice', url: '',
        disable: (this.canAssess && invoice.invoiceStatus > 0
          && this.invoiceStatusEnum[invoice.invoiceStatus] == this.invoiceStatusEnum[6]) ? false : true
      }],
      {
        title: 'Payment Breakdown', url: '', disable: (invoice.invoiceStatus == InvoiceStatusEnum.Paid ||
          invoice.invoiceStatus == InvoiceStatusEnum.Allocated || invoice.invoiceStatus == InvoiceStatusEnum.PaymentRequested) ? false : true
      },
      {
        title: 'RejectPend', url: '', disable: (invoice.invoiceStatus == InvoiceStatusEnum.Captured ||
          invoice.invoiceStatus == InvoiceStatusEnum.Validated || invoice.invoiceStatus == InvoiceStatusEnum.ReInstated) ? false : true
      },
      {
        title: 'Reverse Payment', url: '', disable: (invoice.invoiceStatus == InvoiceStatusEnum.Paid && !this.isExternalUser) ? false : true
      },
      {
        title: 'Delete', url: '', disable: (invoice.invoiceStatus == InvoiceStatusEnum.Captured ||
          invoice.invoiceStatus == InvoiceStatusEnum.Validated || invoice.invoiceStatus == InvoiceStatusEnum.ReInstated) ? false : true
      },
      {
        title: 'History', url: '', disable: this.isExternalUser
      }
    ];

  }

  onMenuItemClick(invoice: InvoiceDetails, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onClickView(invoice);
        break;
      case 'Edit':
        this.onEditInvoice(invoice);
        break;
      case 'Assess Invoice':
        this.onAssesInvoice(invoice);
        break;
      case 'Payment Breakdown':
        this.onClickPaymentBreakdown(invoice);
        break;
      case 'RejectPend':
        this.onPendReject(invoice, InvoiceStatusEnum.Rejected);
        break;
      case 'Reverse Payment':
        this.reverseInvoicePayment(invoice);
        break;
      case 'Delete':
        this.onPendReject(invoice, InvoiceStatusEnum.Deleted);
        break;
      case 'History':
        this.openAuditDialog(invoice.invoiceId);
        break;
    }

  }

  reverseInvoicePayment(invoice: InvoiceDetails) {
    this.isLoadingPayment$.next(true);
    this.paymentTypeEnum = (this.switchBatchType == SwitchBatchType.MedEDI) ? PaymentTypeEnum.MedicalInvoice : PaymentTypeEnum.TebaInvoice;
    this.paymentService.GetAllocationsByMedicalInvoiceId(invoice.invoiceId, this.paymentTypeEnum).subscribe(allocation=>{
      if(allocation){
        if(allocation.payment){
          this.isLoadingPayment$.next(false);
          this.confirmservice.confirmWithoutContainer('Confirm Payment Reversal?', 'Are you sure you want to reverse this payment?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result === true) {
              this.isReversingPayment$.next(true);
              const noteDialogRef = this.dialog.open(PaymentReversalNotesComponent, {
                width: '1024px',
                data: { payment: allocation.payment }
              });
        
              noteDialogRef.afterClosed().subscribe(note => {
                if (note == null) {
                  return;
                }
        
                this.paymentService.reversePayment(allocation.payment).subscribe(() => {
                  allocation.payment.paymentStatus = PaymentStatusEnum.Reversed;
                  this.medicareMedicalInvoiceCommonService.updateMedicalInvoicePaymentStatus(allocation.payment).subscribe(result=>{
                    this.alertService.success('Payment reversal successfully.');
                    this.isReversingPayment$.next(false);
                    this.loadInvoiceDetails();
                  });
                });
              });
            }
          });

        }
      }else{
        this.isLoadingPayment$.next(false);
        this.alertService.error('Allocation could not be found for the selected payment.');
      }
    })
  }

  openAuditDialog(invoiceId: number) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.MediCareManager,
        clientItemType: MedicareItemTypeEnum.Invoice,
        itemId: invoiceId,
        heading: 'Medical Invoice Audit Trail',
        propertiesToDisplay: ['ClaimId', 'PreAuthId', 'HealthCareProviderId', 'HcpInvoiceNumber', 'HcpAccountNumber', 'InvoiceNumber', 'InvoiceDate',
          'DateSubmitted', 'DateReceived', 'DateAdmitted', 'DateDischarged', 'InvoiceStatus', 'InvoiceTotalInclusive', 'InvoiceVat', 'InvoiceTotalInclusive',
          'AuthorisedAmount', 'AuthorisedVat', 'AuthorisedTotalInclusive', 'PayeeId', 'PayeeTypeId', 'UnderAssessedComments', 'AssignedUserId', 'SwitchBatchNumber']
      }
    });
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

  getRouteData() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params?.id)
        this.personEventId = params.id;

      if (params?.selectedPreAuthId)
        this.claimId = params.selectedPreAuthId//the param name must be fixed - will chat to Bongz to rectify this

    });
  }

  ngOnInit() {
    this.getTebaPracticeNumberKey()
    this.isExternalUser = !this.authService.getCurrentUser().isInternalUser
    this.resetPermissions();
    this.previousUrl = this.currentUrl;
    if (this.currentUrl.includes("medical-invoice-list"))
      this.loadInvoiceDetails();

    if (this.currentUrl.includes("view-search-results") && this.switchBatchType == SwitchBatchType.MedEDI)
      this.loadData()

    this.checkUserPermissions();
  }

  ngAfterViewInit(): void {

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0
    });

    this.dataSource.rowCount$.subscribe(count => {
        this.paginator.length = count
    });

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          if (this.currentUrl.includes("medical-invoice-search") || this.currentUrl.includes("teba-invoice-list")) {
            this.onSortPagingSearchedInvoiceTable.emit([this.sort.direction, this.sort.active, this.paginator.pageIndex, this.paginator.pageSize]);
          }
          else {
            this.loadData()
          }
        })
      )
      .subscribe();

  }



  loadData(): void {
    //values for sort and paging
    this.sortDirection = isNullOrUndefined(this.sort.direction) || this.sort.direction == "" ? "desc" : this.sort.direction;
    this.orderBy = isNullOrUndefined(this.sort.active) || this.sort.active == "" ? "invoiceId" : this.sort.active;
    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize > 0 ? this.paginator.pageSize : 5;

    var healthCareProviderId: string;
    if (this.isExternalUser) {
      const hcpContext = userUtility.getSelectedHCPContext();
      if (hcpContext != null) {
        healthCareProviderId = hcpContext.healthCareProviderId.toString();
      }
    }

    this.dataSource.getData(this.pageIndex + 1, this.pageSize, this.orderBy, this.sortDirection, healthCareProviderId, this.personEventId);

  }

  refreshList() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  loadInvoiceDetails(): void {
    this.loadData()

    const sortStateInvoiceDetails: Sort = { active: 'invoiceId', direction: 'desc' };
    this.sort.active = sortStateInvoiceDetails.active;
    this.sort.direction = sortStateInvoiceDetails.direction;
    this.sort.sortChange.emit(sortStateInvoiceDetails);

  }

  resetPermissions(): void {
    this.canAdd = true;
    this.canEdit = true;
    this.canAssess = true;
    this.canAutoPay = true;
    this.canReinstate = true;
    this.canDeleteInvoiceAllocation = false;
  }

  checkUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('AddMedicalInvoice');
    this.canEdit = userUtility.hasPermission('EditMedicalInvoice');
    this.canAssess = userUtility.hasPermission('AssessMedicalInvoice');
    this.canAutoPay = userUtility.hasPermission('AutoPayMedicalInvoice');
    this.canReinstate = userUtility.hasPermission('ReinstateMedicalInvoice');
    this.canDeleteInvoiceAllocation = userUtility.hasPermission('DeleteMedicalInvoiceAllocation');
    this.hasOverrideReinstatementPermission = userUtility.hasPermission('OverrideMedicalInvoiceReinstatement');
  }


  onAssesInvoice(selectedInvoice) {
    const dialogRef = this.dialog.open(MedicalInvoiceAssessModalComponent, {
      width: '85%',
      data: { invoiceDataClicked: !isNullOrUndefined(selectedInvoice) ? selectedInvoice : this.selectedInvoice[0], switchBatchTypePassed: this.switchBatchType }
    }).afterClosed()
      .subscribe(() => {

        switch (this.switchBatchType) {
          case SwitchBatchType.MedEDI:
            this.loadInvoiceDetails()
            break;
          case SwitchBatchType.Teba:
            this.router.navigate(['/medicare/work-manager/teba-invoice-list']);
            break;
          default:
            break;
        }

      });
  }

  onCaptureNewInvoice() {

    let startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = 0;
    //let wizardModel: InvoiceDetails | TebaInvoice;
    let wizardType: string = "";
    let wizardModel = (this.switchBatchType == SwitchBatchType.MedEDI) ? new InvoiceDetails() : new TebaInvoice();
    
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        wizardType = 'capture-medical-invoice';
        break;
      case SwitchBatchType.Teba:
        wizardType = 'capture-teba-invoice';
        if ('invoicerId' in wizardModel) {
          wizardModel.invoicerId = this.healthCareProviderModel.rolePlayerId;
        }
        wizardModel.healthCareProviderName = this.healthCareProviderModel.name;
        wizardModel.practiceNumber = this.healthCareProviderModel.practiceNumber;
        break;
      default:
        break;
    }

    wizardModel.claimId = this.claimId > 0 ? this.claimId : 0;
    wizardModel.personEventId = this.personEventId > 0 ? this.personEventId : 0;
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.type = wizardType;

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.loading$.next(false);
        this.router.navigateByUrl(`medicare/work-manager/${wizard.type}/continue/${wizard.id}`);
      })

  }


  onDeleteAllocatedInvoice() {
    this.medicareMedicalInvoiceCommonService.deleteAllocatedInvoice(this.selection.selected[0].invoiceId).subscribe(res => {
      if (res) {
        this.confirmservice.confirmWithoutContainer('DeleteAllocatedInvoice:', 'Invoice Deleted successfully',
          'Center', 'Center', 'Ok').subscribe(result => {
            this.refreshList()
          });
      }
    })

  }

  onValidateInvoice() {
    this.processing$.next(true);
    let tebaInvoiceId: number = this.currentUrl.includes("teba-invoice-list") ? this.selection.selected[0].invoiceId : 0;
    let invoiceId: number = tebaInvoiceId > 0 ? 0 : this.selection.selected[0].invoiceId;
    this.medicalInvoiceService.validateInvoiceRun(invoiceId, tebaInvoiceId).subscribe(res => {
      if (res.length > 0) {
        this.confirmservice.confirmWithoutContainer('ValidateMedicalInvoice:', 'Invoice Validated failed, click OK then check the under assess reasons for more details.',
          'Center', 'Center', 'Ok').subscribe(result => {
            this.refreshList();
          });
      }
      else {
        this.confirmservice.confirmWithoutContainer('ValidateMedicalInvoice:', 'Invoice Validated successfully',
          'Center', 'Center', 'Ok').subscribe(result => {
            this.refreshList();
          });
      }
    },
      (err) => {
        this.processing$.next(false);
      },
      () => {
        this.processing$.next(false);
      });
  }

  onAutoPayInvoice() {
    
    this.processing$.next(true);
    var invoiceUnderAssessReasonList = [];
    let tebaInvoiceId: number = this.currentUrl.includes("teba-invoice-list") ? this.selection.selected[0].invoiceId : 0;
    let invoiceId: number = tebaInvoiceId > 0 ? 0 : this.selection.selected[0].invoiceId;
    this.medicalInvoiceService.autoPayRun(invoiceId, tebaInvoiceId).subscribe(res => {
      invoiceUnderAssessReasonList = res as unknown as InvoiceUnderAssessReason[];
    },
      (err) => {
        this.processing$.next(false);
        this.confirmservice.messageBoxWithoutContainer('AutoPayMedicalInvoice:', 'AutoPay run failed',
          'Center', 'Center', 'Ok').subscribe(result => {
            this.refreshList();
          });
      },
      () => {
        this.processing$.next(false);
        if (invoiceUnderAssessReasonList.length == 0 ||
          (invoiceUnderAssessReasonList.length == 1 && invoiceUnderAssessReasonList[0].underAssessReasonId == UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount)) {
          this.confirmservice.messageBoxWithoutContainer('AutoPayMedicalInvoice:', 'AutoPay run successfully',
            'Center', 'Center', 'Ok').subscribe(result => {
              this.refreshList();
            });
        }
        else {
          var underAssessReasonMessage = "";
          invoiceUnderAssessReasonList.forEach(item => {
            if (underAssessReasonMessage === "") {
              underAssessReasonMessage = item.underAssessReason;
            }
            else {
              underAssessReasonMessage += ", " + item.underAssessReason;
            }
          });
          this.confirmservice.messageBoxWithoutContainer('AutoPay Run for medical invoice was unsuccessful due to the following reasons:', underAssessReasonMessage + " -Please make sure, either beneficiary details are accurate & approved, that the payment is not a duplicate & that the invoice has satisfied all conditions.",
            'Center', 'Center', 'Ok').subscribe(result => {
              this.refreshList();
            });
        }
      })
  }

  onReinstateInvoice() {
    this.processing$.next(true);
    var invoiceUnderAssessReasonList = [];
    let tebaInvoiceId: number = this.currentUrl.includes("teba-invoice-list") ? this.selection.selected[0].invoiceId : 0;
    let invoiceId: number = tebaInvoiceId > 0 ? 0 : this.selection.selected[0].invoiceId;
    this.medicalInvoiceService.reinstateMedicalInvoice(invoiceId, tebaInvoiceId).subscribe(res => {
      invoiceUnderAssessReasonList = res as unknown as InvoiceUnderAssessReason[];
    },
      (err) => {
        this.processing$.next(false);
        this.confirmservice.messageBoxWithoutContainer('ReinstateMedicalInvoice:', 'Reinstate failed',
          'Center', 'Center', 'Ok').subscribe(result => {
          });
      },
      () => {
        this.processing$.next(false);
        if (invoiceUnderAssessReasonList.length == 0) {
          this.confirmservice.messageBoxWithoutContainer('ReinstateMedicalInvoice:', 'Reinstate run successfully',
            'Center', 'Center', 'Ok').subscribe(result => {
              this.refreshList();
            });
        }
        else {
          var underAssessReasonMessage = String.Empty;
          invoiceUnderAssessReasonList.forEach(item => {
            if (underAssessReasonMessage === String.Empty) {
              underAssessReasonMessage = item.underAssessReason;
            }
            else {
              underAssessReasonMessage += ", " + item.underAssessReason;
            }
          });
          if (this.hasOverrideReinstatementPermission) {
            this.confirmService.confirmWithoutContainer('Do you want to override the following failed reinstatement validations: ',
              underAssessReasonMessage, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {
                if (dialogResult) {
                  this.processing$.next(true);
                  let tebaInvoiceId: number = this.currentUrl.includes("teba-invoice-list") ? this.selection.selected[0].invoiceId : 0;
                  let invoiceId: number = tebaInvoiceId > 0 ? 0 : this.selection.selected[0].invoiceId;
                  this.medicalInvoiceService.forceReinstateMedicalInvoice(invoiceId, tebaInvoiceId).subscribe(res => {
                    this.processing$.next(false);
                    if (res) {
                      this.confirmservice.messageBoxWithoutContainer('ReinstateMedicalInvoice:', 'Reinstate run successfully',
                        'Center', 'Center', 'Ok').subscribe(result => {
                          this.refreshList()
                        });
                    }
                    else {
                      this.confirmservice.messageBoxWithoutContainer('ReinstateMedicalInvoice:', 'Reinstate failed',
                        'Center', 'Center', 'Ok').subscribe(result => {
                        });
                    }
                  },
                    (err) => {
                      this.processing$.next(false);
                      this.confirmservice.messageBoxWithoutContainer('ReinstateMedicalInvoice:', 'Reinstate failed',
                        'Center', 'Center', 'Ok').subscribe(result => {
                        });
                    }
                  );
                }
              });
          }
          else {
            this.confirmservice.messageBoxWithoutContainer('Reinstate Run for medical invoice was unsuccessful due to the following reasons:', underAssessReasonMessage,
              'Center', 'Center', 'Ok').subscribe(result => {
              });
          }
        }
      });
  }

  onPendReject(selectedInvoice, action: InvoiceStatusEnum) {
    const dialogRef = this.dialog.open(MedicalInvoiceRejectPendModalComponentComponent, {
      width: '75%',
      data: { invoiceDataClicked: !isNullOrUndefined(selectedInvoice) ? selectedInvoice : this.selectedInvoice[0], actionData: action, switchBatchType: this.switchBatchType }
    }).afterClosed()
      .subscribe((response) => {
        if (response) {
          this.loadInvoiceDetails()
        }
      });

  }

  onClickView(invoice) {

    if (this.previousUrl.includes("medical-invoice-search")) {
      sessionStorage.setItem('previousMedicalInvoiceSearchParams', JSON.stringify(this.previousSearchParams));
      sessionStorage.setItem('previousMedicalInvoiceSearchLink', this.previousUrl);
    }

    this.router.navigate(['/medicare/medical-invoice-manager/view-medical-invoice', invoice.invoiceId, this.switchBatchType]);
  }

  onEditInvoice(invoice) {

    localStorage.setItem('invoiceId', invoice.invoiceId);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = invoice.invoiceId;
    let wizardModel: InvoiceDetails | TebaInvoice;
    let wizardType: string = "";
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        wizardType = 'edit-medical-invoice';
        wizardModel = invoice as InvoiceDetails
        break;
      case SwitchBatchType.Teba:
        wizardType = 'capture-teba-invoice';
        wizardModel = MedicareUtilities.convertInvoiceDetailsToTebaInvoice(invoice);
        break;
      default:
        break;
    }

    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.type = wizardType;

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.loading$.next(false);
        this.router.navigateByUrl(`medicare/work-manager/${wizard.type}/continue/${wizard.id}`);
      })
  }

  onPaymentRequestInvoice() {
    this.loading$.next(true);
    let invoiceDataSelected = this.selection.selected[0];
    this.medicareMedicalInvoiceCommonService.validatePaymentRequest(invoiceDataSelected).subscribe(resp => {
      if (resp.length > 0) {
        var ruleData = resp;
        var failedRules: string = "";
        ruleData.forEach(element => {
          if (!element.overallSuccess) {
            let ruleResultState = element.overallSuccess ? " Passed" : " Failed";
            failedRules += element.ruleResults[0].ruleName + ":" + ruleResultState + '\n';
          }
        });

        if (failedRules != "") {
          this.confirmservice.messageBoxWithoutContainer('Payment Request Failed:', failedRules,
            'Center', 'Center', 'OK').subscribe(result => {
            });
        }
        else {
          this.alertService.success(`Payment Requested successfully`);
        }

      }

      this.loading$.next(false);
    });
  }

  setPerson($event: Person) {
    //implementation will come later once TreatmentAuth have been deved
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loading$.next(false);
    if (changes.medicalInvoiceDetailsListSearchCrateria?.currentValue) {
      this.dataSource?.getDataSubject.next(changes?.medicalInvoiceDetailsListSearchCrateria?.currentValue);
    }

    if (changes.switchBatchType?.currentValue) {
      this.switchBatchType = changes?.switchBatchType?.currentValue
    }

    if (changes.personEventId?.currentValue) {
      this.personEventId = changes?.personEventId?.currentValue

    }

  }

  onClickPaymentBreakdown(invoice) {

    if (this.previousUrl.includes("medical-invoice-search")) {
      sessionStorage.setItem('previousMedicalInvoiceSearchParams', JSON.stringify(this.previousSearchParams));
      sessionStorage.setItem('previousMedicalInvoiceSearchLink', this.previousUrl);
    }

    this.router.navigate(['/medicare/medical-invoice-manager/view-payment-breakdown', invoice.invoiceId, this.switchBatchType]);
  }

  isHealthCareProvider(): boolean {
    return (+this.authService.getCurrentUser().roleId === +RoleEnum.HealthCareProvider)
  }
}
