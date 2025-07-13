import { PaymentEstimatesDatasource } from './payment-estimates.datasource';
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Constants } from 'projects/fincare/src/app/payment-manager/models/constants';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';

@Component({
  selector: 'payment-daily-estimates',
  templateUrl: './payment-daily-estimates.component.html',
  styleUrls: ['./payment-daily-estimates.component.css']
})
export class PaymentDailyEstimatesComponent implements OnInit {

  // isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PaymentEstimatesDatasource;


  form: UntypedFormGroup;
  maxDate: Date;

  // Setting up the Datagrid columns
  public displayedColumns = [
    'date',
    'paymentType',
    'product',
    'senderAccountNo',
    'totalAmount',
    'noOfPayee',
    'noOfTransactions'
  ];

  constructor(
    private readonly paymentService: PaymentService,
    private readonly formBuilder: UntypedFormBuilder,
    public datePipe: DatePipe) {
      this.createForm();
  }
  
  ngOnInit(): void {
    this.dataSource = new PaymentEstimatesDatasource(this.paymentService);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0); 
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.getData();
  }

  createForm(): void {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    this.maxDate = endDate;
    this.form = this.formBuilder.group({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate)
    });
  }

  // Setting the data for datagrid
  getData() {
    // this.dataSource.setControls(this.paginator, this.sort);
    let requestParams = { 
      startDate: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
      endDate: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString),
      page: this.paginator.pageIndex + 1,
      pageSize:  this.paginator.pageSize ? this.paginator.pageSize : 5,
      orderBy: this.sort.active && this.sort.active !== undefined ? this.sort.active : 'PaymentType',//(this.sort.active === 'id') ? 'PaymentType' : this.sort.active ,
      sortDirection: this.sort.direction ? this.sort.direction : 'asc'
    };
    this.dataSource.setData(requestParams);
  }
}
