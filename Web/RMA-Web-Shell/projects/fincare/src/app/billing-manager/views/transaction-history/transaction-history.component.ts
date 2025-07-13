import { Policy } from "./../../../../../../clientcare/src/app/policy-manager/shared/entities/policy";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { SearchAccountResults } from "../../../shared/models/search-account-results";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ToastrManager } from "ng6-toastr-notifications";
import { TransactionDataSource } from "./transaction-history.datasource";
import { ActivatedRoute } from "@angular/router";
import {
  UntypedFormGroup,
  UntypedFormControl,
  UntypedFormBuilder,
} from "@angular/forms";
import { TransactionSearchRequest } from "../../../shared/models/transaction-search-request";
import { DatePipe } from "@angular/common";
import { BehaviorSubject, Subscription, merge } from "rxjs";
import { StatementAccountSearchComponent } from "../statement-account-search/statement-account-search.component";
import { TransactionsService } from "../../services/transactions.service";
import { InvoiceService } from "../../../shared/services/invoice.service";
import { PolicyService } from "projects/clientcare/src/app/policy-manager/shared/Services/policy.service";
import { TransactionViewDialogComponent } from "../transaction-view-dialog/transaction-view-dialog.component";
import { tap } from "rxjs/operators";
import { Transaction } from "../../models/transaction";
import { TransactionTypeEnum } from "../../../shared/enum/transactionTypeEnum";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import "src/app/shared/extensions/date.extensions";
import "src/app/shared/extensions/string.extensions";
import { Constants } from "projects/shared-utilities-lib/src/lib/pipe-formats/constants";
import { RolePlayerService } from "projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service";
import { FinPayee } from "../../../shared/models/finpayee";
import { DebtorStatusEnum } from "../../../shared/enum/debtor-status.enum";
import { Statement } from "../../../shared/models/statement";
import { DefaultConfirmationDialogComponent } from "projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component";
import { BillingService } from "../../services/billing.service";
import { InterestIndicator } from "../../models/InterestIndicator";
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ComplianceResult } from "projects/clientcare/src/app/policy-manager/shared/entities/compliance-result";
import { FeatureflagUtility } from "projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility";
import { ModuleTypeEnum } from "projects/shared-models-lib/src/lib/enums/module-type-enum";
import { ReferralItemTypeEnum } from "projects/shared-models-lib/src/lib/referrals/referral-item-type-enum";
import { ProductCategoryTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum";
import { PolicyProductCategory } from "../../models/policy-product-category";

@Component({
  selector: "app-transaction-history",
  templateUrl: "./transaction-history.component.html",
  styleUrls: ["./transaction-history.component.css"],
})
export class TransactionHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedFilterTypeId = 0; // default to Filter
  showActiveCheckBoxInput = true;
  rootMenus: {
    title: string;
    url: string;
    submenu: boolean;
    disable: boolean;
  }[];
  subMenus: { title: string; url: string; disable: boolean }[];
  filters: { title: string; id: number }[];
  menus: { title: string; action: string; disable: boolean }[];
  selectedTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  ssrsBaseUrl: string;
  selectedTabIndex = 0;
  selectedTransactionId: number;
  notesTabIndex = 1;
  filterSearch: string;
  isSearching: boolean;
  debtorNetBalance: number;
  currentQuery: string;
  debtor: FinPayee;
  rolePlayerId: number;
  showMemberDeclarations: boolean = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  writeOffSelected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  reBadDebtOffSelected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  reInterestSelected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(StatementAccountSearchComponent, { static: true })
  statementAccountComponent: StatementAccountSearchComponent;
  @ViewChild("filter", { read: ElementRef, static: true }) filter: ElementRef;

  selectedDebtorAccount: FinPayee;
  searchAccountResults: SearchAccountResults = new SearchAccountResults();
  displayedColumns = [
    'transactionType',
    'policyNumber',
    'documentNumber',
    'description',
    'transactionDate',
    'period',
    'debitAmount',
    'creditAmount',
    'balance'
  ];
  showStatement = false;
  form: UntypedFormGroup;
  startDate: Date;
  endDate: Date;
  debtorName: string;
  debtorNo: string;
  industryClassName: string;
  policyId: number;
  policyInceptionDate: Date;
  submitDisabled = true;
  minDate: Date;
  maxDate: Date;
  transactionId: number;
  showbothinterestpremium = false;
  showinterest = false;
  showredebt = false;
  showpremium = false;
  showreinterest = false;
  isShowDebtorStatus = false;
  noteSelected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  dataSource: TransactionDataSource;
  writeOffTabIndex = 1;
  reBadDebtTabIndex = 2;
  reInterestTabIndex = 3;
  placeHolder = "Search by Document or Policy Number";
  selectedTransactionType: TransactionTypeEnum = TransactionTypeEnum.All;
  selectedDebtorStatus: DebtorStatusEnum;
  transactionTypes: Lookup[] = [];
  debtorStatuses: Lookup[] = [];
  innerDisplayedColumns = ["street", "zipCode", "city"];
  expandedElement: Transaction | null;
  amountFormat = Constants.amountFormat;
  model: any;
  isDebtorSelected$ = new BehaviorSubject(false);
  billingServiceSubscription: Subscription;
  interestIndicator: InterestIndicator;
  debtorComplianceResult: ComplianceResult;
  industryClass: IndustryClassEnum;
  metalsIndustryClass = +IndustryClassEnum.Metals;
  coidFeaturesDisabled = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_Billing');
  targetModuleType = ModuleTypeEnum.FinCare;
  referralItemType = ReferralItemTypeEnum.Debtor;
  referralItemTypeReference = '';
  selectedProductCategoryId:number;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly transactionService: TransactionsService,
    private readonly invoiceService: InvoiceService,
    private readonly policyService: PolicyService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly lookUpService: LookupService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly rolePlayerService: RolePlayerService,
    public writeoffDialog: MatDialog,
    public reinstateBadDebtDialog: MatDialog,
    public reinstateInterestDialog: MatDialog, private readonly billingService: BillingService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {     
      if (params.policyId) {
        this.showStatement = true;
        this.isLoading$.next(true);
        this.policyService.getPolicy(params.policyId).subscribe((policy) => {
          this.policyInceptionDate = policy.policyInceptionDate
            ? policy.policyInceptionDate
            : policy.createdDate;
          this.endDate = new Date();
          this.startDate = new Date();
          this.startDate.setMonth(this.startDate.getMonth() - 1);
          if (this.policyInceptionDate > this.startDate) {
            this.startDate = new Date(this.policyInceptionDate);
            this.endDate.setMonth(this.startDate.getMonth() + 1);
          }
          this.invoiceService
            .searchAccounts(policy.policyNumber, 1, 10, "Id", "asc", true)
            .subscribe((searchResults) => {
              this.accountSearchChangeHandler(
                searchResults.filter(
                  (x) => x.policyNumber === policy.policyNumber
                )[0]
              );
            });
        });
      }
      if (params.roleplayerId) {
        this.searchAccountResults.rolePlayerId = params.roleplayerId;
      }     
    });

    this.menus = [
      {
        title: "Writeoff Bad Debt Interest",
        action: "writeoffbaddebtinterest",
        disable: false,
      },
      {
        title: "Writeoff Bad Debt Premium",
        action: "writeoffbaddebtpremium",
        disable: false,
      },
      {
        title: "Re Instate Bad Debt",
        action: "reinstatebaddebt",
        disable: false,
      },
      {
        title: "Re Instate Interest",
        action: "reinstateinterest",
        disable: false,
      },
    ];
    this.createForm("");
    this.loadDebtorStatuses();
    this.dataSource = new TransactionDataSource(this.invoiceService);
    this.dataSource.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
    this.billingServiceSubscription = this.billingService.selectedRoleplayerId$.subscribe();
   
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.rowCount$.subscribe(
      (count) => (this.paginator.length = count)
    );

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          if (this.filter.nativeElement.value === "") {
            this.applyFilters();
          } else {
            this.searchData();
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.billingServiceSubscription.unsubscribe();
  }

  setComplianceResult($event: ComplianceResult) {
    this.debtorComplianceResult = $event;
  }

  loadData(searchRequest: TransactionSearchRequest): void {
    this.dataSource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      searchRequest
    );
  }

  loadTransactionTypes(): void {
    this.lookUpService.getTransactionTypes().subscribe((data) => {
      this.transactionTypes = data;
    });
  }

  loadDebtorStatuses(): void {
    this.lookUpService.getDebtorStatuses().subscribe((data) => {
      const filteredStatuses = [
        DebtorStatusEnum.PremiumReinstate,
        DebtorStatusEnum.TermsArrangement,
        DebtorStatusEnum.TermsArrangementTermDefault,
        DebtorStatusEnum.TermsArrangementTermDefault1,
        DebtorStatusEnum.WriteOff,
      ];

      this.debtorStatuses = data.filter((status) => {
        return !filteredStatuses.includes(status.id);
      });
    });
  }

  createForm(id: any) {
    this.form = this.formBuilder.group({
      id: id as number,
      startDate: new UntypedFormControl(this.startDate),
      endDate: new UntypedFormControl(this.endDate),
      debtorName: [null],
      debtorNo: [null],
      transactionType: [null],
      debtorStatus: [null],
    });
  }

  accountSearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.isLoading$.next(true);
    this.isDebtorSelected$.next(true);
    this.loadTransactionTypes();
    this.billingService.selectedRoleplayerId$.next(searchAccountResults.rolePlayerId);
    this.searchAccountResults = searchAccountResults;

    this.debtorName = searchAccountResults.displayName;
    this.debtorNo = searchAccountResults.finPayeNumber;
    this.policyId = searchAccountResults.policyId;
    this.industryClassName = searchAccountResults.industryClassName;
    this.industryClass = searchAccountResults.industryClass;
    this.dataSource.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;

    const searchRequest = new TransactionSearchRequest();
    searchRequest.policyId = this.policyId;
    const today = new Date();
    let policy: Policy;
    this.policyService.getPolicy(this.policyId).subscribe(
      (result) => {
        policy = result;
      },
      (error) => { },
      () => {
        this.policyInceptionDate = policy.policyInceptionDate;
        this.startDate = new Date(this.policyInceptionDate);
        this.endDate = today;
        searchRequest.endDate = this.datePipe.transform(
          this.endDate,
          "yyyy-MM-dd"
        );

        this.startDate = today;
        this.startDate.setMonth(this.startDate.getMonth() - 1);
        if (new Date(policy.policyInceptionDate) > today) {
          this.startDate = new Date(this.policyInceptionDate);
        }
        searchRequest.startDate = this.datePipe.transform(
          this.startDate,
          "yyyy-MM-dd"
        );

        this.form.controls.startDate.setValue(searchRequest.startDate);
        this.form.controls.endDate.setValue(searchRequest.endDate);

        this.loadData(searchRequest);
        this.getDebtorNetBalance();
        this.getFinPayee();
        this.minDate = this.startDate;
        this.maxDate = this.endDate;
        this.showStatement = true;

        this.getInterestIndicator();
        this.isLoading$.next(false);
      }
    );
  }

  getStartDate(value: Date) {
    this.startDate = new Date(value);
    this.minDate = this.startDate;
  }

  getEndDate(value: Date) {
    this.endDate = new Date(value);
    this.maxDate = this.endDate;
  }

  clear() {
    this.showStatement = false;
    this.form.reset();
    this.statementAccountComponent.filter.nativeElement.value = "";
  }

  getDebtorNetBalance() {
    this.transactionService
      .getDebtorNetBalance(this.searchAccountResults.rolePlayerId)
      .subscribe((debtorNetBalance) => {
        this.debtorNetBalance = debtorNetBalance;
      });
  }

  openTransactionViewDialog(row: Transaction): void {
    this.dialog.closeAll();

    if (row.invoiceAllocations) {
      row.invoiceAllocations.forEach((allocation) => {
        if (allocation) {
          const tran = this.dataSource.data.data.find(
            (t) => t.transactionId === allocation.transactionId
          );
          if (tran) {
            allocation.transactionType = tran.transactionType;
            allocation.documentNumber = tran.documentNumber;
          } else {
            this.transactionService
              .getTransaction(allocation.transactionId)
              .subscribe((result) => {
                allocation.transactionType = result.transactionType;
                allocation.documentNumber = String.isNullOrEmpty(
                  result.rmaReference
                )
                  ? result.bankReference
                  : result.rmaReference;
              });
          }
        }
      });
    } else if (row.linkedTransactions) {
      row.linkedTransactions.forEach((linkedTran) => {
        if (linkedTran) {
          const tran = this.dataSource.data.data.find(
            (t) => t.transactionId === linkedTran.transactionId
          );
          if (!tran || String.isNullOrEmpty(linkedTran.documentNumber)) {
            this.transactionService
              .getTransaction(linkedTran.transactionId)
              .subscribe((result) => {
                linkedTran.transactionType = result.transactionType;
                linkedTran.documentNumber = String.isNullOrEmpty(
                  result.rmaReference
                )
                  ? result.bankReference
                  : result.rmaReference;
              });
          }
        }
      });
    }

    const dialogRef = this.dialog.open(TransactionViewDialogComponent, {
      width: "1300px",
      data: { transaction: row },
    });

    dialogRef.afterClosed().subscribe((allocation) => {
      if (allocation) {
        const invoiceTran = this.dataSource.data.data.find(
          (t) => t.transactionId === row.transactionId
        );
        invoiceTran.balance = invoiceTran.balance + allocation.amount;
        invoiceTran.invoiceAllocations.find(
          (ia) => ia.invoiceAllocationId === allocation.invoiceAllocationId
        ).isDeleted = allocation.isDeleted;

        const creditTran = this.dataSource.data.data.find(
          (t) => t.transactionId === allocation.transactionId
        );
        creditTran.balance = creditTran.balance - allocation.amount;

        this.dataSource.getDataSubject.next(this.dataSource.data.data);
      }
    });
  }

  closeTransactionViewDialog() {
    this.dialog.closeAll();
  }

  public getPolicyNumber(statement: Transaction): string {
    const transactionTypeDesc = this.getTransactionTypeDesc(
      statement.transactionType
    );
    if (transactionTypeDesc) {
      if (transactionTypeDesc.toLowerCase() === 'invoice') {
        if (statement.reference && statement.reference.startsWith('0')) {
          return statement.reference;
        }
        else {
          return null
        }
      }
      else if (transactionTypeDesc.toLowerCase() == 'CreditNoteDebtAdjustment') {
        return statement.reference;
      }
      else {
        return null;
      }
    }
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  getTransactionTypeDescName(id: TransactionTypeEnum): string {
    if (TransactionTypeEnum.Invoice) {
      this.showbothinterestpremium = true;
      this.showinterest = true;
      this.showpremium = true;
    }
    if (TransactionTypeEnum.CreditNote || TransactionTypeEnum.CreditNoteDebtAdjustment) {
      this.showredebt = true;
    }
    if (TransactionTypeEnum.Interest) {
      this.showreinterest;
    }
    const result = TransactionTypeEnum[id];
    if (result) {
      return this.splitPascalCaseWord(result);
    }
    return "";
  }

  applyFilters(): void {
    const searchRequest = new TransactionSearchRequest();
    searchRequest.policyId = this.policyId;
    searchRequest.startDate = this.datePipe.transform(
      this.startDate,
      "yyyy-MM-dd"
    );
    searchRequest.endDate = this.datePipe.transform(this.endDate, "yyyy-MM-dd");
    searchRequest.transactionType = this.selectedTransactionType;
    this.loadData(searchRequest);
  }

  search() {
    this.paginator.pageIndex = 0;
    this.searchData();
  }

  searchData(): void {
    const searchRequest = new TransactionSearchRequest();
    searchRequest.policyId = this.policyId;
    searchRequest.startDate = this.datePipe.transform(
      this.policyInceptionDate,
      "yyyy-MM-dd"
    );
    searchRequest.endDate = "2999-12-31";
    searchRequest.query = this.filter.nativeElement.value;
    this.loadData(searchRequest);
  }

  reset() {
    this.filter.nativeElement.value = "";
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
    this.selectedTransactionType = TransactionTypeEnum.All;
    this.applyFilters();
  }

  transactionTypeChanged($event: any) {
    this.selectedTransactionType = $event.value;
  }

  getFinPayee() {
    this.rolePlayerService
      .getFinPayee(this.searchAccountResults.rolePlayerId)
      .pipe(
        tap((debtor) => {
          this.debtor = debtor;
          this.referralItemTypeReference = '(' + this.debtor.finPayeNumber + ') ';
        })
      )
      .subscribe();
  }

  getDebtorStatusEnumDescription(enumValue: number) {
    const result = DebtorStatusEnum[enumValue];
    if (result) {
      return this.splitPascalCaseWord(result);
    }
    return "";
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(" ");
  }

  updateDebtor(debtor: FinPayee) {
    debtor.debtorStatus = this.selectedDebtorStatus;
    this.billingService.updateTheDebtorStatus(debtor.rolePlayerId, debtor.debtorStatus).subscribe((result) => {
      this.isLoading$.next(false);
      this.getInterestIndicator();
      this.toastr.successToastr("Debtor status successfully updated");
    });
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: "40%",
      disableClose: true,
      data: {
        title: "Update Debtor Status?",
        text: `Are you sure you want to change the status of this debtor to ${this.getDebtorStatusEnumDescription(
          this.selectedDebtorStatus
        )}?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading$.next(true);
        this.updateDebtorCategoryStatus(this.debtor);
      } else {
        this.form.controls.debtorStatus.reset();
      }
    });
  }

  openResetStatusConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Reset Status`,
        text: `If you proceed, debtor status will be reset. Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading$.next(true);
        this.updateDebtorCategoryStatus(this.debtor);
      } else {
        this.form.controls.debtorStatus.reset();
      }
    });
  }

  resetStatus() {
    this.selectedDebtorStatus = null;
    this.openResetStatusConfirmationDialog();
  }

  debtorStatusChanged($event: any) {
    this.selectedDebtorStatus = $event.value;
    this.openConfirmationDialog();
  }

  public getDcoument(createdDate: Date, transactionDate: Date): Date {
    if (transactionDate > createdDate) {
      return transactionDate;
    }
    else {
      return createdDate;
    }
  }

  public getInterestIndicator() {
    this.billingService.getBillingInterestIndicatorByRolePlayerId(this.searchAccountResults.rolePlayerId)
      .subscribe((result) => {
        if (result && result.rolePlayerId > 0) {
          this.interestIndicator = result;
        }
        else {
          this.interestIndicator = new InterestIndicator();
          this.interestIndicator.rolePlayerId = this.searchAccountResults.rolePlayerId;
        }
      });
  }

  policiesSelected($event: PolicyProductCategory[]) {
    const selectedPolicies: PolicyProductCategory[] = $event;
    const policy = selectedPolicies[0];
    this.selectedProductCategoryId = ProductCategoryTypeEnum[policy.productDescription.replace(/ /g, '')]; 
   }
 
 
   updateDebtorCategoryStatus(debtor: FinPayee) {    
       this.billingService.updateDebtorCategoryStatus(debtor.rolePlayerId, this.selectedProductCategoryId,this.selectedDebtorStatus).subscribe((result) => {
         this.isLoading$.next(false);
         this.getInterestIndicator();
         this.toastr.successToastr("Debtor status successfully updated");
       });    
   }
}
