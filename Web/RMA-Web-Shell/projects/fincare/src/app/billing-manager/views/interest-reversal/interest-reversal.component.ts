import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { tap } from 'rxjs/operators';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { Statement } from '../../../shared/models/statement';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { TransactionsService } from '../../services/transactions.service';
import { ReverseConfirmationComponent } from './reverse-confirmation/reverse-confirmation.component';
import { InterestReversal } from '../../models/interest-reversal';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BehaviorSubject } from 'rxjs';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';


@Component({
  selector: 'app-interest-reversal',
  templateUrl: './interest-reversal.component.html',
  styleUrls: ['./interest-reversal.component.css']
})
export class InterestReversalComponent {
  isLoading = false;
  displayedColumns = ['transactionType', 'documentNumber', 'description', 'transactionDate', 'amount', 'balance', 'period', 'actions'];
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
  hasCreateReversalPermission = false;
  isAuthorized = false;
  isRefreshing = false;
  sourceEqualsDestination = false;
  searchFailedMessage = '';
  message: string;
  selectedPeriodStatus: PeriodStatusEnum;
  backLink = '/fincare/billing-manager';
  selectedTransactions: Statement[] = [];
  wizardinProgress = false;
  isSubmitting$ = new BehaviorSubject(false);

  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly invoiceService: InvoiceService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog,
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly wizardService: WizardService,
  ) {

  }

  ngOnInit() {
    this.hasCreateReversalPermission = userUtility.hasPermission('Create Interest Reversal');
    this.isAuthorized = this.hasCreateReversalPermission;
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      reason: [null]
    });
  }

  getTransactionByRolePlayer() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.transactionService.getDebtorInterestTransactionHistory(this.rolePlayerId).pipe(tap(data => {
      this.transactions = [...data];
      this.datasource.data = [...data];
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
      this.selectedTransactions.push(item);
    } else {
      this.unTickItem(item.transactionId);
    }
    this.canShowSubmit();
  }

  canShowSubmit() {
    if (this.selectedTransactionIds.length > 0) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.selectedTransactionIds.length; i++) {
      if ((this.selectedTransactionIds[i] === itemId)) {
        this.selectedTransactionIds.splice(i, 1);
        const itemIndex = this.selectedTransactions.findIndex(c => c.transactionId === itemId);
        this.selectedTransactions.splice(itemIndex, 1);
        break;
      }
    }
  }

  submitReversals() {
    this.showSubmit = false;
    this.verifyNoExistingWizards()
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
      this.transactions = [...data];
      this.datasource.data = [...data];
      if (data.length === 0) {
        this.searchFailedMessage = 'No transactions found to reverse';
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

  createCreditNote() {
    this.router.navigateByUrl(`${this.backLink}/credit-note-find-account/${this.debtorSearchResult.finPayeNumber}/${this.debtorSearchResult.roleplayerId}/INT`);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ReverseConfirmationComponent,{width: '50%', height:'auto' , disableClose: true});
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.submitReversals();
      }
    });
  }

  verifyNoExistingWizards() {
    this.isSubmitting$.next(true);
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayerId, 'interest-reversal')
      .subscribe(data => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.wizardinProgress = true;
            this.isSubmitting$.next(false);
          } else {
            this.wizardinProgress = false;
            const startWizardRequest = new StartWizardRequest();
            this.instantiateInterestReversalWizard(startWizardRequest, this.rolePlayerId);
            this.createWizard(startWizardRequest);
          }
        } else {
          this.wizardinProgress = false;
          const startWizardRequest = new StartWizardRequest();
          this.instantiateInterestReversalWizard(startWizardRequest, this.rolePlayerId);
          this.createWizard(startWizardRequest);
        }
      }
      );
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe((data: Wizard) => {
      this.router.navigateByUrl(`${this.backLink}/interest-reversal/continue/${data.id}`);
      this.toastr.successToastr('Interest reversal task has created successfully.', '', true);
      this.isSubmitting$.next(false);
    });
  }

  instantiateInterestReversalWizard(startWizardRequest: StartWizardRequest, policyId: number) {
    const interestReversal = new InterestReversal();
    startWizardRequest.type = 'interest-reversal';
    interestReversal.rolePlayerId = this.rolePlayerId;
    interestReversal.transactions = this.selectedTransactions;
    interestReversal.displayName = this.debtorSearchResult.displayName;
    interestReversal.finPayeeNumber = this.debtorSearchResult.finPayeNumber;
    interestReversal.note = new Note();
    if (this.form.get('reason').value) {
      interestReversal.note.text = this.form.get('reason').value;
    }
    else {
      interestReversal.note.text = '';
    }
    startWizardRequest.linkedItemId = this.rolePlayerId;
    startWizardRequest.data = JSON.stringify(interestReversal);
  }

  goToTasks() {
    this.router.navigateByUrl(this.backLink);
  }
}
