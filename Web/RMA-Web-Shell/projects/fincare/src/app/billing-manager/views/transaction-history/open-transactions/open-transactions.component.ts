import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BillingService } from '../../../services/billing.service';
import { TransactionsService } from '../../../services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DebtorOpenTransactionsRequest } from 'projects/fincare/src/app/shared/models/debtor-open-transactions-request';
import { BehaviorSubject, Subscription } from "rxjs";
import { Statement } from 'projects/fincare/src/app/shared/models/statement';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-open-transactions',
  templateUrl: './open-transactions.component.html',
  styleUrls: ['./open-transactions.component.css']
})
export class OpenTransactionsComponent implements OnInit, AfterViewInit {
  selectedTransactionType: TransactionTypeEnum = TransactionTypeEnum.All;
  dataSource= new MatTableDataSource<Statement>();
  transactionTypes: Lookup[] = [];
  placeHolder = 'Search by Document or Policy Number';
  displayedColumns = ['transactionType', 'policyNumber', 'documentNumber', 'description', 'documentDate', 'debitAmount', 'creditAmount', 'balance'];
  form: UntypedFormGroup;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { read: ElementRef, static: true }) filter: ElementRef;
  billingServiceSubscription: Subscription;
  roleplayerId = 0;
  isLoading$ = new BehaviorSubject(false);
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly transactionService: TransactionsService,
    private readonly lookUpService: LookupService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly rolePlayerService: RolePlayerService,
    public writeoffDialog: MatDialog,
    public reinstateBadDebtDialog: MatDialog,
    public reinstateInterestDialog: MatDialog, private readonly billingService: BillingService
  ) { }

  transactionStartDate: Date;
  transactionEndDate: Date;
  debtorNetBalance: number;

  getDebtorNetBalance(roleplayerId:number) : number {
    this.transactionService
      .getDebtorNetBalance(roleplayerId)
      .subscribe((debtorNetBalance) => {
        this.debtorNetBalance = debtorNetBalance;
      });

      return this.debtorNetBalance ? this.debtorNetBalance : 0;
  }

  getStartDate(): Date {
    return new Date(this.form.controls.transactionStartDate.value);
  }

  getEndDate(): Date {
    return new Date(this.form.controls.transactionEndDate.value);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy(): void {
    this.billingServiceSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.createForm();
    this.billingServiceSubscription = this.billingService.selectedRoleplayerId$.subscribe(data => {
      if (data) {       
        this.roleplayerId = data
      }
    });

    const searchRequest = new DebtorOpenTransactionsRequest();
    this.selectedTransactionType = TransactionTypeEnum.All;
    searchRequest.roleplayerId = this.roleplayerId;
    searchRequest.transactionStartDate = null;
    searchRequest.transactionEndDate = null;

    this.loadTransactionTypes();
    this.loadData(searchRequest);
  }

  createForm() {
    this.form = this.formBuilder.group({
      transactionType: [null],
      transactionStartDate: [{ value: null, disabled: false}],
      transactionEndDate: [{ value: null, disabled: false}],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      transactionStartDate: new Date().getCorrectUCTDate(),
      transactionEndDate: new Date().getCorrectUCTDate(),
    });
  }

  transactionTypeChanged($event: any) {
    this.selectedTransactionType = $event.value;
  }

  loadData(searchRequest: DebtorOpenTransactionsRequest): void {
    this.isLoading$.next(true);
    this.transactionService.getDebtorOpenTransactions(searchRequest.roleplayerId, searchRequest.transactionTypeId, searchRequest.policyIds, searchRequest.transactionStartDate, searchRequest.transactionEndDate)
    .subscribe(
      data=>{
        if(data){
          this.dataSource.data = [...data];        
        }
        this.isLoading$.next(false);
      },
      error=>{this.isLoading$.next(false);}    
      );
      this.debtorNetBalance = this.getDebtorNetBalance(searchRequest?.roleplayerId);
    }
  
  loadTransactionTypes(): void {
    this.lookUpService.getTransactionTypes().subscribe((data) => {
      this.transactionTypes = data;
    });
  }

  applyFilters(isReset: boolean = false): void {
    const searchRequest = new DebtorOpenTransactionsRequest();
    searchRequest.roleplayerId = this.roleplayerId;
    searchRequest.transactionStartDate = new Date(this.datePipe.transform(this.form.controls.transactionStartDate.value, 'yyyy-MM-dd')); 
    searchRequest.transactionEndDate = new Date(this.datePipe.transform(this.form.controls.transactionEndDate.value, 'yyyy-MM-dd')); 
    searchRequest.transactionTypeId = this.selectedTransactionType;

    if (isReset) {
      searchRequest.transactionStartDate = null;
      searchRequest.transactionEndDate = null;
    }

    this.loadData(searchRequest);
  }

  reset() {
    this.filter.nativeElement.value = '';
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
    this.selectedTransactionType = TransactionTypeEnum.All;

    this.applyFilters(true);
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  getTransactionTypeDescName(id: TransactionTypeEnum): string {    
    const result = TransactionTypeEnum[id];
    if (result) {
      return this.splitPascalCaseWord(result);
    }
    return '';
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  applyTextboxFiltering(filterValue: string) {
    filterValue = filterValue.trim(); 
    filterValue = filterValue.toLowerCase(); 
    this.dataSource.filter = filterValue;
  }

  public getDcoument(createdDate: Date, transactionDate:Date): Date {
    if(transactionDate > createdDate){
      return transactionDate;
    }
    else{
      return createdDate;
    }
  }
}
