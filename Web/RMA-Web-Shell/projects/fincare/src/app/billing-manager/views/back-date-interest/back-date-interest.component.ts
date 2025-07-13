import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { tap } from 'rxjs/operators';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { Statement } from '../../../shared/models/statement';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { TransactionsService } from '../../services/transactions.service';
import { DialogBackdateConfirmationComponent } from './dialog-backdate-confirmation/dialog-backdate-confirmation.component';

@Component({
  selector: 'app-back-date-interest',
  templateUrl: './back-date-interest.component.html',
  styleUrls: ['./back-date-interest.component.css']
})
export class BackDateInterestComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['transactionType', 'documentNumber', 'description', 'transactionDate', 'amount', 'balance', 'actions'];
  currentQuery: string;
  datasource = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

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
  hasBackdateInterestPermission = false;
  isAuthorized = false;
  isRefreshing = false;
  sourceEqualsDestination = false;
  searchFailedMessage = '';
  crossAccountAllocation = false;
  fromAllocationBankAccountNumber: string;
  toAllocationBankAccountNumber: string;
  message: string;
  selectedPeriodStatus: PeriodStatusEnum;
  backLink = '/fincare/billing-manager';
  maxDate: Date;



  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly invoiceService: InvoiceService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.hasBackdateInterestPermission = userUtility.hasPermission('Create Backdated Interest');
    this.isAuthorized = this.hasBackdateInterestPermission;
    this.createForm();
  }

  createForm(): void {
    this.maxDate = new Date();

    this.form = this.formBuilder.group(
      {
        startDate: [this.maxDate]
      }
    );

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

  interestTransactionChecked(event: any, item: Statement) {
    if (event.checked) {
      this.selectedTransactionIds.push(item.transactionId);
    } else {
      this.unTickItem(item.transactionId);
    }
    this.canShowSubmit();
  }

  canShowSubmit() {
    if (this.selectedTransactionIds.length > 0 && !this.sourceEqualsDestination && !(this.crossAccountAllocation)) {
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

  submitBackdating() {
    this.showSubmit = false;
    this.isSubmitting = true;
    this.transactionService.backDateTransactions(this.selectedTransactionIds, this.form.get('startDate').value ).subscribe(result => {
      this.isSubmitting = false;
      this.toastr.successToastr('trasactions backdated successfully');
      this.router.navigate(['/fincare/billing-manager']);
    });
  }

  accountSearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.rolePlayerId = searchAccountResults.rolePlayerId;
    this.rolePlayerName = searchAccountResults.displayName;
    this.policyId = searchAccountResults.policyId;
    this.policyNumber = searchAccountResults.policyNumber;
    this.getTransactionByRolePlayer();
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.isRefreshing = false;
    this.getTransactionByRolePlayerId();
  }

  getTransactionByRolePlayerId() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.invoiceService.getStatementsForInterestReversals(this.rolePlayerId).pipe(tap(data => {
      this.transactions = data;
      this.datasource.data = data;
      if (data.length === 0) {
        this.searchFailedMessage = 'No interest transactions found to backdate';
      }
      this.isLoading = false;
      this.hideClientDetails = false;
    }
    )).subscribe();
  }

  refreshData() {
    this.isRefreshing = true;
    this.selectedTransactionIds = [];
    this.canShowSubmit();
    this.getTransactionByRolePlayerId();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogBackdateConfirmationComponent, { data: { newdate: this.form.get('startDate').value } });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.submitBackdating();
      }
    });
  }
}
