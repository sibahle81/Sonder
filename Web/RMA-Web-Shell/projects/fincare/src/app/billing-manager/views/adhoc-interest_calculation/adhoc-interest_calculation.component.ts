import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { map, tap } from 'rxjs/operators';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { Statement } from '../../../shared/models/statement';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { TransactionsService } from '../../services/transactions.service';
import { AdhocInterestMonthsDialogComponent } from '../adhoc-interest-months-dialog/adhoc-interest-months-dialog.component';
import { PendingInterestDate } from '../../models/pending-interest-date';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { TermArrangementService } from '../../../shared/services/term-arrangement.service';


@Component({
  selector: 'app-adhoc-interest_calculation',
  templateUrl: './adhoc-interest_calculation.component.html',
  styleUrls: ['./adhoc-interest_calculation.component.css']
})
export class AdhocInterestCalculationComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['transactionType', 'documentNumber', 'description', 'transactionDate', 'amount', 'balance', 'actions'];
  currentQuery: string;
  datasource = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  rowCount: number;

  transactions: Statement[];
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
  debtorSearchResult: DebtorSearchResult;
  isAuthorized = false;
  isRefreshing = false;
  searchFailedMessage = '';
  message: string;
  backLink = '/fincare/billing-manager';
  interestDates: Date[] = [];
  selectedTransactionId: number;
  hasCreateAdhocInterestPermission = false;

  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly termArrangementService: TermArrangementService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
    this.hasCreateAdhocInterestPermission = userUtility.hasPermission('Create Adhoc Interest');
    this.isAuthorized = this.hasCreateAdhocInterestPermission;
  }

  createForm(): void {
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  submitAdhocInterest() {
    this.showSubmit = false;
    this.isSubmitting = true;
    this.transactionService.createAdhocInterestForSpecifiedDates(this.selectedTransactionId, this.interestDates).subscribe(result => {
      this.isSubmitting = false;
      this.toastr.successToastr('Adhoc Interest successfully created');
      this.router.navigate(['/fincare/billing-manager']);
    });
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.isRefreshing = false;
    if (debtorSearchResult.industryClass.toLowerCase() === IndustryClassEnum[+IndustryClassEnum.Metals].toLowerCase()) {
      this.getActiveArrangementsByRoleplayer();
    }
    else {
      this.searchFailedMessage = 'Cannot create adhoc interest for non metal class';
    }
  }

  getTransactionByRolePlayerId() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.datasource.data = [];
    this.transactionService.getDebtorInvoiceTransactionHistoryForAdhocInterest(this.rolePlayerId).pipe(tap(data => {
      this.transactions = [...data];
      this.datasource.data = [...data];;
      if (data.length === 0) {
        this.searchFailedMessage = 'No overdue invoices pending interest found';
      }
      this.isLoading = false;
      this.hideClientDetails = false;
    }
    )).subscribe();
  }

  refreshData() {
    this.isRefreshing = true;
    this.getTransactionByRolePlayerId();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  openDialog(item: Statement): void {
    this.selectedTransactionId = item.transactionId;
    const dialogRef = this.dialog.open(AdhocInterestMonthsDialogComponent, { width: '50%', height: 'auto', data: { transactionId: this.selectedTransactionId } , disableClose: true});
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.interestDates) {
          const datesArray = [...result.interestDates] as PendingInterestDate[];
          datesArray.forEach(d => this.interestDates.push(d.pendingDate));
          this.submitAdhocInterest();
        }
      }
    });
  }

  getActiveArrangementsByRoleplayer() {

    this.termArrangementService.getActiveArrangementsByRoleplayer(this.rolePlayerId, 0).pipe(tap(data => {
      if (data.length === 0) {
        this.getTransactionByRolePlayerId();
      }
      else {
        this.searchFailedMessage = 'Client has an active term arrangement in place. Cannot create adhoc interest';
      }
    })).subscribe()
  }
}