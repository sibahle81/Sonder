import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AdjustmentDirection } from '../../../shared/enum/adjustment-direction.enum';
import { Statement } from '../../../shared/models/statement';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { tap } from 'rxjs/operators';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { TransactionsService } from '../../services/transactions.service';
import { AdjustmentAmountDialogComponent } from '../adjustment-amount-dialog/adjustment-amount-dialog.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { InterestAdjustment } from '../../models/interest-adjustment';

@Component({
  selector: 'app-interest-adjustment',
  templateUrl: './interest-adjustment.component.html',
  styleUrls: ['./interest-adjustment.component.css']
})
export class InterestAdjustmentComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['description','documentNumber', 'transactionDate', 'amount', 'balance', 'period', 'actionDown', 'actionUp'];
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
  selectedTransactionId: number;
  adjustmentDirection: AdjustmentDirection
  adjustmentAmount: number;
  periodStatus: PeriodStatusEnum;
  hasCreateAdustmentPermission = false;
  selectedTransaction: Statement;

  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly invoiceService: InvoiceService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog, private readonly wizardService: WizardService) { }

  ngOnInit() {
    this.hasCreateAdustmentPermission = userUtility.hasPermission('Create Interest Adjustment');
    this.isAuthorized = this.hasCreateAdustmentPermission;
  }

  getTransactionByRolePlayer() {
    this.isLoading = true;
    this.panelOpenState = false;
    this.invoiceService.getStatementByRolePlayer(this.rolePlayerId).pipe(tap(data => {
      this.transactions = data;
      this.datasource.data = data;
      this.isLoading = false;
    }
    )).subscribe();
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }


  submitUpwardAdjustment(amount: number) {
    this.showSubmit = false;
    this.isSubmitting = true;
    const startWizardRequest = new StartWizardRequest();
    this.instantiateInterestAdjustmentWizard(startWizardRequest, amount, true);   
    this.createWizard(startWizardRequest); 
  }

  submitDownwardAdjustment(amount: number) {
    this.showSubmit = false;
    this.isSubmitting = true;
    const startWizardRequest = new StartWizardRequest();
    this.instantiateInterestAdjustmentWizard(startWizardRequest, amount, false);  
    this.createWizard(startWizardRequest); 
  }


  submitOpenPeriodAdjustment(amount: number) {
    this.showSubmit = false;
    this.isSubmitting = true;
    let isUpwardAdjustment = false;
    if (this.adjustmentDirection === AdjustmentDirection.Up) {
      isUpwardAdjustment = true;
    }
    this.transactionService.openPeriodInterestAdjustment(this.selectedTransactionId, +amount, this.rolePlayerId, isUpwardAdjustment).subscribe(result => {
      this.isSubmitting = false;
      this.toastr.successToastr('transaction adjusted successfully');
      this.router.navigate(['/fincare/billing-manager']);
    });
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
    this.transactionService.getDebtorInterestTransactionHistory(this.rolePlayerId).pipe(tap(data => {
      this.transactions = data;
      this.datasource.data = data;
      if (data.length === 0) {
        this.searchFailedMessage = 'No interest transactions found to adjust';
      }
      this.isLoading = false;
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

  openDialog(item: Statement, direction: number): void {
    switch (item.period) {
      case 'History': this.periodStatus = PeriodStatusEnum.History;
        break;
      case 'Current': this.periodStatus = PeriodStatusEnum.Current;
        break;
      case 'Future': this.periodStatus = PeriodStatusEnum.Future;
        break;
      case 'Latest': this.periodStatus = PeriodStatusEnum.Latest;
        break;
    }
    this.selectedTransaction = item;
    this.selectedTransactionId = item.transactionId;
    if (direction === +AdjustmentDirection.Up) {
      this.adjustmentDirection = AdjustmentDirection.Up;
    }

    else if (direction === +AdjustmentDirection.Down) {
      this.adjustmentDirection = AdjustmentDirection.Down;
    }
    let amountBeingAdjusted = 0;
    if (this.periodStatus === PeriodStatusEnum.History) {
      amountBeingAdjusted = item.balance;
    }
    else {
      amountBeingAdjusted = item.amount;
    }

    const dialogRef = this.dialog.open(AdjustmentAmountDialogComponent, { width: '50%', height: 'auto', data: { direction: this.adjustmentDirection, originalAmount: amountBeingAdjusted, period: this.periodStatus }, disableClose: true });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        if (data.amount > 0) {
            if (direction === +AdjustmentDirection.Down) {
              this.submitDownwardAdjustment(data.amount);
            }
            else if (direction === +AdjustmentDirection.Up) {
              this.submitUpwardAdjustment(data.amount);
            }        
        }
      }
    });
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe((data: Wizard) => {
      this.isSubmitting = false;
      this.router.navigateByUrl(`${this.backLink}/interest-adjustment/continue/${data.id}`);
      this.toastr.successToastr('Interest adjustment task has created successfully.', '', true);
    });
  }

  instantiateInterestAdjustmentWizard(startWizardRequest: StartWizardRequest, amount: number, isUpwardAdjustment: boolean) {
    const interestAdjustment = new InterestAdjustment();
    startWizardRequest.type = 'interest-adjustment';
    interestAdjustment.roleplayerId = this.rolePlayerId;
    interestAdjustment.transaction = this.selectedTransaction;
    interestAdjustment.transactionId = this.selectedTransactionId;
    interestAdjustment.adjustmentAmount = amount;
    interestAdjustment.isUpwardAdjustment = isUpwardAdjustment;
    interestAdjustment.finPayee = this.debtorSearchResult.finPayeNumber;
    startWizardRequest.linkedItemId = this.rolePlayerId;
    startWizardRequest.data = JSON.stringify(interestAdjustment);
  }
}
