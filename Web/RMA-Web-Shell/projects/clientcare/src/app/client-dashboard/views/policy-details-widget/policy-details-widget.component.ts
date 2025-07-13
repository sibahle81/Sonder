import { IndustryClassEnum } from '../../../../../../shared-models-lib/src/lib/enums/industry-class.enum';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PolicyService } from '../../../policy-manager/shared/Services/policy.service';
import { Policy } from '../../../policy-manager/shared/entities/policy';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyStatusEnum } from '../../../policy-manager/shared/enums/policy-status.enum';
import { PolicyInsuredLife } from '../../../policy-manager/shared/entities/policy-insured-life';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { RolePlayerPolicy } from '../../../policy-manager/shared/entities/role-player-policy';
import { InsuredLifeStatusEnum } from '../../../policy-manager/shared/enums/insured-life-status.enum';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { BrokerageContact } from '../../../broker-manager/models/brokerage-contact';
import { ContactTypeEnum } from '../../../broker-manager/models/enums/contact-type.enum';
import { RolePlayerService } from '../../../policy-manager/shared/Services/roleplayer.service';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { BankingPurposeEnum } from '../../../policy-manager/shared/enums/banking-purpose.enum';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { UserWizardListComponent } from 'projects/shared-components-lib/src/lib/wizard/views/user-wizard-list/user-wizard-list.component';
import { PolicyDocumentsComponent } from '../../../policy-manager/views/policy-documents/policy-documents.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { Statement } from 'projects/fincare/src/app/shared/models/statement';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { Contact } from '../../../client-manager/shared/Entities/contact';
import { ClaimNote } from 'projects/claimcare/src/app/claim-manager/shared/entities/claim-note';
import { PolicyMemberWidgetComponent } from '../policy-member-widget/policy-member-widget.component';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { RolePlayerContact } from '../../../member-manager/models/roleplayer-contact';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GeneralAuditDialogComponent } from '../../../shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { PolicyItemTypeEnum } from '../../../policy-manager/shared/enums/policy-item-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-policy-details-widget',
  templateUrl: './policy-details-widget.component.html',
  styleUrls: ['./policy-details-widget.component.css']
})

export class PolicyDetailsWidgetComponent implements OnInit {

  @ViewChild(UserWizardListComponent, { static: false }) userWizardListComponent: UserWizardListComponent;
  @ViewChild(PolicyDocumentsComponent, { static: false }) documentComponent: PolicyDocumentsComponent;
  @ViewChild(PolicyMemberWidgetComponent, { static: false }) policyMembersComponent: PolicyMemberWidgetComponent;
  @ViewChild(NotesComponent, { static: false }) notesComponent: NotesComponent;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() isClaimsView: boolean;
  @Output() policySelected: EventEmitter<Policy> = new EventEmitter();
  @Input() isWizard = false;
  backLink = '/clientcare/member-manager/member-search';

  isLoadingPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingPolicy$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: FormGroup;
  requiredPermission = 'Manage Member Banking Details';
  hasPermission = true;
  isChildPolicy = true;
  rolePlayerId: number;
  policyId: number;
  policyNumber: string;
  roleplayerPolicies: RolePlayerPolicy[];
  policy: Policy;
  policyStatusText: string;
  rolePlayerBankingDetail: RolePlayerBankingDetail;
  mainMember: PolicyInsuredLife;
  clientName: string;
  broker: Brokerage;
  brokerageContact: BrokerageContact;
  hasTransactions: boolean;
  selectedDocumentSetId = DocumentSetEnum.PolicyCaseIndividual;
  claims: Claim[] = [];
  claimsNotes: ClaimNote[] = [];
  statements: Statement[];
  contact: Contact;
  redPolicyStatus = ['Cancelled', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up'];
  amberPolicyStatus = ['Paused', 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Reinstatement', 'Pre Legal'];
  greenPolicyStatus = ['Active', 'Free Cover'];
  bluePolicyStatus = ['Transferred', 'Reinstated', 'Premium Waivered', 'Premium Waived', 'Pending Release', 'Released'];
  displayedColumns = ['month', 'description', 'debit', 'credit'];
  finPayeeClass = '';
  MemberContact: RolePlayerContact;
  isPolicyExist = true;
  annualPremium = 0.00;
  monthlyPremium = 0.00;
  datasource = new MatTableDataSource<Statement>();
  payments: PagedRequestResult<Statement> = { data: [], page: 0, pageCount: 0, pageSize: 5, rowCount: 0 };
  failedMessage = '';
  rowCount = 0;

  get getBrokerageContactName(): string {
    if (!this.brokerageContact) { return ''; }
    return `${this.brokerageContact.firstName} ${this.brokerageContact.lastName}`;
  }

  get getBrokarageTelephoneNumber(): string {
    if (!this.brokerageContact) { return ''; }
    return this.brokerageContact.telephoneNumber;
  }

  get getBrokerageMobileNumber(): string {
    if (!this.brokerageContact) { return ''; }
    return this.brokerageContact.mobileNumber;
  }

  get getBrokerageEmailAddress(): string {
    if (!this.brokerageContact) { return ''; }
    return this.brokerageContact.email;
  }

  constructor(
    public readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly policyService: PolicyService,
    private readonly brokerageService: BrokerageService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: FormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog
  ) {
    this.isClaimsView = false;
  }

  ngOnInit() {
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.datasource.paginator = this.paginator;
    this.activatedRoute.params.subscribe((params: any) => {
      this.createForm();
      if (params.id) {
        this.rolePlayerId = params.id as number;
        this.getRoleplayerPolicies(this.rolePlayerId);
        this.getPolicyOwner();
      }
    });
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  createForm() {
    this.form = this.formBuilder.group({
      documentSets: new FormControl(''),
    });
  }

  getRoleplayerPolicies(roleplayerId: number) {

    this.isLoadingPolicies$.next(true);
    this.policyService.getPoliciesByPolicyOwner(roleplayerId).subscribe(results => {
      if (results.length === 0) {
        this.isLoadingPolicies$.next(false);
        this.isLoadingPolicy$.next(false);
        this.isPolicyExist = false;
      } else {
        this.roleplayerPolicies = results;
        this.isLoadingPolicies$.next(false);
        // set first policy for this roleplayer as default as a roleplayer may have multiple
        this.getPolicyDetails(results[0].policyId);
      }
    }, error => { this.alertService.error(error.message); this.isLoadingPolicies$.next(false); });
  }

  getPolicyOwner() {
    this.rolePlayerService.getRolePlayer(this.rolePlayerId).subscribe(result => {
      this.MemberContact = result.rolePlayerContacts.find(x => x.contactDesignationType === ContactDesignationTypeEnum.PrimaryContact);
    });
  }

  getPolicyDetails(policyId: number) {
    this.isLoadingPolicy$.next(true);
    this.policyId = policyId;
    this.policyService.getPolicy(policyId).subscribe(result => {
      this.policy = result;
      this.policySelected.emit(this.policy);
      this.clientName = this.policy.clientName;
      this.policyNumber = this.policy.policyNumber;
      this.getAccountHistory(policyId);
      this.getBroker(policyId);
      this.getBanking(policyId);
      this.getFinPayeeDetails();

      if (this.policy.policyOwner && this.policy.policyOwner.company) {
        this.isChildPolicy = false;
      } else {
        this.isChildPolicy = true;
      }
      this.policyMembersComponent.isChildPolicy = this.isChildPolicy;

      this.annualPremium = this.policy.annualPremium;
      this.monthlyPremium = this.policy.installmentPremium;
      this.policyMembersComponent.loadMembers(this.policyId);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }

  getPremium(premium: number, commissionPercentage: number, adminPercentage: number): number {
    const officePremium = premium / (1 - commissionPercentage);
    const commission = officePremium - premium;
    const adminFee = premium * adminPercentage;
    return premium + commission + adminFee;
  }

  getBroker(policyId: number) {
    this.brokerageService.getBrokerage(this.policy.brokerageId).subscribe(result => {
      this.broker = result;
      this.brokerageContact = result.contacts.find(s => s.contactType === ContactTypeEnum.BrokerContact);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }

  getAccountHistory(policyId: number) {
    this.invoiceService.getStatementByPolicyPaged(policyId, this.payments.page + 1, this.payments.pageSize)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.isLoadingPolicy$.next(false))
      ).subscribe(
        (result: PagedRequestResult<Statement>) => {
          this.datasource.data = result.data;
          this.rowCount = result.rowCount;
        }
      )
  }

  getBanking(policyId: number) {
    this.rolePlayerService.getBankingDetailsByRolePlayerId(this.rolePlayerId).subscribe(results => {
      const mostRecentDate = new Date(Math.max.apply(null, results.map(e => {
        return new Date(e.effectiveDate);
      })));
      this.rolePlayerBankingDetail = results.filter(e => { const d = new Date(e.effectiveDate); return d.getTime() === mostRecentDate.getTime(); })[0];
      this.getNotes(policyId);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }

  documentSetChanged(documentSetId: number) {
    this.selectedDocumentSetId = documentSetId;
    this.documentComponent.documentSetId = this.selectedDocumentSetId;
    this.documentComponent.getDocuments();
  }

  getDefaultDocumentSet() {
    if (this.mainMember) {
      this.selectedDocumentSetId = this.mainMember.rolePlayer.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person
        ? DocumentSetEnum.PolicyDocumentsIndividual
        : DocumentSetEnum.PolicyDocumentsGroup;
    }
  }

  getNotes(policyId: number) {
    const request = new NotesRequest(ServiceTypeEnum.PolicyManager, 'Policy', policyId);
    this.notesComponent.getData(request);
    this.getClaims(policyId);
  }

  getClaims(policyId: number) {
    this.claimService.getClaimsByPolicyId(policyId).subscribe(results => {
      this.claims = results;
      if (this.isClaimsView) {
        this.claimService.GetNotesByInsuredLife(this.rolePlayerId).subscribe(notes => {
          this.claimsNotes = notes;
        });
      }
      this.getDefaultDocumentSet();
      this.isLoadingPolicy$.next(false);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }

  getStatus(policyStatusId: number): string {
    const statusText = PolicyStatusEnum[policyStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getInsuredLifeStatus(insuredLifeStatusId: number): string {
    const statusText = InsuredLifeStatusEnum[insuredLifeStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getClaimStatus(claimtatusId: number): string {
    const statusText = ClaimStatusEnum[claimtatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getRelation(relationId: number): string {
    const statusText = RolePlayerTypeEnum[relationId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getAccountType(accountTypeId: number): string {
    const statusText = BankAccountTypeEnum[accountTypeId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getPurpose(purposeId: number): string {
    const statusText = BankingPurposeEnum[purposeId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getIsAlive(date: Date): boolean {
    return date ? true : false;
  }

  togglePolicy(policyId: number) {
    this.getPolicyDetails(policyId);
  }

  gotoBrokerManager() {
    this.router.navigateByUrl(`/clientcare/broker-manager/brokerage-details/${this.broker.id}`);
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  getFinPayeeDetails() {
    if (this.policy && this.policy.policyOwner.company && this.policy.policyOwner.company.industryClass) {
      this.finPayeeClass = IndustryClassEnum[this.policy.policyOwner.company.industryClass];
    } else {
      this.finPayeeClass = 'N/A';
    }
  }

  public formatPercentage(value: number): number {
    const result = (value * 100.0).toFixed(4);
    return parseFloat(result);
  }

  handlePageEvent(event: PageEvent) {
    this.payments.page = event.pageIndex;
    this.payments.pageSize = event.pageSize;
    this.getAccountHistory(this.policyId);
  }

  openAuditDialog(policy: Policy) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.Policy,
        itemId: policy.policyId,
        heading: 'Policy Details Audit',
        propertiesToDisplay: ['BrokerageId', 'ProductOptionId', 'RepresentativeId', 'JuristicRepresentativeId', 'PolicyOwnerId', 'PolicyPayeeId', 'PaymentFrequency', 'PaymentMethod',
        'PolicyNumber', 'PolicyInceptionDate', 'ExpiryDate', 'CancellationDate', 'FirstInstallmentDate', 'LastInstallmentDate', 'RegularInstallmentDayOfMonth', 'DecemberInstallmentDayOfMonth',
        'PolicyStatus', 'AnnualPremium', 'InstallmentPremium', 'CommissionPercentage', 'AdminPercentage', 'PolicyCancelReason', 'ClientReference', 'LastLapsedDate', 'LapsedCount', 'LastReinstateDate',
        'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
      }
    });
  }
}
