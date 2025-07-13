import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { BehaviorSubject } from 'rxjs';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { MemberService } from '../../../member-manager/services/member.service';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { ComplianceResult } from '../../../policy-manager/shared/entities/compliance-result';
import { QuoteViewDialogComponent } from 'projects/member/src/app/member-manager/views/member-home/quote-view-dialog/quote-view-dialog.component';
import { QuoteV2 } from '../../../quote-manager/models/quoteV2';
import { MatDialog } from '@angular/material/dialog';
import { DeclarationService } from '../../../member-manager/services/declaration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { Company } from '../../../policy-manager/shared/entities/company';
import { Router } from '@angular/router';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { KeyValue } from '@angular/common';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'member-view',
  templateUrl: './member-view.component.html',
  styleUrls: ['./member-view.component.css']
})
export class MemberViewComponent extends PermissionHelper implements OnChanges {
  currentUser: User;

  viewPermission = 'View Member';
  viewSlaPermission = 'View SLA';
  manageLinkedUsersPermission = 'Manage Linked Users';
  viewQuotesPermission = 'View Quote';
  viewAuditPermission = 'View Audits';

  @Input() rolePlayerId: number;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() triggerRefresh: boolean;

  // optional inputs
  @Input() expanded = false; // will auto expand the panel if set to true
  @Input() showMinimumDetails = true; // will show only the following tabs if set to true (details, contact, address, banking, notes and documents) if set to true

  @Input() selectedParentTab = 0; // sets the default parent tab
  @Input() selectedChildTab = 0; // sets the selected parents default child tab

  @Input() hideMenuBar = false; // will hide the entire menu-bar and all menu bar options if set to true --> overrides [hideExpandOption]
  @Input() hideExpandOption = false; // will hide the visibility option if set to true

  @Output() rolePlayerContextEmit: EventEmitter<RolePlayer> = new EventEmitter();
  @Output() complianceResultEmit: EventEmitter<ComplianceResult> = new EventEmitter();
  @Output() refreshEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  rolePlayer: RolePlayer;

  documentSystemName = DocumentSystemNameEnum.MemberManager;
  slaItemType = SLAItemTypeEnum.Member;

  _new = MemberStatusEnum.New;
  activeWithoutPolicies = MemberStatusEnum.ActiveWithoutPolicies;

  complianceResult: ComplianceResult;

  mining = IndustryClassEnum.Mining;
  metals = IndustryClassEnum.Metals;

  parentTabIndex = 0;
  childTabIndex = 0;

  currentCoverPeriodEndDate: Date;

  holdingCompanyLevel = CompanyLevelEnum.HoldingCompany;
  subsidiaryLevel = CompanyLevelEnum.Subsidiary;
  holdingCompany: RolePlayer;

  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Member;
  referralItemTypeReference: string;

  rolePlayerContactOptions: KeyValue<string, number>[];

  remittanceReport: KeyValue<string, string> = { key: 'Remittance', value: 'RMA.Reports.FinCare/Remittance/RMARemittanceMemberV2Report' };
  remittanceParameters: KeyValue<string, string>[];

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');

  constructor(
    private readonly router: Router,
    private readonly memberService: MemberService,
    private readonly declarationService: DeclarationService,
    private readonly authService: AuthService,
    public dialog: MatDialog
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.remittanceParameters = [ { key: 'RolePlayerId', value: this.rolePlayerId.toString() }];

      this.getLookups();
    }
  }

  getLookups() {
    this.rolePlayerContactOptions = [
      { key: 'Member', value: this.rolePlayerId }
    ];

    this.getRolePlayer();
  }

  getRolePlayer() {
    this.isLoading$.next(true);
    this.memberService.getMember(this.rolePlayerId).subscribe(result => {
      this.rolePlayer = result;
      this.referralItemTypeReference = this.rolePlayer.finPayee ? '(' + this.rolePlayer.finPayee.finPayeNumber + ') ' + this.rolePlayer.displayName : this.rolePlayer.displayName;
      this.setDefaultTabs();
      this.rolePlayerContextEmit.emit(this.rolePlayer);
      if (this.rolePlayer.company) {
        this.getIndustryClassDeclarationConfiguration();
      }
    });
  }

  getIndustryClassDeclarationConfiguration() {
    this.currentCoverPeriodEndDate = null;
    this.declarationService.getDefaultRenewalPeriodStartDate(+this.rolePlayer.company.industryClass, new Date()).subscribe({
      next: (result) => {
        if (result) {
          const date = new Date(new Date(result).getFullYear() + 1, new Date(result).getMonth(), new Date(result).getDate());
          this.currentCoverPeriodEndDate = new Date(date.setDate(date.getDate() - 1));
        }
        this.isLoading$.next(false);
      },
      error: (response: HttpErrorResponse) => {
        this.isLoading$.next(false);
      }
    });
  }

  showDetail() {
    this.expanded = !this.expanded;
  }

  setComplianceResult($event: ComplianceResult) {
    const skipTabSet = this.complianceResult != null;

    this.complianceResult = $event;

    if (!skipTabSet) {
      if (!this.complianceResult.isDeclarationCompliant) {
        this.parentTabIndex = 0;
        this.childTabIndex = 0;
      } else if (!this.complianceResult.isBillingCompliant) {
        this.parentTabIndex = 0;
        this.childTabIndex = 1;
      }
    }

    this.complianceResultEmit.emit(this.complianceResult);
  }

  setHoldingCompany($event: RolePlayer) {
    this.holdingCompany = $event;
  }

  openQuoteDialog($event: QuoteV2) {
    const dialogRef = this.dialog.open(QuoteViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      disableClose: true,
      data: {
        quoteId: +$event.quoteId
      }
    });
  }

  refresh($event: boolean) {
    this.triggerRefresh = !this.triggerRefresh;
    this.refreshEmit.emit(this.triggerRefresh);
  }

  setDefaultTabs() {
    this.parentTabIndex = this.selectedParentTab;
    this.childTabIndex = this.selectedChildTab;
  }

  setSelectedSubsidiary($event: Company) {
    this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${$event.rolePlayerId}`]);
  }

  navigateToHoldingCompany() {
    if (!this.holdingCompany) { return; }

    if (this.holdingCompany.finPayee) {
      this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${this.holdingCompany.rolePlayerId}`]);
    } else {
      this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${this.holdingCompany.rolePlayerId}`]);
    }
  }

  getIndustry(industry: number): string {
    return this.formatText(IndustryTypeEnum[industry]);
  }

  getIndustryClass(industryClass: number): string {
    return this.formatText(IndustryClassEnum[industryClass]);
  }

  getClientType(clientType: ClientTypeEnum): string {
    return this.formatText(ClientTypeEnum[clientType]);
  }

  getRolePlayerIdentificationType(rolePlayerIdentificationType: RolePlayerIdentificationTypeEnum): string {
    return this.formatText(RolePlayerIdentificationTypeEnum[rolePlayerIdentificationType]);
  }

  getMemberStatus(memberStatus: MemberStatusEnum): string {
    return this.formatText(MemberStatusEnum[memberStatus]);
  }

  getDebtorStatus(debtorStatus: DebtorStatusEnum): string {
    return this.formatText(DebtorStatusEnum[debtorStatus]);
  }

  getCompanyLevel(companyLevel: CompanyLevelEnum): string {
    return this.formatText(CompanyLevelEnum[companyLevel]);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
