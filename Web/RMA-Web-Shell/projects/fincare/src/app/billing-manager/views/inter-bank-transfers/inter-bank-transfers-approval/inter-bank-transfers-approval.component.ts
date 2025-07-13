import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InterBankTransfer } from '../../../models/interBankTransfer';
import { DocumentsComponent } from '../../documents/documents.component';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { Transaction } from '../../../models/transaction';
import { RmaBankAccount } from '../../../models/rmaBankAccount';
import { RmaBankAccountTransaction } from '../../../models/rmaBankAccountTransaction';
import { SearchAccountResults } from 'projects/fincare/src/app/shared/models/search-account-results';
import { ToastrManager } from 'ng6-toastr-notifications';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { InterBankTransferService } from '../../../services/interbanktransfer.service';
import { CollectionsService } from '../../../services/collections.service';
import { BehaviorSubject } from 'rxjs';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { InterDebtorTransferService } from '../../../services/interdebtortransfer.service';
import { TransactionsService } from '../../../services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MatTableDataSource } from '@angular/material/table';
import { UnallocatedBankImportPayment } from '../../../models/unallocatedBankImportPayment';
import { InterBankTransferDetail } from '../../../models/inter-bank-transfer-detail';
import { monkeyPatchChartJsLegend } from 'ng2-charts';

@Component({
  selector: 'app-inter-bank-transfers-approval',
  templateUrl: './inter-bank-transfers-approval.component.html',
  styleUrls: ['./inter-bank-transfers-approval.component.css']
})
export class InterBankTransfersApprovalComponent extends WizardDetailBaseComponent<InterBankTransfer> implements OnInit {
  @ViewChild(DocumentsComponent, { static: false }) documentsComponent: DocumentsComponent;
  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  isDocuments = 0;
  hideDocuments = true;
  requestCode: string;
  title = 'Inter Bank Transfer';
  isLoadingToAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingFromAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  rmaFromBankAccounts: RmaBankAccount[];
  rmaToBankAccounts: RmaBankAccount[];
  debtorBankAccounts: RmaBankAccount[];
  rmaBankAccountTransactions: RmaBankAccountTransaction;
  selectedFromAccountId: number;
  selectedFromAccount: RmaBankAccount;
  selectedFromTransactionId = 0;
  selectedToAccountId = 0;
  selectedToAccount: RmaBankAccount;
  amountSelected = 0;
  fromAccountName: string;
  toAccountName: string;
  isValidValue = true;

  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtors: SearchAccountResults[];
  selectedDebtorNumber = null;

  wasInitiatedByInterDebtorTransfer = false;
  transferAmount = 0;
  isLoadingFromDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  fromDebtors: SearchAccountResults[];
  selectedFromDebtorNumber = null;

  industryClassesAreIdentical = false;

  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  hideButtons = false;
  showOwnAmount: boolean;
  message: string;
  allocatableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  identicalDebtor = false;
  displayedColumns = ['rmaReference', 'amount', 'unallocatedAmount', 'transactionDate', 'transferAmount', 'select'];
  documentSet = DocumentSetEnum.InterBankTransfer;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  wizardId: number;
  datasource = new MatTableDataSource<InterBankTransferDetail>();
  displayedColumnsDetails = ['statementReference', 'amount', 'action'];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  requiredDocumentsUploaded: boolean;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly interDebtorTransferService: InterDebtorTransferService,
    private readonly invoiceService: InvoiceService,
    private readonly collectionsService: CollectionsService,
    private readonly transactionService: TransactionsService,
    private readonly wizardService: WizardService,
    private readonly toastr: ToastrManager) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.onLoadLookups();
  }

  onLoadLookups(): void {
  }
 
  createForm(id: number): void {

  }

  populateModel(): void {
    this.model.requestCode = this.requestCode;
    if (!this.model.toRmaBankAccountId) {
      this.model.toRmaBankAccountId = 0;
    }
    let wizardName = '';  
      wizardName =   ' Transfer from: (' + this.model.fromAccountNumber + ')' +
        ' to ' + this.model.receiverDebtorNumber + '(' + this.model.toAccountNumber + ') : amount (' + this.model.transferAmount + ')'; 
    this.context.wizard.name = wizardName;
  }

  populateForm(): void {
    this.wizardId = this.context.wizard.id;
    if (this.model) {
      this.requestCode = this.model.requestCode;
      if (!(this.requestCode) || this.requestCode === '') {
        this.requestCode = this.model.receiverDebtorNumber + '/' + Math.floor(Math.random() * Math.floor(9999999999));
      }

      this.selectedDebtorNumber = this.model.receiverDebtorNumber;
      this.selectedFromAccountId = this.model.fromRmaBankAccountId;
      this.selectedToAccountId = this.model.toRmaBankAccountId;

      if(this.model.interBankTransferDetails  && this.model.interBankTransferDetails.length >0){        
        this.datasource.data = this.model.interBankTransferDetails;
      }
    }
    
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.transferAmount === 0) {
      validationResult.errors++;
      validationResult.errorMessages.push('Transfer Amount is invalid');
    }

    if (!this.requiredDocumentsUploaded) {
      validationResult.errors++;
      validationResult.errorMessages.push('Required documents not uploaded');
    }
    return validationResult;
  }

  getDocumentNumber(tran: Transaction): string {
    if (tran.rmaReference && tran.rmaReference !== '') {
      return tran.rmaReference;
    } else {
      return tran.bankReference;
    }
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    const validationResult = new ValidationResult(this.displayName);    
    return this.onValidateModel(validationResult);
  }

  isTransactionSelected(tran: Transaction): boolean {
    return this.selectedTransactions.filter(t => t.transactionId === tran.transactionId).length > 0;
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }
}
