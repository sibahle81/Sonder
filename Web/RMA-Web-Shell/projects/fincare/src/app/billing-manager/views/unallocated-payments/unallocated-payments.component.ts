import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { UnallocatedPayment } from '../../../shared/models/unallocated-payment';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { RmaBankAccount } from '../../models/rmaBankAccount';
import { InterBankTransferService } from '../../services/interbanktransfer.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { MatDialog } from '@angular/material/dialog';
import { UnallocatedPaymentDetailsDialogComponent } from './unallocated-payment-details-dialog/unallocated-payment-details-dialog.component';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';

@Component({
  selector: 'app-unallocated-payments',
  templateUrl: './unallocated-payments.component.html',
  styleUrls: ['./unallocated-payments.component.css']
})
export class UnallocatedPaymentsComponent implements OnInit {
  canExport: number;
  isLoading = false;
  isDownloading = false;
  isSearching = true;
  disableDateFilters = true;
  dateFilter: number;
  startDate: Date;
  endDate: Date;
  endMaxDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  searchQuery = '';
  loadingProducts = true;
  displayStartDate: Date;
  displayEndDate: Date;
  maxDate: Date;
  filteredPeriods: Period[] = [];
  periods: Period[] = [];
  allPeriods: Period[] = [];
  years: number[] = [];
  filteredYears: number[] = [];
  periodIds: string[] = [];

  placeHolder = 'Search by User Reference, UserReference2 or Statement Reference';
  displayedColumns = ['expand', 'bankAccountNumber', 'statementReference', 'userReference', 'userReference2', 'transactionDate', 'balance', 'originalAmount', 'action'];

  dateFilters = [
    { name: 'All', value: 0 },
      { name: 'Transaction', value: 1 },
      { name: 'Processed', value: 2 },
      { name: 'Received', value: 3 }
    ];

  sortBy: Sort = {active: 'bankAccountNumber', direction: 'asc' };
  form: UntypedFormGroup;

  pageSizeOptions: number[] = [5, 10, 25, 100];

  payments: PagedRequestResult<UnallocatedPayment> = {data: [], page: 0, pageCount: 0 , pageSize: 5, rowCount: 0 };

  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  rmaBankAccounts: RmaBankAccount[];
  products: Product[] = [];
  selectedBankAccountId: number;
  periodSelected: number;
  selectedBankAccount: RmaBankAccount;
  amountFormat = Constants.amountFormat;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { read: ElementRef, static: true }) filter: ElementRef;
  @Input() showExportButton = true;
  constructor(public datePipe: DatePipe,
              private readonly router: Router,
              private readonly toastr: ToastrManager,
              private readonly invoiceService: InvoiceService,
              private readonly interBankTransferService: InterBankTransferService,
              private readonly productService: ProductService,
              private readonly periodService: PeriodService,
              public dialog: MatDialog) {}

  ngOnInit() {
    const today = new Date();
    this.maxDate = today;
    this.createForm();
    this.getRmaBankAccounts();
    this.getProducts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => {
            this.searchQuery = this.filter.nativeElement.value;
            if (this.searchQuery.length >= 4) {
              this.isSearching = true;
              this.payments.page = 0;
              this.GetUnallocatedPaymentsPaged();
            }
            if (this.searchQuery.length === 0) {
              this.reset();
            }
          })
        ).subscribe();
    }, 1);
  }

  createForm(): void {
    const today  = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate.setDate(1);
    this.endDate = today;
    this.endMaxDate = today;
    this.endMinDate = this.startDate;
    this.startMaxDate = today;
    this.dateFilter = this.dateFilters[0].value;
    this.searchQuery = '1';

    this.form = new UntypedFormGroup({
      dateFilter: new UntypedFormControl(this.dateFilter),
      startDate: new UntypedFormControl({value: this.startDate, disabled : this.disableDateFilters}),
      endDate: new UntypedFormControl({value: this.endDate, disabled : this.disableDateFilters}),
      bankAccount: new UntypedFormControl([null])
    });  
  }

populateForm(): void {
  const today = new Date();
  const period = new Date(today.getFullYear(), today.getMonth(), 1);
  this.displayEndDate = new Date();
}

endDateChange() {
  const endDate = this.form.controls.endDate.value;
  this.startMaxDate = new Date(endDate);
}

startDateChange() {
  const startDate = this.form.controls.startDate.value;
  this.endMinDate = new Date(startDate);
}

