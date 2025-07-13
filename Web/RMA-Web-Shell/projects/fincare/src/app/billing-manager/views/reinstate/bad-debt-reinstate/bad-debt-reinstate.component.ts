import { Statement } from 'projects/fincare/src/app/shared/models/statement';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { tap } from 'rxjs/operators';
import { TransactionsService } from '../../../services/transactions.service';
import { ReinstateReasonEnum } from 'projects/fincare/src/app/shared/enum/reinstate-reason-enum';
import {DebtReinstateReasonEnum} from 'projects/fincare/src/app/shared/enum/debt-reinstate-reason.enum';
import { BadDebtReinstate } from '../../../models/bad-debt-reinstate';
import { BadDebtReinstateRequest } from '../../../models/bad-debt-reinstate-request';
import { ConfirmReinstateComponent } from '../confirm-reinstate/confirm-reinstate.component';
import { ReinstateType } from 'projects/shared-models-lib/src/lib/enums/reinstate-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PolicyProductCategory } from '../../../models/policy-product-category';


@Component({
  selector: 'app-bad-debt-reinstate',
  templateUrl: './bad-debt-reinstate.component.html',
  styleUrls: ['./bad-debt-reinstate.component.css']
})
export class BadDebtReinstateComponent implements OnInit, AfterViewInit {
  isLoading = false;

  displayedColumnsTransactions = ['documentNumber', 'transactionDate', 'amount', 'balance', 'actions'];

  currentQuery: string;
 
  datasourceBadDebtsWrittenOff = new MatTableDataSource<Statement>();
  datasourcePolicies = new MatTableDataSource<RolePlayerPolicy>();
  form: UntypedFormGroup;

  @ViewChild('paginatorInvoices', { static: false }) paginatorInvoices: MatPaginator;
  @ViewChild('paginatorInterest', { static: false }) paginatorInterest: MatPaginator;
  @ViewChild('paginatorPolicies', { static: false }) paginatorPolicies: MatPaginator;
  rowCount: number;
  transactiontypeText: string;
  rolePlayerId = 0;
  rolePlayerName = '';
  isSubmitting: boolean;
  panelOpenState = true;
  policyNumber = '';
  accountSearchResult: DebtorSearchResult;
  hideToDebtorDetails = true;
  debtorSearchResult: DebtorSearchResult;
  isAuthorized = false;
  isRefreshing = false;
  searchFailedMessage = '';
  message: string;
  backLink = '/fincare/billing-manager';
  periodStatus: PeriodStatusEnum;
  selectedReinstates: BadDebtReinstate[] = [];
  reinstateType: ReinstateType;
  public interestReinstateType = ReinstateType.Interest;
  public interestPlusPremiumReinstateType = ReinstateType.InterestPlusPremium;
  public premiumReinstateType = ReinstateType.Premium;
  statements: Statement[] = [];
  reinstateReasons: { id: number, name: string }[];
  selectedReasonId: number = 0;

  selectedBabDebtWrittenOffTransactionIds: number[] = [];
  selectedPolicyIds: number[] = [];

