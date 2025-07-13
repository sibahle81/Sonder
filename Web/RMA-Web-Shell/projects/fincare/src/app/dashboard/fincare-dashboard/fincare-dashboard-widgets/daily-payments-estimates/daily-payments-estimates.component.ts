import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DailyPaymentEstimatesDatasource } from './daily-payments-estimates.datasource';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Constants } from 'projects/fincare/src/app/payment-manager/models/constants';

@Component({
  selector: 'app-daily-payments-estimates',
  templateUrl: './daily-payments-estimates.component.html',
  styleUrls: ['./daily-payments-estimates.component.css']
})
export class DailyPaymentsEstimatesComponent implements OnInit {
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  private paginator: MatPaginator;
  private sort: MatSort;
  hasData = false;
  currentTime: string;
  displayTime: string;
  minDate: Date;
  fromDate: Date;
  toDate: Date;
  isToDateSelected = false;
  isToDateGroupSelected = false;
  form: UntypedFormGroup;
  maxDate: Date;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild('filter', { static: false }) filter: ElementRef;

  // Setting up the Datagrid columns
  public displayedColumns = [
    'transactionDate',
    'paymentTypeDesc',
    'accountNumber',
    'amount',
    'noOfPayee',
    'noOfTransactions'
  ];

  constructor(
    public readonly dataSource: DailyPaymentEstimatesDatasource,
    private readonly formBuilder: UntypedFormBuilder,
    public datePipe: DatePipe) {
  }

  ngOnInit() {
    this.createForm();
    this.dataSource.isLoading = true;
    this.getDataValues();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl('')
    });

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    this.form.patchValue({
      endDate: endDate,
      startDate: startDate
    });
  }

  getDataValues() {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    let requestParams = { 
      startDate: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
      endDate: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString)
    };
    this.dataSource.getData(requestParams);
    console.log(this.dataSource.data);
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.paginator && this.sort) {
      this.dataSource.setControls(this.paginator, this.sort);
    }
  }
  
  applyFilters() {
    this.getDataValues();
  }
}
