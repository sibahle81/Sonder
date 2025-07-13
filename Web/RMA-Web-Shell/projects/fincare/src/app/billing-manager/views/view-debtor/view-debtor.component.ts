import { Component, OnInit, ViewChild, Output, Input } from '@angular/core';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyInsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-insured-life';
import { BehaviorSubject } from 'rxjs';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { InsuredLifeStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/insured-life-status.enum';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { BankingPurposeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/banking-purpose.enum';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { Statement } from '../../../shared/models/statement';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Invoice } from '../../../shared/models/invoice';
import { InvoicePaymentAllocation } from '../../models/invoicePaymentAllocation';
import { Router } from '@angular/router';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { BrokerageContact } from 'projects/clientcare/src/app/broker-manager/models/brokerage-contact';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { ContactTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/contact-type.enum';
import { Contact } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { TransactionsService } from '../../services/transactions.service';
// import { PolicyMemberWidgetComponent } from 'projects/clientcare/src/app/client-dashboard/views/policy-member-widget/policy-member-widget.component';
import { DashboardNoteComponent } from '../dashboard-note/dashboard-note.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ViewDocumentsComponent } from '../view-documents/view-documents.component';
import { FinPayee } from '../../../shared/models/finpayee';
import { tap } from 'rxjs/operators';
import { DebtorStatusEnum } from '../../../shared/enum/debtor-status.enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'app-view-debtor',
  templateUrl: './view-debtor.component.html',
  styleUrls: ['./view-debtor.component.css']
})
export class ViewDebtorComponent implements OnInit {
  rolePlayerId: number;
  showDebtor = false;
  policyId: number;
  roleplayerPolicies: RolePlayerPolicy[];
  policy: Policy;
  policyStatusText: string;
  insuredLives: PolicyInsuredLife[];
  claims: Claim[];
  rolePlayerBankingDetails: RolePlayerBankingDetail[];
  rolePlayerBankingDetail: RolePlayerBankingDetail;
  mainMember: PolicyInsuredLife;
  hasTransactions: boolean;
  statements: Statement[];
  invoices: Invoice[];
  clientName: string;
  rolePlayerAddress: RolePlayerAddress[];
  address: RolePlayerAddress;
  invoicePaymentAllocations: InvoicePaymentAllocation[];
  selectedDocumentSetId = DocumentSetEnum.PolicyMaintanance;
  isLoadingPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingPolicy$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  redPolicyStatus = ['Cancelled', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up'];
  amberPolicyStatus = ['Paused', 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Reinstatement', 'Pre Legal', 'Pending Release', 'Released'];
  greenPolicyStatus = ['Active', 'Free Cover'];
  bluePolicyStatus = ['Transferred', 'Reinstated', 'Premium Waivered', 'Premium Waived'];
  debtorNetBalance: number;
  isAddNew = 0;
  // @ViewChild(PolicyMemberWidgetComponent, { static: false }) policyMembersComponent: PolicyMemberWidgetComponent;
  @ViewChild(ViewDocumentsComponent, { static: false }) documentComponent: ViewDocumentsComponent;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @Output() _roleplayerId: number;
  form: UntypedFormGroup;
  broker: Brokerage;
  brokerageContact: BrokerageContact;
  representative: Representative;
  contact: Contact;
  company: Company;
  requestCode: string;
  docKeyValue = 'FinPayeNumber';
  searchAccountResults: SearchAccountResults;
  debtor: FinPayee;
  @ViewChild(DashboardNoteComponent, { static: false }) dashboardNoteComponent: DashboardNoteComponent;
  constructor(
    private readonly policyService: PolicyService,
    private readonly insuredLifeService: InsuredLifeService,
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly invoiceService: InvoiceService,
    private readonly brokerageService: BrokerageService,
    private readonly transactionService: TransactionsService,
    private readonly router: Router,
    private readonly toastr: ToastrManager
  ) { }

  ngOnInit() {
    this.createForm();
    this.isAddNew = 0;
    this.searchAccountResults = new SearchAccountResults();
  }

  accountSearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.searchAccountResults = searchAccountResults;
    this.showDebtor = true;
    this.clientName = searchAccountResults.displayName;
    this.rolePlayerId = searchAccountResults.rolePlayerId;
    this.getRoleplayerPolicies(this.rolePlayerId);
    this._roleplayerId = this.rolePlayerId;

    this.getFinPayee(this.rolePlayerId);

    if (!(this.requestCode) || this.requestCode === '') {
      this.requestCode = searchAccountResults.finPayeNumber;
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      documentSets: new UntypedFormControl(''),
    });
  }


