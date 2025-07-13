import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormArray, UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { MonthlyPensionSetting } from '../../../shared-penscare/models/monthly-pension-setting.model';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { MonthEndDates } from '../../../shared-penscare/models/month-end-dates';
import { TimeOption } from '../../../shared-penscare/models/time-option.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AddMonthEndRunDateComponent } from '../add-month-end-run-date/add-month-end-run-date.component';
import { MonthEndRunDatesDataSource } from './month-end-dates.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MonthEndRunStatusEnum } from '../../../shared-penscare/enums/mont-end-run-status-enum';

@Component({
  selector: 'app-month-end-dates',
  templateUrl: './month-end-dates.component.html',
  styleUrls: ['./month-end-dates.component.css']
})
export class MonthEndDatesComponent implements OnInit {
  form: UntypedFormGroup;
  filterForm: UntypedFormGroup;
  loading = false;
  timeOptions: TimeOption[];
  pacsStrikeTimeOptions: TimeOption[][] = [];
  pacsCreateTimeOptions: TimeOption[][] = [];
  monthEndBalanceAndReleaseTimeOptions: TimeOption[][] = [];
  paymentTimeOptions: TimeOption[][] = [];
  monthEndCloseOfTimeOptions: TimeOption[][] = [];
  authorizationCloseOfTimeOptions: TimeOption[][] = [];
  dates: MonthEndDates[];
  dataSource: MonthEndRunDatesDataSource;

  runYearList: number[];
  runMonthList: MonthEnum[];
  runStatuses: MonthEndRunStatusEnum[];