GetUnallocatedPaymentsPaged() {
  this.isLoading = true;
  this.payments.data = [];
  this.payments.rowCount = 0;
  let bankAccNumber = '0';
  if (this.selectedBankAccount) {
    bankAccNumber = this.selectedBankAccount.accountNumber;
  }
  this.invoiceService.GetUnallocatedPaymentsPaged(this.dateFilter, this.startDate, this.endDate, bankAccNumber, this.payments.page+1, this.payments.pageSize, this.sortBy.active, this.sortBy.direction, this.searchQuery).subscribe(payments => {
    this.payments = payments;
    this.isLoading = false;
    this.isSearching = false;
  });
}

  handlePageEvent(event: PageEvent) {
    this.payments.page = event.pageIndex;
    this.payments.pageSize = event.pageSize;
    this.GetUnallocatedPaymentsPaged();
  }

  handleSortEvent(sort: Sort) {
    this.sortBy = sort;
    if (!sort.direction) {
      sort.direction = 'asc';
    }
    this.payments.page = 0;
    this.GetUnallocatedPaymentsPaged();
  }

  exportToCSV(): void {
    this.isDownloading = true;
    let bankAccNumber = '0';
    if (this.selectedBankAccount) {
      bankAccNumber = this.selectedBankAccount.accountNumber;
    }

    this.invoiceService.GetUnallocatedPayments(this.dateFilter, this.startDate, this.endDate, this.searchQuery, bankAccNumber).subscribe(payments => {
      const filteredData = payments.map(x => {
      const data = {
          ControlNumber: x.controlNumber,
          ControlName: x.controlName,
          BrNo: x.branchNumber,
          BrName: x.branchName,
          BankAccountNumber: x.bankAccountNumber,
          Balance: x.amount,
          OriginalAmount: x.originalAmount,
          HyphenDateProcessed: this.datePipe.transform(x.hyphenDateProcessed, 'yyyy-MM-dd'),
          HyphenDateReceived: this.datePipe.transform(x.hyphenDateReceived, 'yyyy-MM-dd'),
          StatementDate: this.datePipe.transform(x.statementDate, 'yyyy-MM-dd'),
          StatementReference: x.statementReference,
          Status: x.status,
          TransactionDate: this.datePipe.transform(x.transactionDate, 'yyyy-MM-dd'),
          UserReference: x.userReference,
          UserReference1: x.userReference1,
          UserReference2: x.userReference2,
          BankStatementEntryId: x.bankStatementEntryId,
        };
      return data;
    });

      const workSheet = XLSX.utils.json_to_sheet(filteredData, { header: [] });
      const workBook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
      XLSX.writeFile(workBook, 'UnallocatedPayments.xlsx');
      this.isDownloading = false;
      this.toastr.successToastr('Unallocated payments exported successfully');
  });
}

  onDateFilterChange() {
    this.disableDateFilters = this.form.controls.dateFilter.value === 0;
  }
  search() {
      this.isSearching = true;
      this.searchQuery = this.filter.nativeElement.value;
      this.payments.page = 0;
      this.GetUnallocatedPaymentsPaged();
  }

  applyFilter() {
      this.dateFilter = this.form.controls.dateFilter.value;
      this.startDate = this.form.controls.startDate.value;
      this.endDate = this.form.controls.endDate.value;
      this.payments.page = 0;
      this.GetUnallocatedPaymentsPaged();
  }

  reset() {
    this.payments.page = 0;
    this.searchQuery = '';
    this.filter.nativeElement.value = this.searchQuery;
    this.getRmaBankAccounts();
  }

  clear() {
    this.router.navigate(['fincare/billing-manager/']);
  }

  getRmaBankAccounts() {
    this.isLoadingBankAccounts$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaBankAccounts = results;
      this.form.get('bankAccount').setValue(0);
      this.isLoadingBankAccounts$.next(false);
      // this.GetUnallocatedPaymentsPaged();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingBankAccounts$.next(false); });
  }

  getProducts() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe((results) => {
      this.products = results;
      if (this.products.length > 0) {
        this.products.unshift({ id: 0, name: "All" } as Product);
      }
      this.loadingProducts = false;
    });
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.selectedBankAccountId = $event.value;
    if (this.selectedBankAccountId === 0) {
      this.selectedBankAccount = null;
    } else {
      this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
    }
  }
  
  showMoreInformation(item: UnallocatedPayment){
    const dialogRef = this.dialog.open(UnallocatedPaymentDetailsDialogComponent, {
      width: "60%",
      data: { item },
    });
  }

  chosenMonthHandler(selectedDate: any, datepicker: MatDatepicker<Date>) {
    datepicker.close();
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    this.setDateValues(year, month);
  }

  setDateValues(year: number, month: number): void {
    const today = new Date();
    const periodDate = new Date(year, month, 1);
    this.form.patchValue({
      period: periodDate,
      startDate: null,
      endDate: null,
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
  }
}
