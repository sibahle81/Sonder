import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { Component, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { TransactionTransfer } from 'projects/fincare/src/app/billing-manager/models/transactionTransfer';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { FinPayee } from 'projects/fincare/src/app/shared/models/finpayee';
import { DocumentsComponent } from 'projects/fincare/src/app/billing-manager/views/documents/documents.component';
import { TransactionType } from 'projects/fincare/src/app/billing-manager/models/transactiontype';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { AccountPurposeEnum } from './accountPurposeEnum';
import { CollectionsService } from '../../../../services/collections.service';
import { map } from 'rxjs/operators';
import { InvoiceAllocation } from 'projects/fincare/src/app/shared/models/invoice-allocation';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-re-alloction',
  templateUrl: './re-alloction.component.html',
  styleUrls: ['./re-alloction.component.css']
})
export class ReAlloctionComponent extends WizardDetailBaseComponent<TransactionTransfer> {

  @ViewChild(DocumentsComponent, { static: false }) documentsComponent: DocumentsComponent;

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isCheckingBankAccountClass$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  requiredPermission = 'Start Credit Reallocations';
  crossAccountAllocation = false;

  selectedFromDebtorAccount: FinPayee;
  selectedToDebtorAccount: FinPayee;
  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  requestCode: string;

  transactionTransfer: TransactionTransfer;

  hideFromAccount = false;
  hideToAccount = true;
  submitDisabled = true;
  hideDocuments = true;
  hideSearch: boolean;
  hideButtons: boolean;
  hasPermission: any;

  transactionTypes = [new TransactionType(TransactionTypeEnum.Payment, 'Payment'), new TransactionType(TransactionTypeEnum.CreditNote, 'Credit Note')];
  selectedTransactionTypeId = 0;
  hideTransactionTypeSelector = false;

  showOwnAmount: boolean;
  message: string;
  allocatableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  selectedToRoleplayerId = 0;
  selectedFromRoleplayerId = 0;
  datasource = new MatTableDataSource<InvoiceAllocation>();
  displayedColumns = ['documentNumber', 'amount', 'actions'];
  selectedInvoiceAllocationIds = [];
  selectedInvoiceAllocations = [];

  constructor(
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    private readonly appEventsManager: AppEventsManager,
    private readonly transactionService: TransactionsService,
    private readonly wizardService: WizardService,
    private readonly toastr: ToastrManager,
    private readonly roleplayerService: RolePlayerService, private readonly collectionsService: CollectionsService) {
    super(appEventsManager, authService, activatedRoute);
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }

  onLoadLookups() { }

  createForm() {
    this.form = this.formbuilder.group({
      fromDebtorAccount: [null],
      toDebtorAccount: [null],
      reason: [null, [Validators.required]],
      transactionTypes: [''],
      partialAmount: [null]
    });

    this.disableFormControl('fromDebtorAccount');
    this.disableFormControl('toDebtorAccount');
  }

  populateForm() {
    if (this.model) {
      this.crossAccountAllocation = false;
      this.hideSearch = true;
      this.hideButtons = true;
      this.transactions = this.model.transactions;
      this.hideDocuments = false;
      this.hideTransactionTypeSelector = true;

      this.selectedFromDebtorAccount = this.model.fromDebtorAccount;
      this.selectedTransactions = this.model.transactions;

      this.requestCode = this.model.requestCode;
      if (this.model.invoiceAllocations && this.model.invoiceAllocations.length > 0) {
        this.selectedInvoiceAllocations = this.model.invoiceAllocations
        this.selectedInvoiceAllocations.forEach(i => { this.selectedInvoiceAllocationIds.push(i.invoiceAllocationId) });
        this.datasource.data = this.selectedInvoiceAllocations;
      }

      this.form.patchValue({
        fromDebtorAccount: this.selectedFromDebtorAccount.finPayeNumber,
        reason: this.model.reason
      });

      if (this.model.toDebtorAccount) {
        if (this.model.toDebtorAccount.rolePlayerId && this.model.toDebtorAccount.rolePlayerId > 0) {
          this.selectedToDebtorAccount = this.model.toDebtorAccount;
          this.form.patchValue({
            toDebtorAccount: this.selectedToDebtorAccount.finPayeNumber
          });
        } else {
          this.form.patchValue({
            toDebtorAccount: 'Suspense'
          });
        }
      }
    }
  }

