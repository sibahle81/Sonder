import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
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
import { DataShareService } from 'projects/medicare/src/app/medical-invoice-manager/datasources/medicare-medical-invoice-share-data.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { isNullOrUndefined } from 'util';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SwitchInvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/switch-invoice-status-enum';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { filter } from 'rxjs/operators';
import { InvoiceSwitchBatchReinstateReasonComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-reinstate-reason/invoice-switch-batch-reinstate-reason.component';
import { SwitchInvoiceStatusConditionalIconEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/switch-invoice-status-conditional-icon-enum';
import { InvoiceUnderAssessReasonsViewerModalComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-under-assess-reasons-viewer-modal/invoice-under-assess-reasons-viewer-modal.component';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';

@Component({
  selector: 'app-invoice-switch-batch-view-details',
  templateUrl: './invoice-switch-batch-view-details.component.html',
  styleUrls: ['./invoice-switch-batch-view-details.component.css']
})
export class InvoiceSwitchBatchViewDetailsComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  loading$ = new BehaviorSubject<boolean>(false);
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  switchInvoiceStatusEnum: typeof SwitchInvoiceStatusEnum = SwitchInvoiceStatusEnum;
  switchInvoiceStatusConditionalIconEnum: typeof SwitchInvoiceStatusConditionalIconEnum = SwitchInvoiceStatusConditionalIconEnum;
  selection = new SelectionModel<InvoiceDetails>(true, []);
  form: UntypedFormGroup;
  canDelete = true;
  checkedItemsToReinstate: number[];
  canAutoPay = true;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private readonly roleService: RoleService,
    private dataShareService: DataShareService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private userService:UserService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager) {
      this.getRouteData();
    }

  displayedColumnsSwitchBatchInvoiceDetails: string[] = [
    'reinstate',   
    'ViewUnderAssessReasons',
    'ViewSwitchInvoice',
    'DeleteInvoice',
    'AddBatchInvoice',
    'ViewSwitchInvoiceClaimMapped',
    'healthCareProviderName',
    'practiceNumber',
    'spInvoiceNumber',
    'spAccountNumber',
    'invoiceDate',
    'totalInvoiceAmountInclusive',
    'surname',
    'firstName',
    'claimReferenceNumberMatch',
    'status'
  ];

  switchBatchSearchResponse$: Observable<MedicalSwitchBatchInvoice[]>
  medicalInvoiceDetailsList: MedicalSwitchBatchInvoice[] = [];
  dataSourceSwitchBatchInvoiceDetails;

  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;

  invoiceLineItems: MedicalSwitchBatchInvoiceLine[] = [];
  resolvedData: MedicalSwitchBatchInvoice[];
  switchBatchInvoicesData;

  dataSource = new MatTableDataSource<MedicalSwitchBatchInvoiceLine>(this.invoiceLineItems);

  switchBatchSearchResponse: MedicalSwitchBatch;
  switchBatchSearchResponseData$: Observable<MedicalSwitchBatch[]>;
  searchBatchSearchCrateria: MedicalInvoiceSearchBatchCriteria
  switchBatchAssignToUsersList: User[];
  roles: Role[];
  selectedAssignToUser:User;
  selectedRowIndex:any;
  canReassign: boolean = false;
  userSelected: boolean = false;
  currentUrl: string = '';
  previousUrl: string = '';
  switchBatchSearchResponseData:MedicalSwitchBatch[] = [];
  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType;

  ngOnInit() {

    this.loading$.next(true);

    this.getRoles();
    this.createForm();
    this.checkUserPermissions();

    if (this.activeRoute.snapshot.data['switchBatchInvoicesDetails'] !== undefined) {
      this.resolvedData = this.activeRoute.snapshot.data['switchBatchInvoicesDetails'];
      this.switchBatchInvoicesData = this.resolvedData;
      this.invoiceLineItems = this.resolvedData['switchBatchInvoicesDetails'];
      this.dataSourceSwitchBatchInvoiceDetails = new MatTableDataSource<MedicalSwitchBatchInvoice>(this.switchBatchInvoicesData);
      this.dataSourceSwitchBatchInvoiceDetails.sort = this.sort;
      this.paginator.pageSize = this.switchBatchInvoicesData.length
      this.dataSourceSwitchBatchInvoiceDetails.paginator = this.paginator;
    }

    this.activeRoute.params.subscribe(params => {

      if (params.switchBatchType)
        this.switchBatchType = +params.switchBatchType;

      this.searchBatchSearchCrateria = {
        switchTypes: null,
        switchBatchId: params['id'],
        batchNumber: null,
        dateSubmitted: this.datepipe.transform("", 'yyyy-MM-dd'),
        dateSwitched: this.datepipe.transform("", 'yyyy-MM-dd'),
        dateRecieved: this.datepipe.transform("", 'yyyy-MM-dd'),
        assignedToUserId: null,
        isCompleteBatches: null,
        switchBatchType:this.switchBatchType,
        pageNumber: 0,
        pageSize: 0
      }

    });
  }

  ngAfterViewInit(): void {
    this.checkedItemsToReinstate = new Array();
  }

  getRouteData() {
    this.activeRoute.params.subscribe((params: any) => {
      if (params.switchBatchType) {
        this.switchBatchType = +params.switchBatchType;

      }
    });
  }

  getSwitchBatchList() {
    this.loading$.next(true);
    const roleName = "Medical Invoice Approval: Processor"
    let filteredRole = this.roles.filter(role => role.name == roleName);
    this.medicareMedicalInvoiceSwitchBatchService.getMedicalSwitchBatchList(this.searchBatchSearchCrateria).subscribe(val => {
        
      this.switchBatchSearchResponseData = val;
      if (val[0].dateCompleted == null) {
        this.canReassign = true;
      }
      if (filteredRole.length > 0) {
        this.userService.getUsersByRoleIds([filteredRole[0].id.toString()]).subscribe(resp => {
          this.switchBatchAssignToUsersList = resp;
          let assignToUserDefaultUser = resp.filter(data => data.id == val[0].assignedUserId);
          this.setAssignToUserDefaultUser(assignToUserDefaultUser[0]);
          this.loading$.next(false);
        });
      }

    });
  }

  getRoles() {
    this.roleService.getRoles().subscribe(data => {
      this.roles = data;
      if (this.roles.length > 0) {
        this.getSwitchBatchList();
      }
    });
  }

  highlightSeletectedRecord(row){
    this.selectedRowIndex=row.spInvoiceNumber;
  }
  
  setAssignToUserDefaultUser(assignToUseDefault){
    this.form.patchValue({
      assignToUse : assignToUseDefault
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
    this.canAutoPay = userUtility.hasPermission('AutoPayMedicalInvoice');
  }

  onViewSwitchInvoice(batchInvoiceDataClicked) {
    this.loading$.next(true);
    const dialogRef = this.dialog.open(InvoiceSwitchBatchViewerModalComponent, {
      width: '80%',
      data: { invoiceDataClicked: batchInvoiceDataClicked, switchBatchType: this.switchBatchType }
    });
    this.loading$.next(false);
  }

  onViewUnderAssessReasons(batchInvoiceDataClicked) {
    this.loading$.next(true);
    const dialogRef = this.dialog.open(InvoiceUnderAssessReasonsViewerModalComponent, {
      width: '80%',
      data: { invoiceDataClicked: batchInvoiceDataClicked }
    });
    this.loading$.next(false);
  }

  onDeleteInvoiceReasonModal(batchInvoiceDataClicked): void {
    const dialogRef = this.dialog.open(InvoiceSwitchBatchDeleteReasonComponent, {
      width: '50%',
      data: { switchBatchInvoiceToDelete: batchInvoiceDataClicked }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading$.next(true);
        this.dataSourceSwitchBatchInvoiceDetails.data = null;
        this.refreshSwitchBatchHeader()
        this.medicareMedicalInvoiceSwitchBatchService.getMedicalSwitchBatchInvoiceDetails(this.searchBatchSearchCrateria.switchBatchId).subscribe(data => {
          this.refreshTableDataSource(data)
          this.loading$.next(false);
        })
      }
    });
  }

  refreshTableDataSource(data) {
      this.dataSourceSwitchBatchInvoiceDetails.data = data;
  }

  refreshSwitchBatchHeader() {
    this.switchBatchSearchResponseData$ = this.medicareMedicalInvoiceSwitchBatchService.getMedicalSwitchBatchList(this.searchBatchSearchCrateria);
  }

  onAddBatchInvoice(element:MedicalSwitchBatchInvoice) {

    if (element.switchBatchInvoiceLines.length === 0)
    {
      this.alertService.error(`Selected invoice has no lines`);
      return;
    }

    this.loading$.next(true);
    
    const startWizardRequest = new StartWizardRequest();
    let invoiceBatchLineDetails: InvoiceLineDetails[] = [];
    let counter = 0;
    for (let i = 0; i < element.switchBatchInvoiceLines.length; i++) {
      counter -= 1
      let invoiceBatchLineItems: InvoiceLineDetails = {
        tariffBaseUnitCostType: '',
        tariffDescription: '',
        defaultQuantity: +element.switchBatchInvoiceLines[i].quantity,
        invoiceLineId: counter,
        invoiceId: 0,
        serviceDate: element.switchBatchInvoiceLines[i].serviceDate,
        serviceTimeStart: element.switchBatchInvoiceLines[0].serviceTimeStart,
        serviceTimeEnd: element.switchBatchInvoiceLines[0].serviceTimeEnd,
        requestedQuantity: +element.switchBatchInvoiceLines[i].quantity,
        authorisedQuantity: 0,
        requestedAmount: element.switchBatchInvoiceLines[i].totalInvoiceLineCost,
        requestedVat: element.switchBatchInvoiceLines[i].totalInvoiceLineVat,
        requestedAmountInclusive: 0,
        authorisedAmount: 0,
        authorisedVat: 0,
        authorisedAmountInclusive: 0,
        totalTariffAmount: element.switchBatchInvoiceLines[i].totalInvoiceLineCost,
        totalTariffVat: element.switchBatchInvoiceLines[i].totalInvoiceLineVat,
        totalTariffAmountInclusive: 0,
        tariffAmount: 0,
        creditAmount: element.switchBatchInvoiceLines[i].creditAmount,
        vatCode: (element.switchBatchInvoiceLines[i].totalInvoiceLineVat > 0) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
        vatPercentage: 0,
        tariffId: 82247,
        treatmentCodeId: 1,
        medicalItemId: 1,
        hcpTariffCode: element.switchBatchInvoiceLines[i].tariffCode,
        tariffBaseUnitCostTypeId: 3,
        description: element.switchBatchInvoiceLines[i].description,
        summaryInvoiceLineId: 0,
        isPerDiemCharge: false,
        isDuplicate: false,
        duplicateInvoiceLineId: 0,
        calculateOperands: '',
        icd10Code: element.switchBatchInvoiceLines[i].icd10Code,
        id: 0,
        //base properties
        createdBy: '',
        modifiedBy: '',
        createdDate: undefined,
        modifiedDate: undefined,
        isActive: true,
        isDeleted: false,
        validationMark: "done",
        canEdit: false,
        canAdd: false,
        canRemove: false,
        permissionIds: [],
        invoiceLineUnderAssessReasons: [],
        quantity: 0,
        totalInvoiceLineCost: 0,
        totalInvoiceLineVat: 0,
        totalInvoiceLineCostInclusive: 0,
        isModifier: false,
        publicationId: 0
      }

      invoiceBatchLineDetails.push(invoiceBatchLineItems)
    }

    let wizardModel: InvoiceDetails = {
      claimReferenceNumber: element.claimReferenceNumber,
      healthCareProviderName: element.healthCareProviderName,
      payeeName: element.healthCareProviderName,
      payeeType: '',
      underAssessReason: '',
      practitionerTypeId: 0,
      practitionerTypeName: '',
      practiceNumber: (!isNullOrUndefined(element.practiceNumber)) ? element.practiceNumber : '0',
      isVat: (element.switchBatchInvoiceLines[0].totalInvoiceLineVat > 0) ? true : false,
      vatRegNumber: '',
      greaterThan731Days: MedicareUtilities.isChronic(new Date(element.dateAdmitted), new Date(element.dateDischarged)),
      invoiceLineDetails: invoiceBatchLineDetails,//batch line items
      invoiceId: 1,//for batch set to greater than zoro so we enter the loadSelectedInvoice() and prepopulate form with batch data
      claimId: 0,
      personEventId: element.possiblePersonEventId,
      eventId: element.possibleEventId,
      healthCareProviderId: element.healthCareProviderId,
      hcpInvoiceNumber: element.spInvoiceNumber,
      hcpAccountNumber: element.spAccountNumber,
      invoiceNumber: '',
      invoiceDate: element.invoiceDate,
      paymentConfirmationDate: '',
      dateSubmitted: element.dateSubmitted,
      dateReceived: element.dateReceived,
      dateAdmitted: element.dateAdmitted,
      dateDischarged: element.dateDischarged,
      invoiceStatus: InvoiceStatusEnum.Captured,
      invoiceAmount: element.totalInvoiceAmount,
      invoiceVat: element.totalInvoiceVat,
      invoiceTotalInclusive: element.totalInvoiceAmountInclusive,
      authorisedAmount: 0,
      authorisedVat: 0,
      authorisedTotalInclusive: 0,
      payeeId: element.healthCareProviderId, //In 99% of the cases Payee is the same as HealthCareProvider | So for now we assign HealthCareProviderId to the PayeeId
      payeeTypeId: PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 
      underAssessReasonId: 0,
      underAssessedComments: '',
      switchBatchInvoiceId: element.switchBatchInvoiceId,
      switchBatchId: element.switchBatchId,
      holdingKey: '',
      isPaymentDelay: false,
      isPreauthorised: false,
      preAuthXml: '',
      comments: '',
      serviceDate: element.switchBatchInvoiceLines[0].serviceDate,
      serviceTimeStart: element.switchBatchInvoiceLines[0].serviceTimeStart,
      serviceTimeEnd: element.switchBatchInvoiceLines[0].serviceTimeEnd,
      eventDate: '',
      dateOfDeath: '',
      invoiceLines: [],
      invoiceUnderAssessReasons: [],
      id: 0,
      createdBy: element.createdBy,
      modifiedBy: element.modifiedBy,
      createdDate: element.createdDate,
      modifiedDate: element.modifiedDate,
      isActive: element.isActive,
      isDeleted: element.isDeleted,
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: [],
      isMedicalReportExist: false,
      medicalInvoiceReports: [],
      medicalInvoicePreAuths: [],
      batchNumber: '',
      invoiceStatusDesc: '',
      person: '',
      status: ''
    };

    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'capture-medical-invoice';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/capture-medical-invoice/continue/${wizard.id}`);
      })
  }

  onReinstate() {
    if (this.checkedItemsToReinstate.length === 0) {
      this.toastr.infoToastr('Please select atleast one task to reassign.');
      return;
    }
    else {
      const dialogRef = this.dialog.open(InvoiceSwitchBatchReinstateReasonComponent, {
        width: '35%',
        data: { switchBatchInvoicesToReinstate: this.checkedItemsToReinstate }
      })

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loading$.next(true);
          this.dataSourceSwitchBatchInvoiceDetails.data = null;
          this.refreshSwitchBatchHeader();
          this.medicareMedicalInvoiceSwitchBatchService.getMedicalSwitchBatchInvoiceDetails(this.searchBatchSearchCrateria.switchBatchId).subscribe(data => {
            this.refreshTableDataSource(data);
            this.loading$.next(false);
          })
        }
      });      
    }
  }

  AddCheckedItems(event, item) {
    if (event.checked === true) {
      let valueExist = false;
      for (let i = 0; i < this.checkedItemsToReinstate.length; i++) {
        if(this.checkedItemsToReinstate[i] == item.switchBatchInvoiceId){
          valueExist = true;
        }
      }
      if (valueExist === false) {
        this.checkedItemsToReinstate.push(item.switchBatchInvoiceId);
      }
    } 
    else if (event.checked === false) {
      let valueExist = false;
      let index: number;

      for (let i = 0; i < this.checkedItemsToReinstate.length; i++) {
        if(this.checkedItemsToReinstate[i] == item.switchBatchInvoiceId){
          valueExist = true;
          index = i;
        }
      }

      if(valueExist === true){
        this.checkedItemsToReinstate.splice(index,1);
      }
    }    
  }

  onAssignToUserChange(selected) {
    this.selectedAssignToUser = selected.value;
    this.userSelected = true;
  }

  onReAssign() {
    let medicalSwitchBatchData = {
      switchBatchId: this.searchBatchSearchCrateria.switchBatchId,
      assignedUserId: this.selectedAssignToUser.id,
      assignedToRoleId: this.selectedAssignToUser.roleId,
    }
    let medicalSwitchBatch:MedicalSwitchBatch = medicalSwitchBatchData as MedicalSwitchBatch
    this.medicareMedicalInvoiceSwitchBatchService.editSwitchBatchAssignToUser(medicalSwitchBatch).subscribe(res =>{
      this.alertService.success(`User Assigned successfully`);
    })
  }

  onRefreshMapping() {
    this.loading$.next(true);
    this.medicareMedicalInvoiceSwitchBatchService.validateSwitchBatchInvoicesForRefreshMapping(this.searchBatchSearchCrateria.switchBatchId,true).subscribe(res =>{
   })
   this.alertService.success(`The batch invoices are currently being validated. Please refresh the page after a few minutes.`);
   this.loading$.next(false);
  }

  onUnprocessedBatchInvoiceList(invoice) {
    this.router.navigate(['medicare/invoice-switch-batch-unprocessed-milist', {
      switchBatchType:this.switchBatchType,
      switchBatchInvoiceId:invoice.switchBatchInvoiceId,
      claimReferenceNumber: invoice.claimReferenceNumber, possiblePersonEventId: invoice.possiblePersonEventId,
      possibleEventId: invoice.possibleEventId, switchBatchId: invoice.switchBatchId, switchBatchNumber: invoice.switchBatchNumber,
      practiceNumber: invoice.practiceNumber
    }]);

  }

   getInvoiceUnderAssessReasons(invoice: MedicalSwitchBatchInvoice): string {
    if (!invoice.invoiceId) {
      switch(invoice.switchInvoiceStatus) {
        case SwitchInvoiceStatusEnum.Deleted:
          if (!String.isNullOrEmpty(invoice.activeUnderAssessReason))
            return  invoice.status + " :" + invoice.activeUnderAssessReason
          else
            return invoice.status;
        case SwitchInvoiceStatusEnum.Reinstated:
          if (!String.isNullOrEmpty(invoice.reinstateReason))
            return  invoice.status + " :" + invoice.reinstateReason
          else
            return invoice.status;
        default:
          return invoice.status;
      }
    }
    else {
      if (invoice.medicalInvoiceUnderAssessReasons 
        && invoice.medicalInvoiceUnderAssessReasons.length > 0) {
          let underAssessReasons =  invoice.medicalInvoiceUnderAssessReasons.map(reason => reason.underAssessReason);
          underAssessReasons = underAssessReasons.filter((value, index) => underAssessReasons.indexOf(value) === index);
          return underAssessReasons.join(",");
        }
        else {
          return String.Empty;
        }
    }
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
        case SwitchInvoiceStatusEnum.Reinstated:
          if (!String.isNullOrEmpty(invoice.reinstateReason))
            return invoice.status + " :" + invoice.reinstateReason
          else
            return invoice.status;
        default:
          return invoice.status;
      }
    }
  }

  getClaimReferenceNumber(invoice: MedicalSwitchBatchInvoice) : string { 
    if (!String.isNullOrEmpty(invoice.claimReferenceNumberMatch))
      return invoice.claimReferenceNumberMatch;
    else
      return invoice.claimReferenceNumber;
  }
  
  canReinstate(invoice: MedicalSwitchBatchInvoice) {
    return invoice.switchInvoiceStatus == SwitchInvoiceStatusEnum.Deleted;
  }

  onNavigateBack() {
    let url: string = "";
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        url = `medicare/invoice-switch-batch-search/${SwitchBatchType.MedEDI}`;
        break;
      case SwitchBatchType.Teba:
        url = `medicare/invoice-switch-batch-search/${SwitchBatchType.Teba}`;
        break;
      default:
        break;
    }
    this.router.navigate([url]);
  }

}
 