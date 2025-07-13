import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayerPolicyTransaction } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-transaction';
import { RolePlayerPolicyTransactionSearchDataSource } from './role-player-policy-transaction-search.datasource';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { RolePlayerPolicyTransactionStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-transaction-status.enum';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RolePlayerPolicyDeclarationStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-status.enum';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { MatDialog } from '@angular/material/dialog';
import { SsrsReportViewerDialogComponent } from '../../dialogs/ssrs-report-viewer-dialog/ssrs-report-viewer-dialog.component';
import { ComplianceResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/compliance-result';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerPolicyTransactionDetailDialogComponent } from './role-player-policy-transaction-detail-dialog/role-player-policy-transaction-detail-dialog.component';
import "src/app/shared/extensions/date.extensions";
import { RefreshService } from 'projects/clientcare/src/app/shared/refresh-service/refresh-service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
    selector: 'role-player-policy-transaction-search',
    templateUrl: './role-player-policy-transaction-search.component.html',
    styleUrls: ['./role-player-policy-transaction-search.component.css']
})

export class RolePlayerPolicyTransactionSearchComponent extends PermissionHelper implements OnInit, OnChanges, OnDestroy {

    editPermission = 'Release Member Invoices';
    viewAuditPermission = 'View Audits';

    currentUser: User;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    isLoadingAnnualPremium$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    @Input() rolePlayerId: number;
    // OR
    @Input() policyId: number;
    // If both inputs are supplied, then policyId will be used as default  

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    refreshSubscription: Subscription;

    dataSource: RolePlayerPolicyTransactionSearchDataSource;

    form: any;

    selectedRolePlayerPolicyTransactions: RolePlayerPolicyTransaction[];
    annualPremiumForCoverYear = 0;
    amountForSelectedPaymentCycle = 0;

    rolePlayerPolicyTransactions: RolePlayerPolicyTransaction[];
    rolePlayerPolicyDeclarations: RolePlayerPolicyDeclaration[];
    coverPeriods: number[];
    defaultCoverPeriod: number;

    invoices: Invoice[];
    industryClass: IndustryClassEnum;

    authorised = RolePlayerPolicyTransactionStatusEnum.Authorised;
    creditNote = TransactionTypeEnum.CreditNote;

    pending = InvoiceStatusEnum.Pending;
    queued = InvoiceStatusEnum.Queued;
    paid = InvoiceStatusEnum.Paid;
    partially = InvoiceStatusEnum.Partially;
    unpaid = InvoiceStatusEnum.Unpaid;
    allocated = InvoiceStatusEnum.Allocated;

    complianceResult: ComplianceResult;

    relatedRecordContext: Date;