  transactionsSearched = false;
  selectedBabDebtWrittenOffTransactions: Statement[] = [];
  isLoadingPolicies = false;
  showGetTransactions = false;
  hasCreateBadDebtReintstatePermission = false;
  periodIsValid = false;
  selectedPeriodStatus: PeriodStatusEnum;
  periodTitle ='Period To Post To'; 
  showPeriodControl= true;
  errors: any;

  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly roleplayerPolicyService: RolePlayerPolicyService,
  ) { }

  ngOnInit() {
    this.hasCreateBadDebtReintstatePermission = userUtility.hasPermission('Create Bad Debt Reintstate');
    this.isAuthorized = this.hasCreateBadDebtReintstatePermission;
    this.form = this.formBuilder.group({
      reinstateType: [{ value: null }, Validators.required],
      reinstateReason: [{ value: null }, Validators.required]
    });
    this.reinstateReasons = this.ToKeyValuePair(ReinstateReasonEnum);
    this.selectedReasonId = ReinstateReasonEnum.PremiumReinstate;
  }

  ngAfterViewInit() {
    this.datasourceBadDebtsWrittenOff.paginator = this.paginatorInvoices;
  }

  submitReinstates() {
    this.isSubmitting = true;
    let reinstateRequest = new BadDebtReinstateRequest();
    if (this.selectedBabDebtWrittenOffTransactions.length > 0) {
      this.statements = this.statements.concat([...this.selectedBabDebtWrittenOffTransactions]);
    }

    this.statements.forEach(item => {
      let reinstate = new BadDebtReinstate();
      reinstate.amount = item.amount;
      reinstate.transactionId = item.transactionId;
      reinstate.invoiceId = item.invoiceId;
      reinstate.description = item.description;
      reinstate.documentNumber = item.documentNumber;
      reinstate.transactionType = TransactionTypeEnum.CreditNote;
      this.selectedReinstates.push(reinstate);
    }
    );

    reinstateRequest.roleplayerId = this.rolePlayerId;
    reinstateRequest.reason = DebtReinstateReasonEnum.MovementOnAccount;
    reinstateRequest.badDebtReinstates = this.selectedReinstates;
    reinstateRequest.period = this.selectedPeriodStatus;
    this.errors = undefined;

    this.transactionService.reinstateBadDebt(reinstateRequest).subscribe(
     {
      next: (result) =>
        {
          if(result)
            {
              this.toastr.successToastr('Debt Reinstate was processed successfully.', '', true);
            }
            else
            {
              this.toastr.successToastr('Error. Debt Reinstate was not processed successfully.', '', true);
            }
        },
       error: (e)=>
        {
          this.toastr.errorToastr("Debt Reinstate Error :- " + e, "Error");
          this.errors = e;
        }, 
      complete: ()=>
        {
          if(!this.errors)
            {
              this.router.navigateByUrl(this.backLink);
            }
        }
     }
    );
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.isRefreshing = false;
    this.getRoleplayerPolicies();
  }

  getWrittenOffBadDebtTransactions()
  {
    this.isLoading = true;
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.transactionService.getTransactionsWrittenOffByRolePlayer(this.rolePlayerId, this.selectedPolicyIds).pipe(tap(data => {
      this.datasourceBadDebtsWrittenOff.data = [...data];
      [...this.datasourceBadDebtsWrittenOff.data].forEach(element => {
        this.selectedBabDebtWrittenOffTransactionIds.push(element.transactionId);
        this.selectedBabDebtWrittenOffTransactions.push(element);
      });
      if (data.length === 0) {
        this.searchFailedMessage = 'No bad debt written off transactions found to reinstate';
      }
      this.isLoading = false;
    }
    )).subscribe();
  }



  getRoleplayerPolicies() {
    this.isLoadingPolicies = true;
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.selectedPolicyIds = [];
    this.roleplayerPolicyService.getPoliciesByPolicyPayeeIdNoRefData(this.rolePlayerId).pipe(tap(data => {
      this.datasourcePolicies.data = [...data];
      [...this.datasourcePolicies.data].forEach(element => {
        this.selectedPolicyIds.push(element.policyId);
      });
      if (data.length === 0) {
        this.searchFailedMessage = 'No policies found';
        this.showGetTransactions = false;
      }
      else
      {
        this.canShowTransactions();
      }
      this.isLoadingPolicies = false;
    }
    )).subscribe();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmReinstateComponent, {width: '50%', data: { writeoffType: this.reinstateType } , disableClose: true});
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        if (data.confirmation === true) {
          this.submitReinstates();
        }
      }
    });
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }


  getTransactionsTotals(): number {
    const total = this.datasourceBadDebtsWrittenOff.data.reduce((a, b) => a + b.amount, 0).toFixed(2);
    return +total;
  }

  reinstateReasonChanged() {
    if (!this.transactionsSearched) {
      this.getTransactions();
    }
  }

  transactionChecked(event: any, item: Statement) {
    if (event.checked) {
      this.selectedBabDebtWrittenOffTransactionIds.push(item.transactionId);
      this.selectedBabDebtWrittenOffTransactions.push(item);
    } else {
      this.unTickTransaction(item.transactionId);
    }
  }

  canSubmit(): boolean
  {
   return ((this.selectedBabDebtWrittenOffTransactionIds.length) > 0 && this.selectedReasonId != 0  && !this.isSubmitting );
  }

  unTickTransaction(itemId: number) {
    for (let i = 0; i < this.selectedBabDebtWrittenOffTransactionIds.length; i++) {
      if ((this.selectedBabDebtWrittenOffTransactionIds[i] === itemId)) {
        this.selectedBabDebtWrittenOffTransactionIds.splice(i, 1);
        const itemIndex = this.selectedBabDebtWrittenOffTransactions.findIndex(c => c.transactionId === itemId);
        this.selectedBabDebtWrittenOffTransactions.splice(itemIndex, 1);
        break;
      }
    }
  }

  transactionAllChecked(event: any) {
    if (event.checked) {
      this.selectedBabDebtWrittenOffTransactionIds = [];
      [...this.datasourceBadDebtsWrittenOff.data].forEach(element => {
        this.selectedBabDebtWrittenOffTransactionIds.push(element.transactionId);
        this.selectedBabDebtWrittenOffTransactions.push(element);
      });

    } else {
      this.selectedBabDebtWrittenOffTransactionIds = [];
      this.selectedBabDebtWrittenOffTransactions = [];
    }
  }

  getTransactions() {
    this.transactionsSearched = true;

    this.getWrittenOffBadDebtTransactions();

    this.showGetTransactions = false;
  }



  getReinstateReasonEnumDescription(enumValue: number) {
    let result = '';
    if (this.reinstateReasons.filter(c => c.id == enumValue)[0].name) {
      result = this.formatLookup(this.reinstateReasons.filter(c => c.id == enumValue)[0].name)
    }
    return result;
  }

  resetForm() {
    this.form.get('reinstateReason').setValue(null);
    this.datasourceBadDebtsWrittenOff.data = [];
    this.datasourcePolicies.data = [];
    this.showGetTransactions = false;
    this.selectedBabDebtWrittenOffTransactionIds = [];
    this.selectedBabDebtWrittenOffTransactions = [];
    this.selectedPolicyIds = [];

    this.transactionsSearched = false;
  }
  
  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }
  
  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [];
    policies.forEach(c => this.selectedPolicyIds.push(c.policyId));
    this.canShowTransactions();
  }

  canShowTransactions(){    
    if (this.selectedPolicyIds.length === 0) {    
      this.showGetTransactions = false;
    }
    else {
      this.showGetTransactions = true;
    }
  }
}