  getRoleplayerPolicies(roleplayerId: number) {
    this.isLoadingPolicies$.next(true);
    this.policyService.getPoliciesByPolicyOwner(roleplayerId).subscribe(results => {
      if (results.length === 0) {
        this.toastr.errorToastr('The selected client has no policies, Please select a client that has a policy', 'Notification');

      } else {
        this.roleplayerPolicies = results;
        this.isLoadingPolicies$.next(false);
        // set first policy for this roleplayer as default as a roleplayer may have multiple
        this.getPolicyDetails(results[0].policyId);
      }
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPolicies$.next(false); });
  }

  getPolicyDetails(policyId: number) {
    this.isLoadingPolicy$.next(true);
    this.policyId = policyId;
    this.policyService.getPolicy(policyId).subscribe(
      result => {
        this.policy = result;
        this.isLoadingPolicy$.next(false);
        this.getPolicyOwner();
        this.getInsuredLives(policyId);
        this.getBanking(policyId);
        this.getClaims(policyId);
        this.getAccountHistory(policyId);
        this.getPendingInvoices(policyId);
        this.getUnpaidInvoices(policyId);
        this.getBroker(policyId);
      },
      error => {
        this.toastr.errorToastr(error.message); this.isLoadingPolicy$.next(false);
      }
    );
    // this.policyMembersComponent.loadMembers(this.policyId);
  }

  getAccountHistory(policyId: number) {
    this.invoiceService.getStatementByPolicy(policyId).subscribe(statements => {
      this.statements = statements.filter(x => x.transactionType !== 'ClaimRecoveryInvoice' && x.transactionType !== 'ClaimRecoveryPayment');
      this.getDebtorNetBalance();
      this.isLoadingPolicy$.next(false);
    });
  }

