import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { AmountDetailsComponent } from 'projects/fincare/src/app/billing-manager/views/confirm-premium-received/amount-details-dialog/amount-details.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { DatePipe } from '@angular/common';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'app-confirm-premium-received',
  templateUrl: './confirm-premium-received.component.html',
  styleUrls: ['./confirm-premium-received.component.css']
})

export class ConfirmPremiumReceivedComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Confirm Premium Received';
  hasPermission: boolean;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  undoing$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentUser: User;
  currentPeriod: string;
  periodStartDate: Date;
  periodEndDate: Date;
  hasAlreadyBeenConfirmedForPeriod: boolean;

  selectedDebtor: AccountSearchResult;
  selectedChildPolicy: RolePlayerPolicy;
  amountPaidForSelectedChildPolicy: number;
  expectedTotalPaymentAmount = 0;
  actualPaymentAmount = 0;
  balance = 0;

  policies: RolePlayerPolicy[];
  parentPolicies: RolePlayerPolicy[];
  childPolicies: RolePlayerPolicy[];
  matchedPolicies: RolePlayerPolicy[] = [];
  roleplayer: RolePlayer;

  selectedDebtorIsIndividual = false;
  totalPaymentAmountConfirmed = false;
  amountsMatch = false;

  displayedColumns = ['policyNumber', 'lapsedCount', 'policyStatus', 'installmentPremium', 'actualPremiumPaid', 'actions'];
  public dataSource: any;

  public pageSize = 5;
  public currentPage = 0;
  public totalSize = 0;

  constructor(
    private readonly router: Router,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly roleplayerService: RolePlayerService,
    private readonly roleplayerPolicyService: RolePlayerPolicyService,
    private readonly transactionService: TransactionsService,
    public dialog: MatDialog,
    private readonly periodService: PeriodService,
    private readonly datePipe: DatePipe,
    private readonly toastr: ToastrManager) {
  }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    if (this.hasPermission) {
      this.currentUser = this.authService.getCurrentUser();
      this.getCurrentPeriod();
      this.createForm();
    }
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
  }

  private iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.childPolicies.slice(start, end);
    this.dataSource = part;
  }

  getCurrentPeriod() {
    this.periodService.getCurrentPeriod().subscribe(result => {
      this.periodStartDate = result.startDate;
      this.periodEndDate = result.endDate;
      this.currentPeriod = this.datePipe.transform(result.startDate, 'yyyy-MM-dd') + ' to ' + this.datePipe.transform(result.endDate, 'yyyy-MM-dd');
    });
  }

  createForm() {
    this.form = this.formbuilder.group({
      account: [null],
      expectedPaymentAmount: [null],
      actualPaymentAmount: [null],
      billingPeriod: [null]
    });
  }

  populateForm() {
    if (!this.selectedDebtor) { return; }
    this.form.patchValue({
      account: this.selectedDebtor.finPayeNumber,
      expectedPaymentAmount: this.expectedTotalPaymentAmount.toFixed(2),
      actualPaymentAmount: this.actualPaymentAmount.toFixed(2),
      billingPeriod: this.currentPeriod
    });

    this.disableFormControl('account');
    this.disableFormControl('expectedPaymentAmount');
    this.disableFormControl('actualPaymentAmount');
    this.disableFormControl('billingPeriod');
  }

  onAccountSelected($event: AccountSearchResult) {
    this.isLoading$.next(true);
    this.toggleSearch();

    this.reset();

    this.selectedDebtor = $event;

    this.roleplayerService.getRolePlayer($event.rolePlayerId).subscribe(roleplayer => {
      this.roleplayer = roleplayer;
      if (this.roleplayer.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person) {
        this.selectedDebtorIsIndividual = true;
      }

      this.roleplayerPolicyService.getPoliciesByPolicyPayeeIdNoRefData(this.selectedDebtor.rolePlayerId).subscribe(policies => {
        this.policies = [...policies];

        this.expectedTotalPaymentAmount = 0;
        if (this.policies && this.policies.length > 0) {
          this.parentPolicies = this.policies.filter(s => s.policyOwnerId === s.policyPayeeId);
          this.childPolicies = this.policies.filter(s => s.policyOwnerId !== s.policyPayeeId && s.policyStatus === PolicyStatusEnum.Active);

          this.hasAlreadyBeenConfirmedForPeriod = (this.childPolicies.filter(s => this.periodStartDate <= s.lastLapsedDate && this.periodEndDate >= s.lastLapsedDate)).length > 0;
          if (this.hasAlreadyBeenConfirmedForPeriod) {
            this.isLoading$.next(false);
            return;
          }

          this.setupPaging();

          this.expectedTotalPaymentAmount = this.childPolicies.reduce((accum, item) => accum + item.installmentPremium, 0);

          this.transactionService.getCurrentPeriodDebtorBalance(this.roleplayer.rolePlayerId).subscribe(amount => {
            this.actualPaymentAmount = this.expectedTotalPaymentAmount - amount;
            this.balance = this.actualPaymentAmount;
            this.amountsMatch = (this.expectedTotalPaymentAmount - this.actualPaymentAmount) <= 0;
            if (this.amountsMatch) {
              this.confirmed();
            }

            this.populateForm();
            this.isLoading$.next(false);
          });
        }
      });
    });
  }

  setupPaging() {
    this.dataSource = new MatTableDataSource<RolePlayerPolicy>(this.childPolicies);
    this.dataSource.paginator = this.paginator;
    this.totalSize = this.childPolicies.length;
    this.iterator();
  }

  confirmed() {
    this.totalPaymentAmountConfirmed = !this.totalPaymentAmountConfirmed;
  }

  openDialog(selectedChildPolicy: RolePlayerPolicy, undo: boolean) {
    this.selectedChildPolicy = selectedChildPolicy;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      policyNumber: selectedChildPolicy.policyNumber,
      expectedAmount: selectedChildPolicy.installmentPremium,
      lapseCount: selectedChildPolicy.lapsedCount,
      balance: this.balance,
      undoCheck: undo
    };

    const dialogRef = this.dialog.open(AmountDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        const action = data.action as string;

        if (action === 'select') {
          this.amountPaidForSelectedChildPolicy = +data.amount as number;
          this.balance = +data.balance as number;
          this.selectedChildPolicy.actualPremiumPaid = +this.amountPaidForSelectedChildPolicy as number;

          if (this.selectedChildPolicy.installmentPremium > this.amountPaidForSelectedChildPolicy) {
            this.selectedChildPolicy.lapsedCount++;
            this.selectedChildPolicy.lastLapsedDate = new Date();
            if (this.selectedChildPolicy.lapsedCount > 1) {
              this.selectedChildPolicy.policyStatus = PolicyStatusEnum.Lapsed;
            }
            const index = this.childPolicies.indexOf(this.selectedChildPolicy);
            this.matchedPolicies.push(this.selectedChildPolicy);
            this.childPolicies[index] = this.selectedChildPolicy;
          }
        }

        if (action === 'undo') {
          this.balance = this.balance + selectedChildPolicy.actualPremiumPaid;
          this.undoing$.next(true);
          this.roleplayerPolicyService.getRolePlayerPolicy(selectedChildPolicy.policyId).subscribe(originalPolicy => {
            this.selectedChildPolicy.lapsedCount = originalPolicy.lapsedCount;
            this.selectedChildPolicy.lastLapsedDate = originalPolicy.lastLapsedDate;
            this.selectedChildPolicy.actualPremiumPaid = null;
            const index = this.childPolicies.indexOf(this.selectedChildPolicy);
            this.childPolicies[index] = this.selectedChildPolicy;

            const idx = this.matchedPolicies.findIndex(s => s.policyId === this.selectedChildPolicy.policyId);
            this.matchedPolicies.splice(idx, 1);

            this.undoing$.next(false);
          });
        }
      }
    });
  }

  undo(selectedChildPolicy: RolePlayerPolicy) {
    this.openDialog(selectedChildPolicy, true);
  }

  reset() {
    this.selectedDebtor = null;
    this.totalPaymentAmountConfirmed = false;

    this.policies = null;
    this.expectedTotalPaymentAmount = 0;

    this.amountsMatch = false;
    this.parentPolicies = null;
    this.childPolicies = null;
    this.actualPaymentAmount = 0;
    this.roleplayer = null;
    this.balance = 0;

    this.selectedDebtorIsIndividual = false;
    this.hasAlreadyBeenConfirmedForPeriod = false;
  }

  getStatus(statusId: number): string {
    const statusText = (PolicyStatusEnum[statusId]);
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  submit() {
    this.isSubmitting$.next(true);
    this.roleplayerPolicyService.editRolePlayerPolicies(this.matchedPolicies).subscribe(result => {
      this.toastr.successToastr('policies matched successfully...');
      this.router.navigateByUrl('/fincare/billing-manager');
      this.isSubmitting$.next(false);
    }, error => {this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
  }

  toggleSearch() {
    this.panelOpenState$.next(!this.panelOpenState$.getValue);
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }
}
