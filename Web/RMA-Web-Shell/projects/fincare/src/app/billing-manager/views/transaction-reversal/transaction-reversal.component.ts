import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { SearchAccountResults } from 'projects/fincare/src/app/shared/models/search-account-results';
import { Statement } from 'projects/fincare/src/app/shared/models/statement';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { tap } from 'rxjs/operators';
import { SearchDebtorDialogComponent } from 'projects/fincare/src/app/billing-manager/views/search-debtor-dialog/search-debtor-dialog.component';
import { DebtorSearchResult } from 'projects/fincare/src/app/shared/models/debtor-search-result';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionsReversalRequest } from 'projects/fincare/src/app/billing-manager/models/transactions-reversal-request';
import { Location } from '@angular/common';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { BehaviorSubject } from 'rxjs';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';

@Component({
  selector: 'app-transaction-reversal',
  templateUrl: './transaction-reversal.component.html',
  styleUrls: ['./transaction-reversal.component.css']
})

export class TransactionReversalComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['transactionType', 'documentNumber', 'description', 'transactionDate', 'amount', 'balance', 'actions'];
  currentQuery: string;
  datasource = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  isCheckingBankAccountClass$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  rowCount: number;

  transactions: Statement[];
  selectedTransactionIds: number[] = [];
  transactiontypeText: string;
  showSubmit = false;
  rolePlayerId: number;
  rolePlayerName = '';
  isSubmitting: boolean;
  policies: RolePlayerPolicy[] = [];
  isLoadingPolicies: boolean;
  policyId: number;
  panelOpenState = true;
  policyNumber = '';
  hideClientDetails = true;
  accountSearchResult: DebtorSearchResult;
  hideToDebtorDetails = true;
  debtorSearchResult: DebtorSearchResult;
  hasCreateReversalPermission = false;
  isAuthorized = false;
  isRefreshing = false;
  sourceEqualsDestination = false;
  searchFailedMessage = '';
  crossAccountAllocation = false;
  fromAllocationBankAccountNumber: string;
  toAllocationBankAccountNumber: string;
  message: string;
  finPayeNumber :string;

  selectedPeriodStatus: PeriodStatusEnum;
  openPeriodsMap: Map<number, Period> = new Map<number, Period>();;
  backLink = '/fincare/billing-manager';


  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly invoiceService: InvoiceService,
    private toDebtorDialog: MatDialog,
    private location: Location,
    private readonly toastr: ToastrManager,
    private readonly roleplayerService: RolePlayerService, 
    private readonly periodService: PeriodService) { }

  ngOnInit() {
    this.hasCreateReversalPermission = userUtility.hasPermission('Create Payment Reversal');
    this.isAuthorized = this.hasCreateReversalPermission;

    if (this.isAuthorized) {
      this.createForm();
      this.getOpenPeriods();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      toDebtor: [{ value: '', disabled: true }]
    });
  }

  getOpenPeriods() {
    this.periodService.getPeriods().subscribe(periods => {
      let currentPeriods = periods.filter(s => s.status.toLocaleLowerCase() === 'current');
      let latestPeriods = periods.filter(s => s.status.toLocaleLowerCase() === 'latest');

      if(currentPeriods != undefined && currentPeriods.length > 0)
      {
          this.openPeriodsMap.set(PeriodStatusEnum.Current,currentPeriods[0] );
      }

      if(latestPeriods != undefined && latestPeriods.length > 0)
      {
          this.openPeriodsMap.set(PeriodStatusEnum.Latest,latestPeriods[0] );
      }
    });
  }

  getTransactionByRolePlayer() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.invoiceService.getStatementByRolePlayer(this.rolePlayerId).pipe(tap(data => {
      this.transactions = data;
      this.datasource.data = data;
      this.isLoading = false;
      this.hideClientDetails = false;
    }
    )).subscribe();
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  refundTransactionChecked(event: any, item: Statement) {
    if (event.checked) {
      this.selectedTransactionIds.push(item.transactionId);
    } else {
      this.unTickItem(item.transactionId);
    }
    this.canShowSubmit();
  }

  canShowSubmit() {
    if (this.selectedTransactionIds.length > 0  && !(this.crossAccountAllocation)) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.selectedTransactionIds.length; i++) {
      if ((this.selectedTransactionIds[i] === itemId)) {
        this.selectedTransactionIds.splice(i, 1);
        break;
      }
    }
  }

  validateSelectedTransactions(): boolean
  {
      let isValid = true;
      let selectedPeriod= this.openPeriodsMap.get(this.selectedPeriodStatus);

      if(selectedPeriod == undefined){return false;}
      
      var selectedTransactions =this.transactions.filter(x=> this.selectedTransactionIds.includes( x.transactionId ));

      for (let selectedTransaction of selectedTransactions) {
        if(selectedTransaction.periodId > selectedPeriod.id)
          {
            isValid = false;
            break;
          }
      }
     return isValid;
  }

  submitReversals() {

    this.message = '';
    if(!this.validateSelectedTransactions())
    {
      this.message = 'Selected transaction(s) should not be reversed in old period!';
      return;
    }

    this.showSubmit = false;
    const request = new TransactionsReversalRequest();
    request.transactionIds = this.selectedTransactionIds;
    request.periodStatus = this.selectedPeriodStatus;
    request.toRoleplayerId = 0;
    if (this.accountSearchResult) {
      if (this.accountSearchResult.roleplayerId) {
        request.toRoleplayerId = this.accountSearchResult.roleplayerId;
      }
    }

    this.isSubmitting = true;
    this.transactionService.createPaymentTransactionReversals(request).subscribe(result => {
    this.isSubmitting = false;
    this.toastr.successToastr('trasactions reversed successfully');
    this.router.navigate(['/fincare/billing-manager']);
    }); 
  }

  accountSearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.rolePlayerId = searchAccountResults.rolePlayerId;
    this.rolePlayerName = searchAccountResults.displayName;
    this.policyId = searchAccountResults.policyId;
    this.policyNumber = searchAccountResults.policyNumber;
    this.getTransactionByRolePlayer();

    this.roleplayerService.getFinPayee(this.rolePlayerId).subscribe(result => {
      if (result) {
        this.isCheckingBankAccountClass$.next(true);
        this.roleplayerService.GetDebtorIndustryClassBankAccountNumber(result.finPayeNumber).subscribe(accountNumber => {
          this.fromAllocationBankAccountNumber = accountNumber;
          this.isCheckingBankAccountClass$.next(false);
        }, error => { this.message = error.message; this.isCheckingBankAccountClass$.next(false); });
      }
    });
  }

  onCaptureToDebtor() {
    this.crossAccountAllocation = false;
    const dialog = this.toDebtorDialog.open(SearchDebtorDialogComponent, this.getToDebtorDialogConfig());
    dialog.afterClosed().subscribe((accountSearchResult: DebtorSearchResult) => {
      if (accountSearchResult) {
        if (accountSearchResult.roleplayerId != this.rolePlayerId) {
          this.isCheckingBankAccountClass$.next(true);
          this.roleplayerService.GetDebtorIndustryClassBankAccountNumber(accountSearchResult.finPayeNumber).subscribe(accountNumber => {
            this.toAllocationBankAccountNumber = accountNumber;
            if (this.fromAllocationBankAccountNumber != this.toAllocationBankAccountNumber) { // LEAVE SINGLE EQUALS
              this.crossAccountAllocation = true;
              this.message = 'Allocation across different classes is not allowed. From account number: (' + this.fromAllocationBankAccountNumber + ') --- To account number: (' + this.toAllocationBankAccountNumber + ')';
            }
            this.isCheckingBankAccountClass$.next(false);
          }, error => { this.message = error.message; this.isCheckingBankAccountClass$.next(false); });

        }
        this.accountSearchResult = accountSearchResult;
        this.form.patchValue({ toDebtor: accountSearchResult.displayName });
        this.hideToDebtorDetails = false;
        this.canShowSubmit();
      }
    });
  }

  getToDebtorDialogConfig(): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.width = '60%';
    return config;
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.isRefreshing = false;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.getTransactionByRolePlayerId();
    this.roleplayerService.GetDebtorIndustryClassBankAccountNumber(debtorSearchResult.finPayeNumber).subscribe(accountNumber => {
      this.fromAllocationBankAccountNumber = accountNumber;
      this.isCheckingBankAccountClass$.next(false);
    }, error => { this.message = error.message; this.isCheckingBankAccountClass$.next(false); });
  }

  getTransactionByRolePlayerId() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.invoiceService.getStatementForReversal(this.rolePlayerId).pipe(tap(data => {
      this.transactions = data;
      this.datasource.data = data;
      if (data.length === 0) {
        this.searchFailedMessage = 'No transactions found to reverse';
      }
      this.isLoading = false;
      this.hideClientDetails = false;
    }
    )).subscribe();
  }

  navigateBack() {
    this.location.back();
  }

  refreshData() {
    this.isRefreshing = true;
    this.selectedTransactionIds = [];
    this.canShowSubmit();
    this.getTransactionByRolePlayerId();
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }
}