  getClaimStatus(claimtatusId: number): string {
    const statusText = ClaimStatusEnum[claimtatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getInsuredLives(policyId: number) {
    this.insuredLifeService.getPolicyInsuredLives(policyId).subscribe(results => {
      this.insuredLives = results.filter(s => s.rolePlayer.person !== null);
      this.mainMember = this.insuredLives.find(s => s.rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf);

      if (!this.mainMember) {
        this.mainMember = this.insuredLives.find(s => s.rolePlayerTypeId === RolePlayerTypeEnum.PolicyOwner);
      }

      this.getDefaultDocumentSet();

      this.policy.clientName = this.mainMember ? this.mainMember.rolePlayer.displayName : 'N/A';

      this.isLoadingPolicy$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPolicy$.next(false); });
  }

  getPolicyOwner() {
    this.rolePlayerService.getRolePlayer(this.rolePlayerId).subscribe(result => {
      this.address = new RolePlayerAddress();
      this.address = result.rolePlayerAddresses[0];
      this.contact = new Contact();
      this.contact.email = result.emailAddress;
      this.contact.mobileNumber = result.cellNumber;
      this.contact.telephoneNumber = result.tellNumber;
      this.contact.name = this.clientName;
      this.company = new Company();
      this.company = result.company;
    });
  }

  getBroker(policyId: number) {
    this.brokerageService.getBrokerage(this.policy.brokerageId).subscribe(result => {
      this.brokerageContact = new BrokerageContact();
      this.representative = new Representative();
      this.broker = result;
      this.representative = result.representatives[0];
      this.brokerageContact = result.contacts.find(s => s.contactType === ContactTypeEnum.BrokerContact);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPolicy$.next(false); });
  }

  getBanking(policyId: number) {
    this.rolePlayerService.getBankingDetailsByRolePlayerId(this.rolePlayerId).subscribe(results => {
      const mostRecentDate = new Date(Math.max.apply(null, results.map(e => {
        return new Date(e.effectiveDate);
      })));
      this.rolePlayerBankingDetail = results.filter(e => { const d = new Date(e.effectiveDate); return d.getTime() === mostRecentDate.getTime(); })[0];
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPolicy$.next(false); });
  }

  documentSetChanged($event: number) {
    if ($event === DocumentSetEnum.InterBankTransfer || $event === DocumentSetEnum.CreditNoteReallocation
      || $event === DocumentSetEnum.MaintainRefundOverpayment || $event === DocumentSetEnum.CreditNoteReallocation) {
      this.docKeyValue = 'FinPayeNumber';
      this.requestCode = this.searchAccountResults.finPayeNumber;
    } else {
      this.docKeyValue = 'CaseCode';
      this.requestCode = this.searchAccountResults.policyNumber;
    }
    this.selectedDocumentSetId = $event;
    this.documentComponent.documentSetId = $event;
    this.documentComponent.keyName = this.docKeyValue;
    this.documentComponent.keyValue = this.requestCode;
    this.documentComponent.getDocuments();
  }

  getPendingInvoices(policyId: number) {
    this.invoiceService.getDebtorPendingInvoices(policyId).subscribe(invoices => {
      this.invoices = invoices;
      this.isLoadingPolicy$.next(false);
    });
  }

  getUnpaidInvoices(policyId: number) {
    this.invoiceService.getUnPaidInvoicesByPolicy(policyId).subscribe(invoicePaymentAllocations => {
      this.invoicePaymentAllocations = invoicePaymentAllocations;
      this.isLoadingPolicy$.next(false);
    });
  }

  getClaims(policyId: number) {
    this.invoiceService.getClaimByPolicy(policyId).subscribe(claims => {
      this.claims = claims;
      this.isLoadingPolicy$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPolicy$.next(false); });
  }

  getDefaultDocumentSet() {
    this.selectedDocumentSetId = DocumentSetEnum.InterBankTransfer;
  }

  getStatus(policyStatusId: number): string {
    const statusText = PolicyStatusEnum[policyStatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  togglePolicy(policyId: number) {
    this.getPolicyDetails(policyId);
  }

  getInsuredLifeStatus(insuredLifeStatusId: number): string {
    const statusText = InsuredLifeStatusEnum[insuredLifeStatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getRelation(relationId: number): string {
    const statusText = RolePlayerTypeEnum[relationId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getAccountType(accountTypeId: number): string {
    const statusText = BankAccountTypeEnum[accountTypeId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getPurpose(purposeId: number): string {
    const statusText = BankingPurposeEnum[purposeId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getDebtorNetBalance() {
    this.transactionService.getDebtorNetBalance(this.rolePlayerId).subscribe(debtorNetBalance => {
      this.debtorNetBalance = debtorNetBalance;
    });
  }

  loadDebtorAccountView(): void {
    this.router.navigate(['fincare/billing-manager/view-transaction', this.policy.policyId]);
  }

  addNote() {
    this.isAddNew = 1;
  }

  back() {
    this.showDebtor = false;
  }

  public getPolicyNumber(statement: Statement): string {
    return statement.transactionType.toLowerCase() === 'invoice' ? statement.reference : null;
  }

  public formatPercentage(value: number): number {
    const result = (value * 100.0).toFixed(4);
    return parseFloat(result);
  }

  getFinPayee(roleplayerId: number) {
    this.rolePlayerService.getFinPayee(roleplayerId).pipe(tap(debtor => {
      this.debtor = debtor;
    })).subscribe();
  }

  getDebtorStatusEnumDescription(enumValue: number) {
    const result = DebtorStatusEnum[enumValue];
    if (result) {
      return this.splitPascalCaseWord(result);
    }
    return '';
  }

  splitPascalCaseWord(word: string): string{
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }
}
