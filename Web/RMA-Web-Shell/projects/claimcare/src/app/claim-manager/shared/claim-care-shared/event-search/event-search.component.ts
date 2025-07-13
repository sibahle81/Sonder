import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { debounceTime } from 'rxjs/operators';
import { Constants } from '../../../../constants';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { EventSearch } from '../../entities/personEvent/event-search';
import { EventSearchParams } from '../../entities/personEvent/event-search-parameters';
import { EventTypeEnum } from '../../enums/event-type-enum';
import { EventSearchDataSource } from './event-search.datasource';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { MatRadioChange } from '@angular/material/radio';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { EventModel } from '../../entities/personEvent/event.model';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'event-search',
  templateUrl: './event-search.component.html',
  styleUrls: ['./event-search.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class EventSearchComponent extends UnSubscribe implements OnInit {

  @Input() title: string;
  @Input() selectedReportFormat: string;
  @Input() hideVisibility = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  displayedColumns: string[] = ['eventNumber', 'memberNumber', 'memberName', 'eventType', 'createdDate', 'dateOfIncident', 'actions'];
  currentQuery: any;
  form: any;
  maxDate = new Date();
  minDate = new Date();
  selected = 0;
  query = '';
  dataSource: EventSearchDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  params = new EventSearchParams();
  reportFormats: string[] = ['CSV'];
  selectedEvent: EventModel;

  isDownload = false;
  isDownloading = false;
  isSelected = false;
  viewClaimHolisticViewPermission = false;
  addEmployerClaimPermission = false;

  holisticView = '/claimcare/claim-manager/holistic-claim-view/';

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly claimCareService: ClaimCareService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private readonly toaster: ToastrManager,
    private readonly datePipeService: DatePipe,
    public dialog: MatDialog
  ) {
    super();
    this.createForm();
  }

  ngOnInit(): void {
    this.minDate.setFullYear(this.minDate.getFullYear() - 3);
    this.dataSource = new EventSearchDataSource(this.claimCareService);

    this.setPermissions();
    this.getInitialData();
    this.configureSearch();
  }

    setPermissions() {
    this.viewClaimHolisticViewPermission = this.userHasPermission('');
    this.addEmployerClaimPermission = this.userHasPermission('');
  }

  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;

    if (this.currentQuery.length >= 3) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.currentQuery.trim();
      this.paginator.pageIndex = 0;
      this.getData(true);
    } if (!this.currentQuery || this.currentQuery === '') {
      this.reset();
      this.getInitialData();
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      eventType: new UntypedFormControl(''),
      selectAllDates: new UntypedFormControl(''),
    });

    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      eventType: this.selected,
    })
  }

  applyData() {
    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < startDate) {
      this.form.get('endDate').setErrors({ 'min-date': true });
    } else {
      this.form.get('endDate').setErrors(null);
      this.paginator.firstPage();
      this.getData(true);
    }
  }

  ClearData() {
    this.form.controls.startDate.reset();
    this.form.controls.endDate.reset();
    this.form.controls.eventType.reset();
    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      eventType: this.selected,
      selectAllDates: false
    })
    this.enableFormControl('startDate');
    this.enableFormControl('endDate');
    this.paginator.pageIndex = 0;
    this.params.currentQuery = String.Empty;
    this.getInitialData();
  }

  getInitialData() {
    this.setParams();
    let start = new Date();
    this.params.startDate = this.datePipeService.transform(new Date(start.setMonth(start.getMonth() - 3)), Constants.dateString);
    this.params.endDate = this.datePipeService.transform(new Date(), Constants.dateString);
    this.params.eventType = 0;
    this.params.viewAll = false;
    this.params.filter = true;
    this.dataSource.setData(this.params);
  }

  getData(filter: boolean) {
    const model = this.form.value;
    this.setParams();
    if (!this.isSelected) {
      this.params.endDate = this.datePipeService.transform(model.endDate, Constants.dateString);
      this.params.startDate = this.datePipeService.transform(model.startDate, Constants.dateString);
    }
    this.params.eventType = model.eventType;
    this.params.viewAll = this.form.controls.selectAllDates.value === String.Empty ? false : this.form.controls.selectAllDates.value;
    this.params.filter = filter;
    this.dataSource.setData(this.params);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort?.active && this.sort?.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort?.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  selectAllChange($event: any) {
    const formDetails = this.form.getRawValue();
    this.isSelected = formDetails.selectAllDates;
    this.params.startDate = this.datePipeService.transform(formDetails.startDate, Constants.dateString);
    this.params.endDate = this.datePipeService.transform(formDetails.endDate, Constants.dateString);
    if (this.isSelected) {
      this.disableFormControl('startDate');
      this.disableFormControl('endDate');
    } else {
      this.enableFormControl('startDate');
      this.enableFormControl('endDate');
    }
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  loadData(): void {
    this.getData(true);
  }

  filterMenu(item: EventSearch) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      { title: 'Add Employee', url: '', disable: false },
    ];
  }

  onMenuSelect(item: EventSearch, menu: any) {
    switch (menu.title) {
      case 'View':
        let menuItem = this.menus.find(a => a.title === 'View');
        const hasStpPermission = userUtility.hasPermission(Constants.ViewSTPPermission)

        if (hasStpPermission) {
          menuItem.url = this.holisticView + item.eventId;
          this.router.navigateByUrl(menu.url);
        } else {
          menuItem.disable = true
        }
        break;
      case 'Add Employee':
        this.openAddEmployeeConfirmationDialog(item);
        break;
    }
  }

  reset() {
    this.paginator.firstPage();
    this.loadData();
  }

  getEventTypeStatus(id: number) {
    return EventTypeEnum[id];
  }

  startAddInjuredEmployeeWizard(item: EventSearch) {
    if (item.eventId > 0) {
      this.alertService.loading('Starting Injured Employee wizard');
      this.claimCareService.getEvent(item.eventId).subscribe(result => {
        if (result) {
          this.selectedEvent = result;
          const startWizardRequest = new StartWizardRequest();
          startWizardRequest.data = JSON.stringify(this.selectedEvent);
          startWizardRequest.type = 'accident-claim';
          this.createWizard(startWizardRequest);
        }
      });
   }
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      if (startWizardRequest.type === 'accident-claim') {
        this.router.navigate(['/claimcare/claim-manager/accident-claim/continue/', result.id]);
      }
    });
  }

  format(text: string) {
    if (text && text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

  getEventType(id: number) {
    return this.format(EventTypeEnum[id]);
  }

  exportToCSV(): void {
    this.isDownloading = true;
    this.params.pageSize = this.dataSource.dataLength;
    this.claimCareService.eventSearch(this.params).subscribe(data => {
      var results = data as PagedRequestResult<EventSearch>;
      results.data.forEach(element => {
        element.eventTypeDescription = this.getEventType(element.eventType);
      });

      results.data.forEach(element => {
        delete element.eventType;
      });

      const workSheet = XLSX.utils.json_to_sheet(results.data, { header: [] });
      const workBook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
      XLSX.writeFile(workBook, 'EventList.xlsx');
      this.toaster.successToastr('Events exported successfully');
      this.isDownloading = false;
    })
  }

  reportFormatChange(event: MatRadioChange) {
    this.isDownload = true;
    this.selectedReportFormat = event.value;
  }

  showDetail() {
    this.hideVisibility = !this.hideVisibility;
  }

  openAddEmployeeConfirmationDialog(item: EventSearch) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Start Add Employee Workflow?',
        text: 'Are you sure you want to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startAddInjuredEmployeeWizard(item);
      }
    });
  }
}

