import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, merge } from 'rxjs';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicalSwitchBatch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { MedicalInvoiceSearchBatchCriteria } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-batch-criteria';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { filter, tap } from 'rxjs/operators';
import { UrlService } from 'projects/medicare/src/app/medical-invoice-manager/services/url.service';
import { MedicareSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-switch-batch.service';
import { MedicalSwitch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { SwitchBatchDataSource } from './invoice-switch-batch-datasource';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';

@Component({
  selector: 'app-invoice-switch-batch-search',
  templateUrl: './invoice-switch-batch-search.component.html',
  styleUrls: ['./invoice-switch-batch-search.component.css']
})
export class InvoiceSwitchBatchSearchComponent implements OnInit, AfterViewInit  {

  @Input() switchBatchSearchCrateria: MedicalSwitchBatch;
  @Output() switchBatchSearchResponseEvent = new EventEmitter<MedicalSwitchBatch[]>();
  form: UntypedFormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  switcheTypeSelection: string = "";
  switchBatchAssignToUsersList: User[];
  assignedUserId: number;
  isCompleteBatches: boolean = false;
  currentUrl: string = '';
  previousUrl: string = '';
  switchTypes: MedicalSwitch[];
  showNewSearchBtn = false;
  
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSourceSwitchBatchSearchList: SwitchBatchDataSource;

  selection = new SelectionModel<InvoiceDetails>(true, []);

  displayedColumnsSwitchBatchSearchList: string[] = [
    'description',
    'switchBatchNumber',
    'dateSubmitted',
    'dateReceived',
    'dateCompleted',
    'invoicesCounted',
    'invoicesProcessed',
    'amountCountedInclusive',
    'switchFileName',
    'viewInvoice',
    'assignedUser'
  ];
  showSwitchBatchList = false;

  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private userService: UserService,
    readonly confirmservice: ConfirmationDialogsService,
    private urlService: UrlService,
    private switchBatchService: MedicareSwitchBatchService) {
    if (this.router.getCurrentNavigation().previousNavigation) {
       this.previousUrl = this.router.getCurrentNavigation().previousNavigation.finalUrl.toString();
    }
    this.getRouteData();

  }

  ngOnInit() {
    this.createForm();
    const roles = [RoleEnum.MedicalInvoiceApprovalController.toString()]
    this.userService.getUsersByRoleIds(roles).subscribe(resp => {
      this.switchBatchAssignToUsersList = resp;
    });

  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSourceSwitchBatchSearchList.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
            this.onBatchInvoiceSearch();
        })
      )
      .subscribe();

      if (this.previousUrl.includes('/medicare/invoice-switch-batch-view-details/')) {
        this.onBatchInvoiceSearch(true);
      }
  }


  getRouteData() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.switchBatchType) {
        this.switchBatchType = +params.switchBatchType;

        this.switchBatchService.GetSwitchTypes().subscribe(res => {
          //this.switchTypes = res;
          switch (this.switchBatchType) {
            case SwitchBatchType.MedEDI:
              //exlude teba types
              this.switchTypes = res.filter(val => {
                return val.name.indexOf(SwitchBatchType[SwitchBatchType.Teba.valueOf()]) == -1;
              });
              break;

            case SwitchBatchType.Teba:
              //show only teba types
              this.switchTypes = res.filter(val => {
                return val.name.indexOf(SwitchBatchType[SwitchBatchType.Teba.valueOf()]) !== -1;
              });
              break;

            default:
              break;
          }
        });

      }
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      switcheType: [''],
      switchBatchId: [''],
      batchNumber: [''],
      dateSubmitted: [''],
      dateSwitched: [''],
      dateRecieved: [''],
      assignedToUser: [''],
      isCompleteBatches: false
    });

    this.dataSourceSwitchBatchSearchList = new SwitchBatchDataSource(this.medicareMedicalInvoiceSwitchBatchService);
    this.dataSourceSwitchBatchSearchList.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
  }

  onResetForm() {
    this.form.reset();
  }

  switchBatchSearchResponse: MedicalSwitchBatch[] = [];
  searchBatchSearchCrateria: MedicalInvoiceSearchBatchCriteria

  onBatchInvoiceSearch(isReusingExistingParams = false) {
   if (!isReusingExistingParams) {
    this.searchBatchSearchCrateria = {
      switchTypes: (!isNullOrUndefined(this.switcheTypeSelection)) ? this.form.controls.switcheType.value : null,
      switchBatchId: (this.form.controls.switchBatchId.value > 0) ? this.form.controls.switchBatchId.value : 0,
      batchNumber: (this.form.controls.batchNumber.value != "") ? this.form.controls.batchNumber.value : null,
      dateSubmitted: (this.form.controls.dateSubmitted.value != "") && (this.form.controls.dateSubmitted.value != null) ? this.datepipe.transform(this.form.controls.dateSubmitted.value, 'yyyy-MM-dd')
        : this.datepipe.transform("", 'yyyy-MM-dd'),
      dateSwitched: (this.form.controls.dateSwitched.value != "") && (this.form.controls.dateSwitched.value != null) ? this.datepipe.transform(this.form.controls.dateSwitched.value, 'yyyy-MM-dd')
        : this.datepipe.transform("", 'yyyy-MM-dd'),
      dateRecieved: (this.form.controls.dateRecieved.value != "") && (this.form.controls.dateRecieved.value != null) ? this.datepipe.transform(this.form.controls.dateRecieved.value, 'yyyy-MM-dd')
        : this.datepipe.transform("", 'yyyy-MM-dd'),
      assignedToUserId: this.assignedUserId,
      isCompleteBatches: this.isCompleteBatches,
      switchBatchType: this.switchBatchType,
      pageNumber: 0,
      pageSize: 0
    }

    this.dataSourceSwitchBatchSearchList.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchBatchSearchCrateria);
    
    this.showSwitchBatchList = true;

    const searchParamsItem = sessionStorage.getItem("switchBatchSearchParams");
    if (searchParamsItem) { 
       sessionStorage.removeItem("switchBatchSearchParams");
    }

    const newSearchParams = {
      switchType: this.form.controls.switcheType.value,
      switchBatchId: this.form.controls.switchBatchId.value,
      batchNumber: this.form.controls.batchNumber.value,
      dateSubmitted: this.form.controls.dateSubmitted.value,
      dateSwitched: this.form.controls.dateSwitched.value,
      dateReceived: this.form.controls.dateRecieved.value,
      assignedToUserId: this.assignedUserId,
      switchBatchType: this.switchBatchType,
      pageNumber: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize
    };
    
    sessionStorage.setItem("switchBatchSearchParams", JSON.stringify(newSearchParams));
   } 
   else {
    const searchParamsItem = sessionStorage.getItem("switchBatchSearchParams");
    let searchParams = null;
    if (searchParamsItem && searchParamsItem.length > 0) {
       searchParams = JSON.parse(searchParamsItem);
    }

    if (searchParams) {
      this.form.controls.switcheType.patchValue(searchParams.switchType);
      this.form.controls.switchBatchId.patchValue(searchParams.switchBatchId);
      this.form.controls.batchNumber.patchValue(searchParams.batchNumber);
      this.form.controls.dateSubmitted.patchValue(searchParams.dateSubmitted);
      this.form.controls.dateSwitched.patchValue(searchParams.dateSwitched);
      this.form.controls.dateRecieved.patchValue(searchParams.dateReceived);
      this.assignedUserId = searchParams.assignedUserId;
      this.isCompleteBatches = false;

      this.searchBatchSearchCrateria = {
        switchTypes: this.form.controls.switcheType.value,
        switchBatchId: this.form.controls.switchBatchId.value > 0 ? this.form.controls.switchBatchId.value : 0,
        batchNumber: this.form.controls.batchNumber.value != "" ? this.form.controls.batchNumber.value : null,
        dateSubmitted: (this.form.controls.dateSubmitted.value != "") && (this.form.controls.dateSubmitted.value != null) ? this.datepipe.transform(this.form.controls.dateSubmitted.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        dateSwitched: (this.form.controls.dateSwitched.value != "") && (this.form.controls.dateSwitched.value != null) ? this.datepipe.transform(this.form.controls.dateSwitched.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        dateRecieved: (this.form.controls.dateRecieved.value != "") && (this.form.controls.dateRecieved.value != null) ? this.datepipe.transform(this.form.controls.dateRecieved.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        assignedToUserId: this.assignedUserId,
        isCompleteBatches: this.isCompleteBatches,
        switchBatchType: this.switchBatchType,
        pageNumber: searchParams.pageNumber ?  searchParams.pageNumber : 0,
        pageSize: searchParams.pageSize ?  searchParams.pageSize : 0
      }

      this.dataSourceSwitchBatchSearchList.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchBatchSearchCrateria);
      this.showSwitchBatchList = true;
    }
   }

   this.showNewSearchBtn = true;
  }

  onNewSearch() {
    this.showNewSearchBtn = false;
    this.onResetForm();
    this.dataSourceSwitchBatchSearchList.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.paginator.length = 0;
    this.showSwitchBatchList= false;
  }

  onChangeSwitcheType(e) {
    this.switcheTypeSelection = e.value;
  }

  onChangeAssignedUser(e) {
    this.assignedUserId = e.value;
  }

  selectIsCompleteBatches(event: any) {
    this.isCompleteBatches = event.checked;
  }
  
  onClickView(switchBatchId) {
    this.dataSourceSwitchBatchSearchList.isLoading = true;
    this.router.navigate(['/medicare/medical-invoice-manager/invoice-switch-batch-view-details', switchBatchId,this.switchBatchType]);
  }

}