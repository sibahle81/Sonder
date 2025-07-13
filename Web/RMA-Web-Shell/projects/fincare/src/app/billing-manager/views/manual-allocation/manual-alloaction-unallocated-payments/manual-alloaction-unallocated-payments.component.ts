import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CollectionsService } from 'projects/fincare/src/app/billing-manager/services/collections.service';
import { InvoicePaymentAllocation } from 'projects/fincare/src/app/billing-manager/models/invoicePaymentAllocation';
import { BehaviorSubject } from 'rxjs';
import { UnallocatedBankImportPayment } from 'projects/fincare/src/app/billing-manager/models/unallocatedBankImportPayment';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AccountService } from 'projects/fincare/src/app/shared/services/account.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ManualAlloactionUnallocatedPaymentsDatasource } from './manual-allocation-unallocated-payments.datasource';


@Component({
  selector: 'app-manual-alloaction-unallocated-payments',
  templateUrl: './manual-alloaction-unallocated-payments.component.html',
  styleUrls: ['./manual-alloaction-unallocated-payments.component.css']
})
export class ManualAlloactionUnallocatedPaymentsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Manual Payment Allocation';
  hasPermission: boolean;
  claimRecoveryAllocationPermission = 'Claim Recovery Payment Allocation';
  hasclaimRecoveryAllocationPermission: boolean;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  transactionsSearchDone$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  bankImportId: number;
  invoicePaymentAllocations: InvoicePaymentAllocation[];
  unallocatedBankImports: UnallocatedBankImportPayment[];

  allocationType: string;
  selectedDebtor: AccountSearchResult;
  overpaymentTransactions: Transaction[];
  hideSearch: boolean;
  showAllocationTypeSelector = true;
  isAuthorized = false;

  displayedColumns = ['bankReference', 'transactionDate', 'transactionType', 'amount', 'balance', 'actions'];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly collectionsService: CollectionsService,
    private readonly toastr: ToastrManager,
    private readonly accountService: AccountService,
    public dataSource: ManualAlloactionUnallocatedPaymentsDatasource) {
  }

  ngOnInit() {
    this.dataSource.setControls(this.paginator, this.sort);
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.hasclaimRecoveryAllocationPermission = userUtility.hasPermission(this.claimRecoveryAllocationPermission);
    if (this.hasPermission || this.hasclaimRecoveryAllocationPermission) {
      this.isAuthorized = true;
    } else {
      this.isAuthorized = false;
    }
    this.createForm();
    if (this.hasPermission || this.hasclaimRecoveryAllocationPermission) {
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.receiverDebtorNumber) {
          // must be a redirect from interdebtor or reallocation
          this.allocationType = 'DBT';
          this.hideSearch = true;
          this.showAllocationTypeSelector = false;
          this.isLoading$.next(true);
          this.accountService.searchAccounts(1, 10, 'RolePlayerId', 'asc', params.receiverDebtorNumber)
            .subscribe(searchResults => {
              this.isLoading$.next(false);
              this.onAccountSelected(searchResults.filter(x => x.finPayeNumber === params.receiverDebtorNumber)[0]);
            });
        } else {
          this.bankImportId = params.bankImportId;
        }
      });
    }
  }

  createForm() {
    this.form = this.formbuilder.group({
      query: [null, Validators.required]
    });
  }

  search() {
    this.isLoading$.next(true);
    const query = this.form.get('query').value as string;
    this.collectionsService.SearchUnallocatedPaymentsForBankImport(query).subscribe(results => {
      this.unallocatedBankImports = results;
      this.isLoading$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators([validationToApply]);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  toggle($event) {
    this.dataSource.clearData();
    this.allocationType = $event;
    this.toggleSearch(false);
  }

  toggleSearch(hide: boolean) {
    this.hideSearch = hide;
  }

  onAccountSelected($event: AccountSearchResult) {
    this.hideSearch = true;
    this.isLoadingTransactions$.next(true);
    this.transactionsSearchDone$.next(false);
    this.selectedDebtor = $event;
    this.collectionsService.getPaymentTransactionsAllocatedToDebtorAccount(this.selectedDebtor.rolePlayerId).subscribe((transactions) => {
      this.dataSource.getData(transactions);
      this.isLoadingTransactions$.next(false);
      this.transactionsSearchDone$.next(true);
    });
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  getTransactionTypeName(transactionTypeId: number): string {
    return TransactionTypeEnum[transactionTypeId].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
