import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { UnallocatedPayment } from 'projects/fincare/src/app/shared/models/unallocated-payment';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { RmaBankAccount } from 'projects/fincare/src/app/shared/models/rmaBankAccount';
import { InterBankTransferService } from 'projects/fincare/src/app/shared/services/interbanktransfer.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';

@Component({
  selector: 'app-unallocated-payments',
  templateUrl: './unallocated-payments.component.html',
  styleUrls: ['./unallocated-payments.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
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

  placeHolder = 'Search by User Reference, userReference2, Bank Account Number or Statement Reference';
  displayedColumns = ['expand', 'bankAccountNumber', 'statementReference', 'userReference', 'userReference2', 'transactionDate', 'amount', 'action'];

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
  selectedBankAccountId: number;
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
              private readonly interBankTransferService: InterBankTransferService) {}

  ngOnInit() {
    this.createForm();
    this.getRmaBankAccounts();
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
    this.searchQuery = '';

    this.form = new UntypedFormGroup({
      dateFilter: new UntypedFormControl(this.dateFilter),
      startDate: new UntypedFormControl({value: this.startDate, disabled : this.disableDateFilters}),
      endDate: new UntypedFormControl({value: this.endDate, disabled : this.disableDateFilters}),
      bankAccount: new UntypedFormControl([null]),
    });  }
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
    this.invoiceService
        .GetUnallocatedPaymentsPaged(this.dateFilter, this.startDate, this.endDate, bankAccNumber, this.payments.page+1, this.payments.pageSize, this.sortBy.active, this.sortBy.direction, this.searchQuery).subscribe(payments => {
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
          BankAccountNumber: x.bankAccountNumber,
          Amount: x.amount,
          HyphenDateProcessed: this.datePipe.transform(x.hyphenDateProcessed, 'yyyy-MM-dd'),
          HyphenDateReceived: this.datePipe.transform(x.hyphenDateReceived, 'yyyy-MM-dd'),
          StatementDate: this.datePipe.transform(x.statementDate, 'yyyy-MM-dd'),
          StatementReference: x.statementReference,
          Status: x.status,
          TransactionDate: this.datePipe.transform(x.transactionDate, 'yyyy-MM-dd'),
          UserReference: x.userReference,
          UserReference1: x.userReference1,
          UserReference2: x.userReference2,
          BankStatementEntryId: x.bankStatementEntryId
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
      this.GetUnallocatedPaymentsPaged();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingBankAccounts$.next(false); });
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.selectedBankAccountId = $event.value;
    if (this.selectedBankAccountId === 0) {
      this.selectedBankAccount = null;
    } else {
      this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
    }
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }
}