    policy: Policy;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly declarationService: DeclarationService,
        private readonly memberService: MemberService,
        public dialog: MatDialog,
        private readonly policyService: PolicyService,
        private readonly refreshService: RefreshService,
        private readonly authService: AuthService
    ) {
        super();
        this.currentUser = this.authService.getCurrentUser();
        
        this.dataSource = new RolePlayerPolicyTransactionSearchDataSource(this.declarationService);

        this.refreshSubscription = this.refreshService.getRefreshPolicyCommand().subscribe
            (refresh => {
                this.reset();
            });
    }

    ngOnDestroy(): void {
        this.refreshSubscription.unsubscribe();
    }

    ngOnInit() {
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isLoading$.next(true);
        if (this.policyId && this.policyId > 0) {
            this.dataSource.policyId = this.policyId;
        } else {
            this.dataSource.rolePlayerId = this.rolePlayerId;
        }

        this.getIndustryClass();
    }

    getIndustryClass() {
        if (this.policyId) {
            this.policyService.getPolicy(this.policyId).subscribe(result => {
                this.policy = result;
                if (result.policyOwner && result.policyOwner.company) {
                    this.industryClass = result.policyOwner.company.industryClass;
                }
                this.getRolePlayerPolicyDeclarations();
            });
        } else {
            this.memberService.getMember(this.rolePlayerId).subscribe(result => {
                if (result && result.company) {
                    this.industryClass = result.company.industryClass;
                }
                this.getRolePlayerDeclarations();
            });
        }
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            coverPeriodFilter: [{ value: null, disabled: false }],
        });
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    coverPeriodFilterChanged($event: number) {
        this.dataSource.coverPeriod = +$event;
        if (this.policyId) {
            this.getRolePlayerPolicyTransactions();
        } else {
            this.getRolePlayerTransactions();
        }

        this.getData()
    }

    getRolePlayerPolicyTransactions() {
        this.isLoadingAnnualPremium$.next(true);

        this.invoices = [];

        this.declarationService.getRolePlayerPolicyTransactionsForCoverPeriod(this.policyId, this.dataSource.coverPeriod).subscribe(results => {
            this.annualPremiumForCoverYear = 0;

            if (results && results?.length > 0) {
                this.rolePlayerPolicyTransactions = results;
                results.forEach(s => {
                    this.annualPremiumForCoverYear += +s.totalAmount.toFixed(2);
                });
            }

            this.isLoadingAnnualPremium$.next(false);
        });
    }

    getRolePlayerTransactions() {
        this.isLoadingAnnualPremium$.next(true);

        this.invoices = [];

        this.declarationService.getRolePlayerTransactionsForCoverPeriod(this.rolePlayerId, this.dataSource.coverPeriod).subscribe(results => {
            this.annualPremiumForCoverYear = 0;

            if (results && results?.length > 0) {
                this.rolePlayerPolicyTransactions = results;
                results.forEach(s => {
                    this.annualPremiumForCoverYear += +s.totalAmount.toFixed(2);
                });
            }

            this.isLoadingAnnualPremium$.next(false);
        });
    }

    getTransactionType(transactionType: TransactionTypeEnum): string {
        return this.formatLookup(TransactionTypeEnum[+transactionType]);
    }

    getRolePlayerPolicyTransactionStatus(rolePlayerPolicyTransactionStatus: RolePlayerPolicyTransactionStatusEnum): string {
        return this.formatLookup(RolePlayerPolicyTransactionStatusEnum[+rolePlayerPolicyTransactionStatus]);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    formatMoney(value: string): string {
        return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

    rolePlayerPolicyTransactionSelected(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction) {
        if (!this.selectedRolePlayerPolicyTransactions) { this.selectedRolePlayerPolicyTransactions = []; }

        let index = this.selectedRolePlayerPolicyTransactions.findIndex(a => a.rolePlayerPolicyTransactionId === rolePlayerPolicyTransaction.rolePlayerPolicyTransactionId);
        if (index > -1) {
            this.selectedRolePlayerPolicyTransactions.splice(index, 1);
        } else {
            this.selectedRolePlayerPolicyTransactions.push(rolePlayerPolicyTransaction);
        }
    }

    isSelected($event: RolePlayerPolicyTransaction): boolean {
        return !this.selectedRolePlayerPolicyTransactions ? false : this.selectedRolePlayerPolicyTransactions.some(s => s.rolePlayerPolicyTransactionId == $event.rolePlayerPolicyTransactionId)
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
            width: '40%',
            disableClose: true,
            data: {
                title: `Release (${this.selectedRolePlayerPolicyTransactions?.length}) Invoice(s)?`,
                text: `${this.selectedRolePlayerPolicyTransactions?.length} selected invoice(s) will be released to collections. Are you sure you want to proceed?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.sendInvoices();
            }
        });
    }

    sendInvoices() {
        this.isLoading$.next(true);
        this.loadingMessage$.next('sending invoices...please wait');

        this.declarationService.sendInvoices(this.selectedRolePlayerPolicyTransactions).subscribe(() => {
            this.reset();
        });
    }

    reset() {
        this.isLoading$.next(true);
        this.selectedRolePlayerPolicyTransactions = null;
        this.relatedRecordContext = null;
        this.amountForSelectedPaymentCycle = 0;

        this.form.controls.coverPeriodFilter.reset();

        this.form.patchValue({
            coverPeriodFilter: this.defaultCoverPeriod
        });

        this.invoices = [];

        if (this.policyId) {
            this.getRolePlayerPolicyDeclarations();
        } else {
            this.getRolePlayerDeclarations();
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'select', show: this.userHasPermission(this.editPermission) },
            { def: 'policyId', show: !this.policyId || this.policyId <= 0 },
            { def: 'transactionType', show: true },
            { def: 'documentNumber', show: true },
            { def: 'effectiveDate', show: true },
            { def: 'totalAmount', show: true },
            { def: 'rolePlayerPolicyTransactionStatus', show: true },
            { def: 'documentDate', show: true },
            { def: 'sentDate', show: true },
            { def: 'invoiceStatus', show: true },
            { def: 'complianceStatus', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    getRolePlayerPolicyDeclarations() {
        this.declarationService.getRolePlayerPolicyDeclarations(this.policyId).subscribe(result => {
            if (result && result?.length > 0) {
                this.rolePlayerPolicyDeclarations = result.sort((a, b) => a.declarationYear - b.declarationYear);
                this.coverPeriods = [...new Set(this.rolePlayerPolicyDeclarations.map((item) => item.declarationYear))];

                const currentDeclaration = this.rolePlayerPolicyDeclarations.find(s => s.rolePlayerPolicyDeclarationStatus === RolePlayerPolicyDeclarationStatusEnum.Current);
                this.defaultCoverPeriod = currentDeclaration.declarationYear;

                if (this.industryClass) {
                    this.declarationService.getDefaultRenewalPeriodStartDate(this.industryClass, new Date()).subscribe(result => {
                        this.defaultCoverPeriod = result ? new Date(result).getFullYear() : currentDeclaration.declarationYear;
                        this.dataSource.coverPeriod = this.defaultCoverPeriod;

                        this.form.patchValue({
                            coverPeriodFilter: this.defaultCoverPeriod
                        });

                        this.getRolePlayerPolicyTransactions();

                        this.getData();
                        this.isLoading$.next(false);
                    });
                } else {
                    this.dataSource.coverPeriod = this.defaultCoverPeriod;

                    this.form.patchValue({
                        coverPeriodFilter: this.defaultCoverPeriod
                    });

                    this.getRolePlayerPolicyTransactions();

                    this.getData();
                    this.getComplianceStatus();
                }
            }
        });
    }

    getRolePlayerDeclarations() {
        this.declarationService.getRolePlayerDeclarations(this.rolePlayerId).subscribe(result => {
            if (result && result?.length > 0) {
                this.rolePlayerPolicyDeclarations = result.sort((a, b) => a.declarationYear - b.declarationYear);
                this.coverPeriods = [...new Set(this.rolePlayerPolicyDeclarations.map((item) => item.declarationYear))];

                const currentDeclaration = this.rolePlayerPolicyDeclarations.find(s => s.rolePlayerPolicyDeclarationStatus === RolePlayerPolicyDeclarationStatusEnum.Current);
                this.defaultCoverPeriod = currentDeclaration.declarationYear;

                if (this.industryClass) {
                    this.declarationService.getDefaultRenewalPeriodStartDate(this.industryClass, new Date()).subscribe(result => {
                        this.defaultCoverPeriod = result ? new Date(result).getFullYear() : currentDeclaration.declarationYear;
                        this.dataSource.coverPeriod = this.defaultCoverPeriod;

                        this.form.patchValue({
                            coverPeriodFilter: this.defaultCoverPeriod
                        });

                        this.getRolePlayerTransactions();

                        this.getData();
                        this.isLoading$.next(false);
                    });
                } else {
                    this.dataSource.coverPeriod = this.defaultCoverPeriod;

                    this.form.patchValue({
                        coverPeriodFilter: this.defaultCoverPeriod
                    });

                    this.getRolePlayerTransactions();

                    this.getData();
                    this.getComplianceStatus();
                }
            }
        });
    }

    addInvoice($event: Invoice) {
        if (!this.invoices) {
            this.invoices = [];
        }

        this.invoices.push($event);
    }

    checkCompliance(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction): boolean {
        if (this.invoices && this.invoices?.length > 0) {
            return this.invoices.some(s => s.invoiceNumber == rolePlayerPolicyTransaction.documentNumber);
        }

        return false;
    }

    getInvoice(documentNumber: string): Invoice {
        if (this.invoices && this.invoices?.length > 0) {
            return this.invoices.find(s => s.invoiceNumber == documentNumber);
        }
    }

    openRolePlayerPolicyTransactionAuditDialog(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
            width: '70%',
            data: {
                serviceType: ServiceTypeEnum.ClientManager,
                clientItemType: ClientItemTypeEnum.RolePlayerPolicyTransaction,
                itemId: rolePlayerPolicyTransaction.rolePlayerPolicyTransactionId,
                heading: `${this.getTransactionType(rolePlayerPolicyTransaction.transactionType)} ${rolePlayerPolicyTransaction.documentNumber} Audit`,
                propertiesToDisplay: ['TransactionType', 'TotalAmount', 'EffectiveDate', 'DocumentDate', 'SentDate', 'RolePlayerPolicyTransactionStatus']
            }
        });
    }

    canViewDocument(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction) {
        const invoice = this.getInvoice(rolePlayerPolicyTransaction.documentNumber);

        if (!invoice) {
            return false;
        }

        return rolePlayerPolicyTransaction.rolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Authorised && invoice.invoiceStatus != InvoiceStatusEnum.Queued;
    }

    openInvoiceViewDialog(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction) {
        const invoice = this.getInvoice(rolePlayerPolicyTransaction.documentNumber);

        if (invoice && invoice.invoiceId) {
            const parameters = [
                { key: 'invoiceId', value: invoice.invoiceId }
            ];

            const title = this.formatLookup(TransactionTypeEnum[rolePlayerPolicyTransaction.transactionType]) + ' ' + rolePlayerPolicyTransaction.documentNumber;
            const reportUrl = 'RMA.Reports.FinCare/RMACoidInvoice';
            const itemType = this.formatLookup(TransactionTypeEnum[rolePlayerPolicyTransaction.transactionType]);
            const itemId = invoice.invoiceId;

            this.openDialog(title, reportUrl, parameters, itemType, itemId);
        }
    }

    openDialog(title: string, reportUrl: string, parameters: any, itemType: string, itemId: number) {
        const dialogRef = this.dialog.open(SsrsReportViewerDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                title: title,
                reporturl: reportUrl,
                parameters: parameters,
                itemType: itemType,
                itemId: itemId,
                auditViewers: true // audit who views this document
            }
        });
    }

    getComplianceStatus() {
        if (this.policyId) {
            this.declarationService.getPolicyComplianceStatus(this.policyId).subscribe(result => {
                this.complianceResult = result;
                this.isLoading$.next(false);
            });
        } else {
            this.declarationService.getMemberComplianceStatus(this.rolePlayerId).subscribe(result => {
                this.complianceResult = result;
                this.isLoading$.next(false);
            });
        }
    }

    hasTermsArrangement(): boolean {
        if (this.complianceResult) {
            return this.complianceResult.debtorStatus && this.complianceResult.debtorStatus == DebtorStatusEnum.TermsArrangement;
        }
    }

    getInvoiceReferenceNumber(rolePlayerPolicyTransaction: RolePlayerPolicyTransaction): string {
        return rolePlayerPolicyTransaction.documentNumber && rolePlayerPolicyTransaction.rolePlayerPolicyTransactionStatus != RolePlayerPolicyTransactionStatusEnum.Unauthorised ? `REF:${rolePlayerPolicyTransaction.documentNumber.substring(3, rolePlayerPolicyTransaction.documentNumber?.length)}` : 'N/A';
    }

    setRelatedRecordContext($event: RolePlayerPolicyTransaction) {
        this.amountForSelectedPaymentCycle = 0;
        if ($event.effectiveDate == this.relatedRecordContext) {
            this.relatedRecordContext = null;
        } else {
            this.relatedRecordContext = $event.effectiveDate;
            this.rolePlayerPolicyTransactions.filter(s => s.effectiveDate == this.relatedRecordContext)?.forEach(s => {
                this.amountForSelectedPaymentCycle += +s.totalAmount.toFixed(2);
            });
        }
    }

    openRolePlayerTransactionDetailsDialog($event: RolePlayerPolicyTransaction) {
        const dialogRef = this.dialog.open(RolePlayerPolicyTransactionDetailDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                rolePlayerPolicyTransaction: $event
            }
        });
    }

    openCollectionsReportDialog() {
        let parameters = [];

        if (this.policyId) {
            parameters.push({ key: 'RolePlayerId', value: this.policy.policyOwnerId });
        } else {
            parameters.push({ key: 'RolePlayerId', value: this.rolePlayerId });
        }

        const dialogRef = this.dialog.open(SsrsReportViewerDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                title: 'Member Collections Report',
                reporturl: 'RMA.Reports.ClientCare.Member/Collections/RMAMemberCollectionsReport',
                parameters: parameters
            }
        });
    }
}

