import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { CollectionStatus } from 'projects/fincare/src/app/billing-manager/models/collectionstatus';
import { CollectionType } from 'projects/fincare/src/app/billing-manager/models/collectiontype';
import { Collection } from 'projects/fincare/src/app/billing-manager/models/collection';
import { FilterCollectionsRequest } from 'projects/fincare/src/app/billing-manager/models/filter-collections-request';
import { CollectionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/collection-status-enum';
import { CollectionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/collection-type-enum';
import { CollectionDialogComponent } from 'projects/fincare/src/app/billing-manager/views/collection-dialog/collection-dialog.component';
import { CollectionsDataSource } from './collections.datasource';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { CollectionsService } from 'projects/fincare/src/app/billing-manager/services/collections.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CollectionsComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  selectedFilterTypeId: number;
  selectedCollectionType = CollectionTypeEnum.Normal;
  selectedCollectionStatus = CollectionStatusEnum.Pending;
  filterCollectionsRequest: FilterCollectionsRequest;

  collectionTypes = [new CollectionType(0, 'All'), new CollectionType(1, 'Normal'), new CollectionType(2, 'Adhoc'), new CollectionType(3, 'Term Arrangement')];
  collectionStatuses = [new CollectionStatus(0, 'All'), new CollectionStatus(1, 'Pending'), new CollectionStatus(2, 'Submitted'),
  new CollectionStatus(3, 'Collected'), new CollectionStatus(4, 'Rejected'), new CollectionStatus(5, 'Reconciled'),
  new CollectionStatus(6, 'Not Reconciled'), new CollectionStatus(7, 'Queued'), new CollectionStatus(8, 'Reversed'),
  new CollectionStatus(9, 'Discarded')];

  startDate: Date;
  endDate: Date;
  start: any;
  end: any;

  startDt: UntypedFormControl;
  endDt: UntypedFormControl;

  menus: { title: string, action: string, disable: boolean }[];

  hasSubmitDebitOrderPermission: boolean;
  hasPermissionSubmitAllDebitOrders: boolean;
  isVisible = true;
  currentUserObject: User;
  reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
  showReport = false;
  selectedreportFormat: string;
  @Input() selectreportFormat: string;
  errors: string[] = [];
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit: string;
  isDownload: string;
  isDownloading = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: CollectionsDataSource;

  currentQuery: string;
  amountFormat = Constants.amountFormat;

  constructor(
    protected readonly formBuilder: UntypedFormBuilder,
    public readonly collectionsService: CollectionsService,
    private readonly authService: AuthService,
    private readonly datePipe: DatePipe,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly lookupService: LookupService) {
    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 2);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');

    this.selectedFilterTypeId = 1;
  }

  openCollectionSubmissionDialog(row: Collection): void {
    row.dialogQuestion = 'Are you sure you want to submit this collection (Reference:' + row.bankReference + ') ?';
    const dialogRef = this.dialog.open(CollectionDialogComponent, {
      width: '300px',
      data: { collection: row }
    });

    dialogRef.afterClosed().subscribe(collection => {
      if (collection == null) {
        return;
      }

      const datasource = (this.dataSource as CollectionsDataSource);
      datasource.submitCollection(collection).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        result => {
          if (result && (result.collectionStatus === CollectionStatusEnum.Queued || result.collectionStatus === CollectionStatusEnum.Submitted)) {
            this.done('Collection has been queued for submission!');
          } else {
            this.error('An error occured while trying to submit the collection.');
          }

          this.loadData();
        },
        error => this.error(error));
    });
  }

  ngOnInit(): void {
    this.isDownload = 'true';
    this.createForm();
    this.dataSource = new CollectionsDataSource(this.collectionsService);
    this.dataSource.clearData();
    this.selectedCollectionType = this.collectionTypes[0].id;
    this.selectedCollectionStatus = this.collectionStatuses[1].id;

    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;

    this.currentUserObject = this.authService.getCurrentUser();
    this.hasSubmitDebitOrderPermission = userUtility.hasPermission('Submit Debit Order');
    this.hasPermissionSubmitAllDebitOrders = userUtility.hasPermission('Submit All Debit Orders');

    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData(): void {
    this.filterCollectionsRequest = new FilterCollectionsRequest();
    this.filterCollectionsRequest.collectionType = this.selectedCollectionType;
    this.filterCollectionsRequest.collectionStatus = this.selectedCollectionStatus;
    this.filterCollectionsRequest.startDate = this.start;
    this.filterCollectionsRequest.endDate = this.end;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, 'asc', this.filterCollectionsRequest);
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'expand', def: 'expand', show: true },
      { display: 'Bank Reference', def: 'bankReference', show: true },
      {
        display: 'Debit Order Date', def: 'createdDate', show: (this.selectedCollectionStatus === this.collectionStatuses[0].id ||
          this.selectedCollectionStatus === CollectionStatusEnum.Pending || this.selectedCollectionStatus === CollectionStatusEnum.Queued
          || this.selectedCollectionStatus === CollectionStatusEnum.Submitted || this.selectedCollectionStatus === CollectionStatusEnum.Paid
          || this.selectedCollectionStatus === CollectionStatusEnum.Reconciled || this.selectedCollectionStatus === CollectionStatusEnum.NotReconciled
          || this.selectedCollectionStatus === CollectionStatusEnum.Reversed || this.selectedCollectionStatus === CollectionStatusEnum.Rejected)
      },
      { display: 'Submission Date', def: 'submissionDate', show: (this.selectedCollectionStatus === CollectionStatusEnum.Submitted) },
      { display: 'Rejection Date', def: 'rejectionDate', show: (this.selectedCollectionStatus === CollectionStatusEnum.Rejected) },
      { display: 'Collection Date', def: 'collectionConfirmationDate', show: (this.selectedCollectionStatus === CollectionStatusEnum.Paid) },
      {
        display: 'Reconciliation Date', def: 'reconciliationDate',
        show: (this.selectedCollectionStatus === CollectionStatusEnum.Reconciled || this.selectedCollectionStatus === CollectionStatusEnum.NotReconciled)
      },
      { display: 'Reversal Date', def: 'reversalDate', show: (this.selectedCollectionStatus === CollectionStatusEnum.Reversed) },
      { display: 'Collection Status', def: 'collectionStatus', show: true },
      { display: 'Debtor Details', def: 'debtor', show: true },
      { display: 'Account Details', def: 'accountNo', show: true },
      { display: 'Amount', def: 'amount', show: true },
      { display: 'Error Description', def: 'errorDescription', show: (this.selectedCollectionStatus === CollectionStatusEnum.Rejected) },
      { display: 'Actions', def: 'actions', show: true }
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }


readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
}

clearFilter(): void {
    this.form.patchValue({ query: '' });
}

  search(): void {
    if (this.form.valid) {
      this.selectedCollectionStatus = CollectionStatusEnum.Pending;
      this.currentQuery = this.readForm();
      this.dataSource.searchData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, {
        filter: this.selectedFilterTypeId,
        query: this.currentQuery
      });
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl('', [Validators.required]),
      query: new UntypedFormControl('', [Validators.minLength(3), Validators.required])
    });
  }

  onMenuItemClick(item: Collection, menu: any): void {
    switch (menu.action) {
      case 'submit':
        this.openCollectionSubmissionDialog(item);
        break;
      case 'resubmit':
        this.openCollectionSubmissionDialog(item);
        break;
    }
  }

  filterMenu(item: Collection) {
    this.menus = null;

    switch (this.selectedCollectionStatus) {
      case this.collectionStatuses[0].id:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: this.disableDebitOrderSubmission(item) },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Pending:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: this.disableDebitOrderSubmission(item) },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Submitted:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Paid:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Rejected:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: false },
          ];
        break;
      case CollectionStatusEnum.Reconciled:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.NotReconciled:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Queued:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case CollectionStatusEnum.Reversed:
        this.menus =
          [
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
    }
  }
  selectedFilterChanged($event: any) {
    this.selectedFilterTypeId = $event.value as number;
  }

  collectionTypeChanged($event: any) {
    this.selectedCollectionType = $event.value;
    this.loadData();
  }

  collectionStatusChanged($event: any) {
    this.selectedCollectionStatus = $event.value;
    this.loadData();
  }

  getCollectionTypeDesc(id: number): string {
    return this.collectionTypes.filter(type => type.id === id)[0].name;
  }

  getCollectionStatusDesc(id: number): string {
    return this.collectionStatuses.filter(status => status.id === id)[0].name;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.loadData();
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.loadData();
  }

  exportToExcel(): void {
    if (this.dataSource  && this.dataSource.data && this.dataSource.data.data && this.dataSource.data.data.length === 0) {
      return;
    }

    const filteredData = this.dataSource.data.data.map(x => {
      const data = {
        createdDate: x.createdDate,
        bankReference: x.bankReference,
        batchReference: x.batchReference,
        debitOrderDate: this.datePipe.transform(x.debitOrderDate, 'yyyy-MM-dd'),
        collectTionType: CollectionTypeEnum[x.collectionType],
        collectionStatus: CollectionStatusEnum[x.collectionStatus],
        debtorDetails: x.debtor,
        accountDetails: x.accountNo,
        bank: x.bank,
        bankBranch: x.bankBranch,
        amount: x.amount,
      };

      switch (x.collectionStatus) {
        case CollectionStatusEnum.Submitted:
          // tslint:disable-next-line:no-string-literal
          data['submissionDate'] = x.submissionDate;
          break;
        case CollectionStatusEnum.Paid:
          break;
        case CollectionStatusEnum.Reconciled:
          // tslint:disable-next-line:no-string-literal
          data['reconciliationDate'] = x.reconciliationDate;
          break;
        case CollectionStatusEnum.Rejected:
          // tslint:disable-next-line:no-string-literal
          data['errorCode'] = x.errorCode;
          // tslint:disable-next-line:no-string-literal
          data['errorDescription'] = x.errorDescription;
          // tslint:disable-next-line:no-string-literal
          data['rejectionDate'] = x.rejectionDate;
          break;
        case CollectionStatusEnum.Reversed:
          // tslint:disable-next-line:no-string-literal
          data['reversalDate'] = x.reversalDate;
          break;
        default:
          break;
      }

      return data;
    });

    const reportDataSource = {
      data: filteredData
    };

    DataGridUtil.downloadExcel(reportDataSource, 'List_Of_Collections.xlsx');
    this.done('Collection records exported successfully');
  }

  done(statusMassage: string) {
    this.toastr.successToastr(statusMassage, 'Success');
  }

  error(statusMassage: string) {
    this.toastr.errorToastr(statusMassage, 'Error');
  }

  submitAll(): void {
    if (this.hasPermissionSubmitAllDebitOrders) {
      const row = new Collection();
      row.dialogQuestion = 'Are you sure you want to submit all pending collections?';
      const dialogRef = this.dialog.open(CollectionDialogComponent, {
        width: '300px',
        data: { collection: row }
      });

      dialogRef.afterClosed().subscribe(collection => {
        if (collection == null) {
          return;
        }

        (this.dataSource as CollectionsDataSource).submitAll(this.start, this.end).subscribe(() => {
          this.done('Collections queued for submission');
          this.loadData();
        });
      });
    }
  }

  disableDebitOrderSubmission(item: Collection) {
    let disableSubmit = true;
    if (this.hasSubmitDebitOrderPermission) {
      disableSubmit = item.createdBy === this.currentUserObject.email ? true : false;
    }
    return disableSubmit;
  }

  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.selectedreportFormat = event.value;
  }

  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.showReport = false;

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          CollectionStatusId: this.selectedCollectionStatus,
          CollectionTypeId: this.selectedCollectionType,
          EndDate: this.end,
          StartDate: this.start
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMACollectionsReport';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.showReport = true;
        this.isDownloading = false;
      },
      error => {
        this.toastr.errorToastr(error);
      }
    );
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }
}
