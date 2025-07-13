import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { RmaBankAccountTransaction } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccountTransaction';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { UnallocatedPayment } from 'projects/fincare/src/app/shared/models/unallocated-payment';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PremiumListingService } from '../../shared/Services/premium-listing.service';
import { DatePipe } from '@angular/common';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { HttpErrorResponse } from '@angular/common/http';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ManualPaymentAllocation } from 'projects/fincare/src/app/billing-manager/models/manualPaymentAllocation';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { CollectionsService } from 'projects/fincare/src/app/billing-manager/services/collections.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { AllocationSourceTypeEnum } from '../../shared/enums/allocation-source-type.enum';

@Component({
  selector: 'app-child-policy-allocation',
  templateUrl: './child-policy-allocation.component.html',
  styleUrls: ['./child-policy-allocation.component.css']
})
export class ChildPolicyAllocationComponent implements OnInit, AfterViewInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  disabled = false;

  errors: any[] = [];
  showDebtorSearch = true;
  showTransactionsSearch = false;
  rolePlayerId: number;
  isRefreshing: boolean;
  isLoading: boolean;
  searchFailedMessage = '';
  allocateToRolePlayerId: number;
  source: number;
  originalTransactionAmount: number;
  uploadHidden = true;

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingSubmittingAllocations$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  rmaBankAccounts: RmaBankAccount[];
  rmaBankAccountTransactions: RmaBankAccountTransaction;
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;
  selectedUnallocatedPaymentId = 0;
  transactionAmount = 0;
  statementReference = '';
  transactionDate = '';
  allocationSource: string;
  debtorSearchResult: DebtorSearchResult;
  displayedColumns = ['bankReference', 'amount', 'transactionDate', 'balance', 'unallocatedAmount', 'actions'];
  datasource = new MatTableDataSource<Transaction>();
  payments: PagedRequestResult<UnallocatedPayment> = { data: [], page: 0, pageCount: 0, pageSize: 5, rowCount: 0 };
  startDate: Date;
  endDate: Date;
  endMaxDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  searchQuery = '';
  transactionSelected = false;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  format: string;
  showReport = false;
  isDownloading = true;
  bankStatementEntryId: number;
  debtorName: string;
  selectedBankReference: string;
  selectedAmount: number;
  showLinkTransactionDetails = false;
  allocateToDebtorName: string;
  showParentAccountSearch = false;
  hideUpload = true;
  maxAllocatableAmount = 0;
  selectedPeriodStatus: PeriodStatusEnum;
  periodIsValid = false;
  showPeriodSearch = false;
  canSubmit = false;
  canReverse = false;
  backLink = '/clientcare/policy-manager';
  allocationAmountLabel = '';
  maxBalanceExceeded = false;
  fileIdentifier = '';
  selectedDebtorTransactionId = 0;
  allocationSourceType: AllocationSourceTypeEnum;
  linkedTransactionId = 0;
  fileId = 0;
  fileName = '';
  placeHolder = 'Search by User Reference, userReference2, Bank Account Number or Statement Reference';
  displayedColumnsUnallocated = ['bankAccountNumber', 'statementReference', 'userReference', 'userReference2', 'transactionDate',
    'hyphenDateProcessed', 'hyphenDateReceived', 'amount', 'action'];
  sortBy: Sort = { active: 'bankAccountNumber', direction: 'asc' };
  canAllocate = false;
  canViewReports = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;

  constructor(
    private readonly alertService: AlertService,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly toastr: ToastrManager,
    private readonly formbuilder: UntypedFormBuilder,
    private invoiceService: InvoiceService,
    private datePipe: DatePipe,
    private transactionService: TransactionsService,
    private readonly lookupService: LookupService,
    private readonly premiumListingService: PremiumListingService,
    private readonly collectionsService: CollectionsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.fileId = params.id ? +params.id : 0;
    });
    this.premiumListingService.getPremiumPaymentFile(this.fileId).subscribe(
      (data) => {
        if (data) {
          this.fileName = data.fileName;
        }
      }
    );
    this.createForm();
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.form.get('transactionAmount').valueChanges.pipe(debounceTime(200))
      .subscribe((amount: any) => {

        if (amount > this.maxAllocatableAmount) {
          this.form.get('transactionAmount').setErrors({ maxAmountExeeded: true });
          this.canSubmit = false;
          this.maxBalanceExceeded = true;
          this.hideUpload = true;
        } else {
          this.maxBalanceExceeded = false;
          this.canSubmit = true;
          this.hideUpload = false;
        }
      });
  }


  search() {
    if (this.selectedBankAccount) {
      const query = this.form.get('query').value as string;
      this.searchQuery = query;
      this.GetUnallocatedPaymentsPaged();
    } else {
      this.form.get('query').setErrors({ bankAccNotChosen: true });
    }
  }

  createForm() {
    this.form = this.formbuilder.group({
      bankAccount: [null, Validators.required],
      query: ['', [Validators.minLength(5), Validators.required]],
      transactionAmount: [null, Validators.required],
      startDate: [null],
      endDate: [null],
      source: [null]
    });

    const today = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate.setDate(1);
    this.endDate = today;
    this.endMaxDate = today;
    this.endMinDate = this.startDate;
    this.startMaxDate = today;
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.transactionAmount = 0;
    this.statementReference = '';
    this.transactionDate = '';
    this.rmaBankAccountTransactions = null;
    this.selectedBankAccountId = $event.value;
    this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
  }

  toggle($event: any) {
    this.allocationSourceType = +($event);
    this.errors = [];
    if (this.allocationSourceType === AllocationSourceTypeEnum.Debtor) {
      this.showDebtorSearch = true;
      this.showTransactionsSearch = false;
    }
    if (this.allocationSourceType === AllocationSourceTypeEnum.Suspense) {
      this.showTransactionsSearch = true;
      this.showDebtorSearch = false;
    }
    this.reset();
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.allocateToRolePlayerId = debtorSearchResult.roleplayerId;
    this.isRefreshing = false;
    this.debtorName = debtorSearchResult.displayName;
    this.getTransactionByRolePlayerId();
  }

  getTransactionByRolePlayerId() {
    this.isLoadingTransactions$.next(true);
    this.searchFailedMessage = '';
    this.transactionService.getPremiumAllocatedTransactionsByRoleplayer(this.rolePlayerId, TransactionTypeEnum.Payment, this.startDate, this.endDate)
      .pipe(tap(data => {
        if (data.length === 0) {
          this.searchFailedMessage = 'No payment allocated to invoices found for debtor with given search parameters';
          this.isLoadingTransactions$.next(false);
        } else {
          let results: Transaction[] = [];

          results = [...data].filter(c => c.balance > 0);
          results.forEach(c => c.unallocatedAmount = c.amount - c.balance)

          if (results.length === 0) {
            this.searchFailedMessage = 'No transactions found with alloctable balances found';
          } else {
            this.datasource.data = results;
            this.showDebtorSearch = false;
          }
          this.isLoadingTransactions$.next(false);
        }
      })
      ).subscribe();
  }

  GetUnallocatedPaymentsPaged() {
    this.isLoadingTransactions$.next(true);
    this.payments.data = [];
    this.payments.rowCount = 0;
    let bankAccNumber = '0';
    this.searchFailedMessage = '';
    if (this.selectedBankAccount) {
      bankAccNumber = this.selectedBankAccount.accountNumber;
    }
    this.invoiceService.GetUnallocatedPaymentsPaged(0, this.startDate, this.endDate, bankAccNumber, this.payments.page + 1, this.payments.pageSize, this.sortBy.active, this.sortBy.direction, this.searchQuery)
      .pipe(tap(data => {
        if (data.data.length === 0) {
          this.searchFailedMessage = 'No transactions found with given search parameters';
          this.isLoadingTransactions$.next(false);
        } else {
          let results: UnallocatedPayment[] = [];
          results = [...data.data].filter(item => item.amount !== 0);

          if (results.length === 0) {
            this.searchFailedMessage = 'No transactions with non zero amounts found';
          } else {
            this.payments.page = data.page;
            this.payments.pageCount = data.pageCount;
            this.payments.rowCount = data.rowCount;
            this.payments.data = results;
            this.showTransactionsSearch = false;
          }
          this.isLoadingTransactions$.next(false);
        }
      })).subscribe();
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

  endDateChange() {
    const endDate = this.form.controls.endDate.value;
    this.startMaxDate = new Date(endDate);
    this.endDate = endDate;
  }

  startDateChange() {
    const startDate = this.form.controls.startDate.value;
    this.endMinDate = new Date(startDate);
    this.startDate = startDate;
  }

  onUnallocatedSelect(row: UnallocatedPayment) {
    this.transactionSelected = true;
    this.bankStatementEntryId = row.bankStatementEntryId;
    this.transactionAmount = row.amount;
    this.selectedBankReference = row.statementReference;
    this.statementReference = row.statementReference;
    this.transactionDate = row.transactionDate.toString().replace('T00:00:00', '');
    this.showLinkTransactionDetails = true;
    this.showParentAccountSearch = true;
    this.maxAllocatableAmount = row.amount;
    this.selectedUnallocatedPaymentId = row.unallocatedPaymentId;
    this.allocationAmountLabel = 'Allocation Amount';
    this.form.get('transactionAmount').enable();
    if (this.transactionAmount <= 0) {
      this.form.get('transactionAmount').setErrors({ maxAmountLessZero: true });
      this.canSubmit = false;
      this.hideUpload = true;
      this.form.get('transactionAmount').markAsTouched();
    }
    else {
      this.canAllocate = true;
    }

  }

  canSelect(row: Transaction) {
    if (row.amount !== row.balance)
      return true;
    else
      return false;
  }

  onDebtorTransactionSelect(row: Transaction) {
    this.originalTransactionAmount = row.amount;
    this.selectedDebtorTransactionId = row.transactionId;
    this.transactionSelected = true;
    this.bankStatementEntryId = row.bankStatementEntryId;
    this.transactionAmount = row.balance;
    this.selectedBankReference = row.rmaReference;
    this.transactionDate = row.transactionDate.toString().replace('T00:00:00', '');
    this.showLinkTransactionDetails = true;
    this.maxAllocatableAmount = row.balance;
    this.allocationAmountLabel = 'Allocatable (Balance) Amount';
    this.form.get('transactionAmount').disable();
    if (this.transactionAmount <= 0) {
      this.form.get('transactionAmount').setErrors({ maxAmountLessZero: true });
      this.canSubmit = false;
      this.hideUpload = true;
      this.form.get('transactionAmount').markAsTouched();
    }
    else {
      this.canAllocate = true;
    }
  }

  save(): void {
    this.uploadControlComponent.isUploading = true;

    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) {
      this.uploadControlComponent.isUploading = false;
      this.toastr.errorToastr('No file selected');
      this.isLoadingSubmittingAllocations$.next(false);
      return;
    }
    this.isLoadingSubmittingAllocations$.next(true);
    this.allocateChildPolicies();
  }

  onAllocateToDebtorSelected(debtorSearchResult: DebtorSearchResult) {
    this.allocateToRolePlayerId = debtorSearchResult.roleplayerId;
    this.allocateToDebtorName = debtorSearchResult.displayName;
    this.showParentAccountSearch = false;

    this.showPeriodSearch = true;
    if (this.maxBalanceExceeded || this.transactionAmount <= 0) {
      this.hideUpload = true;
      this.canSubmit = false;
    }
    else {
      this.hideUpload = false;
      this.canSubmit = true;
    }
  }

  allocateParentAccount() {
    const manualPaymentAllocation = new ManualPaymentAllocation();
    manualPaymentAllocation.unallocatedPaymentId = this.selectedUnallocatedPaymentId;
    manualPaymentAllocation.unallocatedTransactionId = this.selectedDebtorTransactionId;
    manualPaymentAllocation.allocatedAmount = this.form.get('transactionAmount').value as number;
    manualPaymentAllocation.allocationType = 'DBT';
    manualPaymentAllocation.reference = this.statementReference;
    manualPaymentAllocation.isClaimRecoveryPayment = false;
    manualPaymentAllocation.leaveBalanceInSuspenceAccount = true;
    manualPaymentAllocation.periodStatus = this.selectedPeriodStatus;
    manualPaymentAllocation.rolePlayerId = this.allocateToRolePlayerId;

    const manualPaymentAllocations: ManualPaymentAllocation[] = [];
    manualPaymentAllocations.push(manualPaymentAllocation);

    this.collectionsService.allocateParentPremiumPayments(manualPaymentAllocations, this.source).subscribe(data => {
      if (data > 0) {
        this.linkedTransactionId = data;
        this.allocateChildPolicies();
      } else {
        this.toastr.errorToastr('Payment allocation(s) Failed...');
        this.isLoadingSubmittingAllocations$.next(false);
      }
    }, error => { });
  }

  reverse() {
    this.premiumListingService.ReversePremiumPayments(this.linkedTransactionId).subscribe(
      () => {
        this.alertService.success('Premium payments allocation successfully reversed');
        this.uploadControlComponent.isUploading = false;
        this.canReverse = false;
        this.canSubmit = false;
      });
  }

  allocateChildPolicies() {
    if (this.allocateToRolePlayerId > 0 && this.source == +AllocationSourceTypeEnum.Debtor) {
      this.linkedTransactionId = this.selectedDebtorTransactionId;
    }
    const files = this.uploadControlComponent.getUploadedFiles();
    const total = files.length;
    let idx = 0;
    for (const file of files) {
      this.errors = [];
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        const fileContent = reader.result as string;
        const identifier = 'base64,';
        const index = fileContent.indexOf(identifier);
        if (index >= 0) {
          const premiumListingData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          // Select the first sheet and read the data
          const worksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
          const csvData = this.parseCsvFile(XLSX.utils.sheet_to_csv(worksheet));
          const data = encodeURIComponent(csvData);
          const content = { data: btoa(unescape(data)) };
          this.premiumListingService.UploadPremiumPaymentsWithFileLinking(content, file.name, this.linkedTransactionId).subscribe(
            (count) => {
              this.alertService.success(`${count}% of the file records successfully allocated`);
              this.uploadControlComponent.delete(file);
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
                this.canReverse = true;
                this.canSubmit = false;
              }
              this.isLoadingSubmittingAllocations$.next(false);
              if (count <= 99) {
                this.errors.push('Exceptions occured. Please validate file for full details');
              }
              else {
                this.router.navigateByUrl(this.backLink);
              }
            },
            (errorResponse: HttpErrorResponse) => {
              this.isLoadingSubmittingAllocations$.next(false);
              const errorMessage = errorResponse.error.Error as string;
              this.errors.push(errorMessage);
              if (errorMessage.substr(0, 10) === 'Validation') {
                this.fileIdentifier = errorMessage.substr(12);
              }
              this.refresh();
              this.uploadControlComponent.isUploading = false;
            }
          );
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
    this.showPeriodSearch = false;
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }

  reset() {
    this.form.get('startDate').reset();
    this.form.get('endDate').reset();
    this.form.get('transactionAmount').reset();
    this.form.get('bankAccount').reset();
    this.form.get('query').reset();

    this.showPeriodSearch = false;
    this.showParentAccountSearch = false;
    this.transactionSelected = false;
    this.datasource.data = [];
    this.payments.data = [];
    this.showLinkTransactionDetails = false;
    this.searchFailedMessage = '';
    this.allocateToDebtorName = '';
    this.debtorName = '';
    this.hideUpload = true;
    this.canSubmit = false;
    this.canReverse = false;
    const today = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate.setDate(1);
    this.endDate = today;
    this.endMaxDate = today;
    this.endMinDate = this.startDate;
    this.startMaxDate = today;
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  refresh() {
    this.form.reset();
    this.reset();
    this.showDebtorSearch = false;
    this.showTransactionsSearch = false;
  }
  viewExceptions() {
    this.router.navigate([`clientcare/policy-manager/file-exceptions/${this.fileIdentifier}`]);
  }

  parseCsvFile(csvData: string): string {
    const identifier = 'company,';
    const index = csvData.toLowerCase().indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substring(index);
      return result;
    }
    return '';
  }

  allocatePremiums() {
    this.isLoadingSubmittingAllocations$.next(true);
    this.linkedTransactionId = this.selectedDebtorTransactionId;
    this.form.get('transactionAmount').enable();
    const balance = this.form.get('transactionAmount').value;
    this.form.get('transactionAmount').disable();
    this.premiumListingService.allocatePremiumPayments(this.fileId, this.linkedTransactionId, balance).subscribe(
      (count) => {
        this.alertService.success(`${count} of the file records successfully allocated`);
        this.isLoadingSubmittingAllocations$.next(false);
        this.canAllocate = false;
        this.canViewReports = true;
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoadingSubmittingAllocations$.next(false);
        const errorMessage = errorResponse.error.Error as string;
        this.errors.push(errorMessage);
        this.refresh();
        this.isLoadingSubmittingAllocations$.next(false);
        this.canViewReports = true;
      });
  }

  reports() {
    this.router.navigate([`../../fincare/billing-manager/view-allocation-results/${this.fileId}`]);
  }

  getAllocatedAmount(originalAmount: number, balance: number) {
    {
      return originalAmount - balance;
    }
  }
}