  populateModel() {
    this.model.fromDebtorAccount = this.selectedFromDebtorAccount;
    this.model.transactions = this.selectedTransactions;
    this.model.toDebtorAccount = this.selectedToDebtorAccount;
    this.model.requestCode = this.requestCode;
    this.model.reason = this.form.controls.reason.value as string;
    this.model.invoiceAllocations = this.selectedInvoiceAllocations
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.documentsComponent.dataSource.data && this.documentsComponent.dataSource.data.length > 0 && this.documentsComponent.dataSource.data[0].id === 0) {
      validationResult.name = 'Supporting Documents';
      validationResult.errors++;
      validationResult.errorMessages.push('Supporting document for reallocation is required');
    }
    return validationResult;
  }

  onAccountSelected($event: AccountSearchResult) {
    if (!this.hideFromAccount) {
      this.setAccountSearchType(AccountPurposeEnum.fromAccount);
      if (!(this.requestCode) || this.requestCode === '') {
        this.requestCode = $event.finPayeNumber + '/' + Math.floor(Math.random() * Math.floor(9999999999));
      }
      this.selectedFromDebtorAccount = $event;
      this.selectedFromRoleplayerId = this.selectedFromDebtorAccount.rolePlayerId;
      this.getTransactions(this.selectedTransactionTypeId as TransactionTypeEnum);

      this.form.patchValue({
        fromDebtorAccount: this.selectedFromDebtorAccount.finPayeNumber
      });
    } else {
      this.setAccountSearchType(AccountPurposeEnum.toAccount);

      this.selectedToDebtorAccount = $event;
      this.selectedToRoleplayerId = this.selectedToDebtorAccount.rolePlayerId;

      this.isCheckingBankAccountClass$.next(true);
      this.roleplayerService.GetDebtorIndustryClassBankAccountNumber(this.selectedFromDebtorAccount.finPayeNumber).subscribe(from => {
        this.roleplayerService.GetDebtorIndustryClassBankAccountNumber(this.selectedToDebtorAccount.finPayeNumber).subscribe(to => {
          if (from != to) { // LEAVE SINGLE EQUALS
            this.crossAccountAllocation = true;
            this.message = 'Allocation of payments across different classes is not allowed. From debtor account number: (' + from + ') ---To debtor account number: (' + to + ')';
            this.submitDisabled = true;
          } else {
            this.crossAccountAllocation = false;
          }
          this.isCheckingBankAccountClass$.next(false);
          if (!this.crossAccountAllocation) {
            this.form.patchValue({
              toDebtorAccount: this.selectedToDebtorAccount.finPayeNumber
            });

            this.hideDocuments = false;
          } else {
            this.selectedToDebtorAccount = null;
          }
        });
      }, error => { this.message = error.message; this.isCheckingBankAccountClass$.next(false); });
    }

    this.toggleSearch();
  }

  getTransactions(transactionType: TransactionTypeEnum) {
    this.hideDocuments = true;
    this.isLoadingTransactions$.next(true);
    this.transactionService.getTransactionsForReAllocation(this.selectedFromDebtorAccount.rolePlayerId, transactionType).subscribe(results => {
      this.hideSearch = results && !(results.length > 0);
      this.transactions = results;
      this.isLoadingTransactions$.next(false);
      this.hideToAccount = false;
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  transactionSelected($event: Transaction, partialAmount = 0) {
    this.message = '';

    const index = this.selectedTransactions.indexOf($event);

    if (index <= -1) {
      if (partialAmount > 0) {
        $event.reallocatedAmount = partialAmount;
        $event.unallocatedAmount = $event.unallocatedAmount - partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].reallocatedAmount = partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = $event.unallocatedAmount;
      } else {
        if ($event.amount > $event.unallocatedAmount) {
          this.message = 'Full amount cannot be reallocated';
          return;
        }

        $event.reallocatedAmount = $event.amount;
        $event.unallocatedAmount = 0;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].reallocatedAmount = $event.amount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = 0;
      }
      this.getTransactionInvoiceAllocations($event.transactionId);
    } else {
      $event.unallocatedAmount = $event.originalUnallocatedAmount;
      $event.reallocatedAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].reallocatedAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = $event.unallocatedAmount;
    }

    index > -1 ? this.selectedTransactions.splice(index, 1) : this.selectedTransactions.push($event);
    this.submitDisabled = !(this.selectedFromDebtorAccount !== null && this.selectedFromDebtorAccount !== null && this.selectedTransactions.length > 0);
  }

  setAccountSearchType(accountPurpose: AccountPurposeEnum) {
    this.hideFromAccount = accountPurpose === AccountPurposeEnum.fromAccount;
    this.hideToAccount = !this.hideFromAccount;
  }

  toggleSearch() {
    this.hideSearch = this.selectedFromDebtorAccount != null && this.selectedToDebtorAccount != null;
  }

  submit() {
    this.isSubmitting$.next(true);
    this.transactionTransfer = new TransactionTransfer();
    this.transactionTransfer.fromDebtorAccount = this.selectedFromDebtorAccount;
    this.transactionTransfer.toDebtorAccount = this.selectedToDebtorAccount;
    this.transactionTransfer.transactions = this.selectedTransactions;
    this.transactionTransfer.reason = this.form.controls.reason.value as string;
    this.transactionTransfer.requestCode = this.requestCode;
    this.transactionTransfer.invoiceAllocations = this.selectedInvoiceAllocations;

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = -1;
    startWizardRequest.type = 'reallocation';
    startWizardRequest.data = JSON.stringify(this.transactionTransfer);

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      if (wizard) {
        this.router.navigateByUrl('fincare/billing-manager/reallocation/continue/' + wizard.id);
      } else {
        this.toastr.errorToastr('Something went wrong...Reallocation wizard failed to start');
        this.isSubmitting$.next(false);
      }
    });
  }

  reset() {
    this.setAccountSearchType(AccountPurposeEnum.toAccount);
    this.transactions = [];
    this.selectedFromDebtorAccount = null;
    this.selectedToDebtorAccount = null;
    this.hideSearch = false;
    this.requestCode = null;
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  transactionTypeChanged($event: any) {
    this.selectedTransactionTypeId = $event.value;
    this.hideTransactionTypeSelector = true;
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  toggleOwnAmount(tran: Transaction) {
    this.message = '';
    if (tran) {
      this.allocatableAmount = tran.unallocatedAmount;

      if (this.allocatableAmount <= 0) {
        this.message = 'Available balance depleted';
        return;
      }

      this.lastSelectedPartialTranId = tran.transactionId;
      this.maxAmountAllowed = this.allocatableAmount;
    } else {
      this.lastSelectedPartialTranId = 0;
      this.maxAmountAllowed = 0;
    }
    this.showOwnAmount = !(this.showOwnAmount);
  }

  addPartialAmount() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    const transaction = this.transactions.find(tran => tran.transactionId === this.lastSelectedPartialTranId);
    this.transactionSelected(transaction, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialTranId = 0;
    this.toggleOwnAmount(null);
  }

  getDocumentNumber(tran: Transaction): string {
    if (tran.rmaReference && tran.rmaReference !== '') {
      return tran.rmaReference;
    } else {
      return tran.bankReference;
    }
  }

  getTransactionInvoiceAllocations(transactionId: number) {
    this.collectionsService.getTransactionInvoiceAllocations(transactionId).pipe(map(data => {
      if (data) {
        if (data.length === 1) {
          if (this.selectedInvoiceAllocations.filter(i => i.invoiceAllocationId === data[0].invoiceAllocationId).length === 0) {
            this.selectedInvoiceAllocations.push(data[0]);
            this.selectedInvoiceAllocationIds.push(data[0].invoiceAllocationId);
          }
        }
        this.datasource.data = this.selectedInvoiceAllocations;
      }
    })).subscribe();
  }

  debitTransactionChecked(event: any, item: InvoiceAllocation) {
    if (event.checked) {
      if (this.selectedInvoiceAllocations.filter(i => i.invoiceAllocationId === item.invoiceAllocationId).length === 0) {
        this.selectedInvoiceAllocations.push(item);
        this.selectedInvoiceAllocationIds.push(item.invoiceAllocationId);
      }

    } else {
      this.unTickItem(item.invoiceAllocationId);
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.selectedInvoiceAllocationIds.length; i++) {
      if ((this.selectedInvoiceAllocationIds[i] === itemId)) {
        this.selectedInvoiceAllocationIds.splice(i, 1);
        const allocationIndex = this.selectedInvoiceAllocations.findIndex(c => c.invoiceAllocationId === itemId);
        this.selectedInvoiceAllocations.splice(allocationIndex, 1);
        break;
      }
    }
  }
}
