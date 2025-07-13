import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PersonEventSearch } from '../../shared/entities/personEvent/person-event-search';
import { ExitReasonDescriptionDataSource } from './exit-reason-description.datasource';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { MatRadioChange } from '@angular/material/radio';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ExitReasonSearchParams } from '../../shared/entities/personEvent/exit-reason-search-parameters';
import { Constants } from '../../../constants';

@Component({
  selector: 'exit-reason-description',
  templateUrl: './exit-reason-description.component.html',
  styleUrls: ['./exit-reason-description.component.css'],
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

export class ExitReasonDescriptionComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @Input() title: string;

  displayedColumns: string[] = ['expand', 'personEventNumber', 'memberNumber', 'memberName', 'identificationNumber', 'insuredLife', 'createdDate', 'isStraightThroughProcess', 'suspiciousTransactionStatus'];
  currentQuery: any;
  form: UntypedFormGroup;
  alertService: AlertService;
  appEventManagerService: AppEventsManager;
  query = '';
  Heading = '';

  showSearch = false;
  dataSource: ExitReasonDescriptionDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  suspiciousList: Lookup[];

  dataLoading = false;
  params = new ExitReasonSearchParams();
  reportFormats: string[] = ['CSV'];
  selectedreportFormat: string;
  @Input() selectreportFormat: string;
  isDownload = false;
  isDownloading = false;
  isSelected = false;
  exitReasonId: number;

  constructor(
    public router: Router,
    public claimCareService: ClaimCareService,
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    public lookupService: LookupService,
    public readonly datepipe: DatePipe,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    this.alertService = alertService;
    this.appEventManagerService = appEventsManager;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.exitReasonId = params.exitReasonId as number;
      this.getSTPExitReason(this.exitReasonId);
      this.dataSource = new ExitReasonDescriptionDataSource(this.claimCareService);
      this.getInitialData();

    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.currentQuery = this.currentQuery.trim();
            this.paginator.pageIndex = 0;
            this.getInitialData();
          } else if (this.currentQuery.length === 0) {
            this.getInitialData();
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  getInitialData() {
    this.setParams();
    this.params.exitReasonId = this.exitReasonId;
    this.dataSource.setData(this.params)
  }

  getData(filter: boolean) {

  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'PersonEventNumber';
    this.params.direction = this.sort.active ? this.sort.active : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getAuthenticationTypes(): void {
    this.lookupService.getSuspiciousTransactionTypes().subscribe(
      data => {
        this.suspiciousList = data;
      }
    );
  }

  back() {
    this.router.navigate(['/claimcare/claim-manager/coid-dashboard']);
  }

  search() {
    this.paginator.pageIndex = 0;
    this.getData(true);
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.getInitialData();
  }

  reset() {
    this.paginator.firstPage();
    this.getInitialData();

  }

  getSuspiciousTransactionStatus(id: number) {
    return this.format(SuspiciousTransactionStatusEnum[id]);
  }

  getSTPExitReason(id: number) {
    this.Heading = this.format(STPExitReasonEnum[id]);
    if (this.Heading === Constants.teamLeadLabel) {
      return this.Heading + Constants.teamLeadClaimManager
    } else {
      return this.Heading;
    }
  }

  format(text: string) {
    if (text && text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

  getClaimStatus(id: number) {
    return this.format(ClaimStatusEnum[id]);
  }
  getLiabilityStatus(id: number) {
    return this.format(ClaimLiabilityStatusEnum[id]);
  }

  getEventType(id: number) {
    return this.format(EventTypeEnum[id]);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  exporttoCSV(): void {
    this.isDownloading = true;
    this.params.pageIndex = 1
    this.params.pageSize = this.dataSource.dataLength;
    this.claimCareService.getExitReasonPersonEvents(this.params).subscribe(data => {
      var results = data as PagedRequestResult<PersonEventSearch>;
      results.data.forEach(element => {
        element.eventTypeDescription = this.getEventType(element.eventType);
        element.claimLiabilityStatusDescription = this.getLiabilityStatus(element.claimLiabilityStatus);
        element.claimStatusDescription = this.getClaimStatus(element.claimStatus);
        element.stpExitReasonDescription = element.stpDescription;
        element.suspiciousTransactionStatusDescription = this.getSuspiciousTransactionStatus(element.suspiciousTransactionStatus);
      });

      results.data.forEach(element => {
        delete element.eventType;
        delete element.claimLiabilityStatus;
        delete element.claimStatus;
        delete element.stpExitReason;
        delete element.suspiciousTransactionStatus;
        delete element.stpDescription;
        delete element.medicalReportForm;
        delete element.claimId;
      });
      const workSheet = XLSX.utils.json_to_sheet(results.data, { header: [] });
      const workBook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');

      XLSX.writeFile(workBook, 'PersonEvents.xlsx');
      this.toastr.successToastr('Person events exported successfully');
      this.isDownloading = false;
    })
  }

  reportFormatChange(event: MatRadioChange) {
    this.isDownload = true;
    this.selectedreportFormat = event.value;
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }
}