  menus: { title: string; action: string; disable: boolean }[];
  dataSourceLoading: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private penscareMonthEndService: PenscareMonthEndService,
    private alertService: AlertService,
    public dialog: MatDialog,
    private readonly router: Router,
  )
  {
    this.dataSource = new MonthEndRunDatesDataSource(this.penscareMonthEndService);
  }

  ngOnInit(): void {
    
    this.loadFilterLookups();
    this.getMonthEndDates();
    this.createFiltersForm();

    //this.dataSource.loading$.subscribe((isLoading) => {
    //  this.dataSourceLoading = isLoading;
    //});

  }

  getMonthEndDates() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
  }

  refreshMonthEndDates() {
    this.loading = true;
    const year = new Date().getFullYear();
    this.penscareMonthEndService.getMonthEndDatesList(year).subscribe(
      response => {
        this.loading = false;
        this.dates = response;        
        this.dates.forEach(date => {
          this.addMonthEndDates(date)
        });
      }
    )
  }

  getMonthlyPensionSettings() {
    this.loading = true;
    this.penscareMonthEndService.getMonthlyPensionSettings().subscribe(
      response => {
        this.loading = false;
        this.createToAndstartDates();
        this.generateTimeOption(response);
        this.setFormTimeOptions();
        this.createForm();

      }
    )
  }

  generateTimeOption(monthlyPensionSettings: MonthlyPensionSetting) {
    monthlyPensionSettings.monthlyPensionScheduleMinuteSplit = Number(monthlyPensionSettings.monthlyPensionScheduleMinuteSplit);

    const count = (monthlyPensionSettings.monthlyPensionScheduleToTime - monthlyPensionSettings.monthlyPensionScheduleFromTime) * (60 / monthlyPensionSettings.monthlyPensionScheduleMinuteSplit);
    const timeOptions: TimeOption[] = []
    let _minutestring = '';
    let _minutes = 0;
    let _hours = monthlyPensionSettings.monthlyPensionScheduleFromTime;
    let _hoursString = '' ?
      _hours < 10 :
      `0${_hours.toString()}`;
    for (let i = 0; i < count; i++) {
      if (i == 0) {
        _minutestring = '00';
        _minutes = 0;
      }
      else if ((i * monthlyPensionSettings.monthlyPensionScheduleMinuteSplit) % 60 === 0) {
        _minutestring = '00';
        _minutes = 0;
        _hours++;
      } else {
        _minutes += monthlyPensionSettings.monthlyPensionScheduleMinuteSplit;
        _minutestring = _minutes < 10 ? `0${_minutes.toString()}` : _minutes.toString();
      }

      _hoursString = _hours < 10 ? `0${_hours.toString()}` : _hours.toString();
      timeOptions.push({
        key: `${_hoursString}:${_minutestring}`,
        value: `${_hoursString}:${_minutestring}`
      })
    }
    this.timeOptions = timeOptions;
  }

  createToAndstartDates() {
    this.dates = this.dates.map(date => {
      const startDateString = moment(date.authorizationCloseOfDate).clone().startOf('month').format('YYYY-MM-DD');
      const toDateString = moment(date.authorizationCloseOfDate).clone().endOf('month').format('YYYY-MM-DD');
      date.startDate = new Date(startDateString);
      date.toDate = new Date(toDateString);
      return date;
    })
  }

  setFormTimeOptions() {
    this.dates = this.dates.map((date, index) => {
      this.authorizationCloseOfTimeOptions.push(this.timeOptions);
      this.monthEndCloseOfTimeOptions.push(this.timeOptions);
      this.paymentTimeOptions.push(this.timeOptions);
      this.monthEndBalanceAndReleaseTimeOptions.push(this.timeOptions);
      this.pacsCreateTimeOptions.push(this.timeOptions);
      this.pacsStrikeTimeOptions.push(this.timeOptions);
      return date;
    })
  }

  createFiltersForm(): void {
    if (this.filterForm) { return; }
    this.filterForm = this.formBuilder.group({
      runYearId: [{ value: null, disabled: false }],
      runMonthId: [{ value: null, disabled: false }],
      runStatusId: [{ value: null, disabled: false }]
    });
  }

  createForm(): void {
    if (this.form) return;
    this.form = this.formBuilder.group({
      monthEndDates: this.formBuilder.array([])
    });
    this.dates.forEach(date => {
      this.addMonthEndDates(date)
    })
  }

  get monthEndDates() {
    return this.form.controls["monthEndDates"] as UntypedFormArray;
  }

  createMonthEndDates(monthEndDates?: MonthEndDates) {
    return this.formBuilder.group({
      month: [{ value: monthEndDates ? MonthEnum[monthEndDates.month] : '', disabled: true }, Validators.required],
      authorizationCloseOfDate: [monthEndDates ? monthEndDates.authorizationCloseOfDate : '', Validators.required],
      monthEndCloseOfDate: [monthEndDates ? monthEndDates.monthEndCloseOfDate : '', Validators.required],
      paymentDate: [monthEndDates ? monthEndDates.paymentDate : '', Validators.required],
      monthEndBalanceAndReleaseDate: [monthEndDates ? monthEndDates.monthEndBalanceAndReleaseDate : '', Validators.required],
      pacsCreateDate: [monthEndDates ? monthEndDates.pacsCreateDate : '', Validators.required],
      pacsStrikeDate: [monthEndDates ? monthEndDates.pacsStrikeDate : '', Validators.required],

      authorizationCloseOfTime: [monthEndDates ?
        moment(monthEndDates.authorizationCloseOfDate).clone().format('HH:mm') : '',
      Validators.required
      ],
      monthEndCloseOfTime: [monthEndDates ?
        moment(monthEndDates.monthEndCloseOfDate).clone().format('HH:mm') : '',
      Validators.required
      ],
      paymentTime: [monthEndDates ?
        moment(monthEndDates.paymentDate).clone().format('HH:mm') : '',
      Validators.required
      ],
      monthEndBalanceAndReleaseTime: [monthEndDates ?
        moment(monthEndDates.monthEndBalanceAndReleaseDate).clone().format('HH:mm') : '',
      Validators.required
      ],
      pacsCreateTime: [monthEndDates ?
        moment(monthEndDates.pacsCreateDate).clone().format('HH:mm') : '',
      Validators.required
      ],
      pacsStrikeTime: [monthEndDates ?
        moment(monthEndDates.pacsStrikeDate).clone().format('HH:mm') : '',
      Validators.required
      ]
    });
  }

  updateMonthEndDates(index: number) {
    const updateMonthEndDatesRequest: MonthEndDates = {
      month: this.monthEndDates.controls[index]['controls']['month']['value'],
      authorizationCloseOfDate: this.convertDateTimeStringToDate(index, 'authorizationCloseOf'),
      monthEndBalanceAndReleaseDate: this.convertDateTimeStringToDate(index, 'monthEndBalanceAndRelease'),
      monthEndCloseOfDate: this.convertDateTimeStringToDate(index, 'monthEndCloseOf'),
      paymentDate: this.convertDateTimeStringToDate(index, 'payment'),
      pacsCreateDate: this.convertDateTimeStringToDate(index, 'pacsCreate'),
      pacsStrikeDate: this.convertDateTimeStringToDate(index, 'pacsStrike'),
      year: new Date().getFullYear(),
      monthEndRunDateId: this.dates[index].monthEndRunDateId,
      monthEndRunStatus: 0
    }
    this.loading = true;
    this.penscareMonthEndService.updateMonthEndDates(updateMonthEndDatesRequest).subscribe(response => {
      this.loading = false;
      this.alertService.success('Month End Dates Updated Successfully');
    })
  }

  addMonthEndDates(monthEndDates?: MonthEndDates) {
    this.monthEndDates.push(this.createMonthEndDates(monthEndDates));
    this.cdr.detectChanges();
  }

  convertDateTimeStringToDate(index: number, control: string) {
    const dateString = moment(this.monthEndDates.controls[index]['controls'][`${control}Date`]['value']).clone().format('YYYY-MM-DD');
    const timeString = this.monthEndDates.controls[index]['controls'][`${control}Time`]['value'];
    return moment(`${dateString}T${timeString}:00.000Z`).toDate();
  }

  onSelect(index, action) {
    switch (action) {
      case 'update':
        this.updateMonthEndDates(index)
        break;
      default:
        break;
    }
  }
  onEdit(monthEndDate: MonthEndDates) {
    const dialogRef = this.dialog.open(AddMonthEndRunDateComponent, {
      width: '50%',
      disableClose: true,
      data: {
        'isReadOnly': false,
        'monthEndToEdit': monthEndDate
      }
    }).afterClosed()
      .subscribe((response) => {
        if (response) {
          this.refreshMonthEndDates();
        }
      });
  }
  onAdd() {
    const dialogRef = this.dialog.open(AddMonthEndRunDateComponent, {
      width: '50%',
      disableClose: true,
      data:{
        'isReadOnly': false
      }
    }).afterClosed()
    .subscribe((response) => {
      if (response) {
        this.refreshMonthEndDates();
      }
    });
  }

  monthEndSelected($event: MonthEndDates) {
    this.router.navigate([`/penscare/month-end/view-monthend-rundates/${$event.monthEndRunDateId}`]);
  }
  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'year', show: true},
      { def: 'month', show: true },
      { def: 'monthEndRunStatus', show: true},
      { def: 'authorizationCloseOfDate', show: true },
      { def: 'monthEndCloseOfDate', show: true },
      { def: 'paymentDate', show: true },
      { def: 'monthEndBalanceAndReleaseDate',show: true},
      { def: 'pacsCreateDate', show: true },
      { def: 'pacsStrikeDate', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  loadFilterLookups(): void {
    this.runStatuses = this.ToArray(MonthEndRunStatusEnum);
    this.runMonthList = this.ToArray(MonthEnum);
    this.penscareMonthEndService.GetMonthEndRunYears().subscribe(result => {
      if (result) {
        this.runYearList = result.sort((a, b) => a - b);
      }
      
    });
  }

  formatLookup(lookup: string): string {
    if (!lookup || lookup == '') { return 'N/A'; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  runYearFilterChanged(runYear: number): void {
    this.dataSource.runYear = runYear;
    this.getMonthEndDates();
  }

  runMonthFilterChanged(runMonth: MonthEnum): void {
    this.dataSource.runMonth = +MonthEnum[runMonth];
    this.getMonthEndDates();
  }

  runStatusFilterChanged(runStatus: MonthEndRunStatusEnum): void {
    this.dataSource.monthEndRunStatus = +MonthEndRunStatusEnum[runStatus];
    this.getMonthEndDates();
  }

  getRunMonth(runMonth: MonthEnum) {
    return this.formatLookup(MonthEnum[runMonth]);
  }

  clearFilters() {
    this.dataSource.monthEndRunStatus = null;
    this.dataSource.runMonth = null;
    this.dataSource.runYear = null;
    this.resetFiltersForm();
    this.getMonthEndDates();
  }

  resetFiltersForm() {
    this.filterForm.patchValue(
      {
        runYearId: null,
        runMonthId: null,
        runStatusId: null
      });
  }

  getRunStatus(runStatus: MonthEndRunStatusEnum) {
    return this.formatLookup(MonthEndRunStatusEnum[runStatus]);
  }

  filterMenu(item: MonthEndDates) {
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
      {
        title: 'Edit', action: 'edit', disable: (item.monthEndRunStatus == MonthEndRunStatusEnum.ProcessingPayments || item.monthEndRunStatus == MonthEndRunStatusEnum.PaymentsProcessed
                                                  || item.monthEndRunStatus == MonthEndRunStatusEnum.PaymentsFailed)
      }
      ];
  }

  onMenuItemClick(item: MonthEndDates, menuAction: string): void {
    switch (menuAction) {
      case 'view':
        this.router.navigate([`/penscare/month-end/view-monthend-rundates/${item.monthEndRunDateId}`]);
        break;
      case 'edit':
        this.onEdit(item);
        break;
      default:
        break;
    }
  }
}
