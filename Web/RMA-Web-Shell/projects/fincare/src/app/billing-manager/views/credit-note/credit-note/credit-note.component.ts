import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { CreditNoteAccount } from '../../../models/credit-note-account';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { TransactionTypeEnum } from '../../../../shared/enum/transactionTypeEnum';
import { CollectionsService } from '../../../services/collections.service';
import { InvoicePaymentAllocation } from '../../../models/invoicePaymentAllocation';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { Transaction } from '../../../models/transaction';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-credit-note',
  templateUrl: './credit-note.component.html',
  styleUrls: ['./credit-note.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CreditNoteComponent extends WizardDetailBaseComponent<CreditNoteAccount> implements AfterViewInit {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  totalAmount = 0;
  finPayeNumber: string;
  roleplayer: RolePlayer;

  showOwnAmount: boolean;
  ownAmount: number;
  lastSelectedPartialInvoiceId: number;
  maxAmountAllowed: number;
  showMessage: boolean;

  invoicePaymentAllocations: InvoicePaymentAllocation[];
  selectedInvoiceIds: number[] = [];
  transactions: Transaction[] = [];
  displayedColumns = ['expand', 'invoiceNumber', 'totalInvoiceAmount', 'amountOutstanding', 'status', 'invoiceDate', 'amountAllocated', 'actions'];
  datasource = new MatTableDataSource<InvoicePaymentAllocation>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly roleplayerService: RolePlayerService,
    private readonly appEventsManager: AppEventsManager,
    private readonly collectionsService: CollectionsService,
    private readonly toastr: ToastrManager) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
    this.getRoleplayerDetails(this.model.rolePlayerId);
    this.getUnpaidInvoices(this.model.rolePlayerId);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm() {
    if (!this.model) { return; }

    this.form.patchValue({
      amount: this.totalAmount,
      reason: this.model.note.text
    });

    this.disableFormControl('amount');
  }

  populateModel() {
    this.model.amount = this.form.value.amount as number;
    this.model.note.text = this.form.value.reason as string;
    this.model.transactions = this.transactions;
  }

  getRoleplayerDetails(roleplayerId: number) {
    this.isLoading$.next(true);
    this.roleplayerService.getRolePlayer(roleplayerId).subscribe(result => {
      this.roleplayer = result;
    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
  }

  createForm() {
    this.form = this.formbuilder.group({
      amount: [null],
      partialAmount: [null],
      reason: [null, [Validators.required, Validators.minLength(3)]]
    });
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  // NEW REQUIRMENTS

  populateForApproval() {
    this.model.transactions.forEach(transaction => {
      this.invoiceSelected(transaction.invoiceId, transaction.amount);
    });
  }

  getUnpaidInvoices(roleplayerId: number) {
    this.collectionsService.getUnpaidInvoices(roleplayerId, false).subscribe(results => {
      this.invoicePaymentAllocations = results;
      this.datasource.data = this.invoicePaymentAllocations;
      if (this.isReadonly) {
        this.populateForApproval();
      }

      this.isLoading$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
  }

  invoiceSelected(invoiceId: number, partialAmount: number) {
    const selectedInvoice = this.invoicePaymentAllocations.find(invoice => invoice.invoiceId === invoiceId);
    if (selectedInvoice) {
      const index = this.invoicePaymentAllocations.findIndex(invoice => invoice.invoiceId === invoiceId);

      selectedInvoice.amountAllocated = partialAmount === 0 ? selectedInvoice.amountOutstanding : partialAmount;

      this.selectedInvoiceIds.push(invoiceId);

      selectedInvoice.amountOutstanding -= selectedInvoice.amountAllocated;
      this.totalAmount += selectedInvoice.amountAllocated;
      selectedInvoice.invoiceStatus = this.setInvoiceStatus(selectedInvoice);

      this.invoicePaymentAllocations[index] = selectedInvoice;

      const transaction = new Transaction();
      transaction.invoiceId = invoiceId;
      transaction.amount = selectedInvoice.amountAllocated;
      transaction.transactionType = TransactionTypeEnum.CreditNote;
      this.transactions.push(transaction);
    }

    this.populateForm();
  }

  invoiceRemoved(invoiceId: number, amountAllocated: number) {
    const selectedInvoice = this.invoicePaymentAllocations.find(invoice => invoice.invoiceId === invoiceId);

    let index = this.selectedInvoiceIds.findIndex(id => id === invoiceId);
    this.selectedInvoiceIds.splice(index, 1);

    selectedInvoice.amountOutstanding += amountAllocated;
    this.totalAmount -= amountAllocated;
    selectedInvoice.amountAllocated = 0;
    selectedInvoice.invoiceStatus = this.setInvoiceStatus(selectedInvoice);

    index = this.invoicePaymentAllocations.findIndex(invoice => invoice.invoiceId === invoiceId);
    this.invoicePaymentAllocations[index] = selectedInvoice;

    index = this.transactions.findIndex(transaction => transaction.invoiceId === invoiceId);
    this.transactions.splice(index, 1);

    this.populateForm();
  }

  toggleOwnAmount(invoiceId: number, maxAmountAllowed: number) {
    this.lastSelectedPartialInvoiceId = invoiceId;
    this.maxAmountAllowed = maxAmountAllowed;
    this.showOwnAmount = !(this.showOwnAmount);
  }

  addPartialAmount() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    this.invoiceSelected(this.lastSelectedPartialInvoiceId, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialInvoiceId = 0;
    this.toggleOwnAmount(0, 0);
  }

  getPartialAmount(invoiceId: number, partialAmount: number): void {
    this.invoiceSelected(invoiceId, partialAmount);
  }

  setInvoiceStatus(invoice: InvoicePaymentAllocation): InvoiceStatusEnum {
    return invoice.amountOutstanding === 0 ? InvoiceStatusEnum.Paid : invoice.amountOutstanding > 0 && invoice.amountAllocated > 0 ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Unpaid;
  }

  getStatusName(invoice: InvoicePaymentAllocation): string {
    const status = invoice.amountOutstanding === 0 && invoice.amountAllocated > 0 ? InvoiceStatusEnum.Paid : invoice.amountOutstanding > 0 && invoice.amountAllocated > 0 ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Unpaid;
    return InvoiceStatusEnum[status];
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }
}
