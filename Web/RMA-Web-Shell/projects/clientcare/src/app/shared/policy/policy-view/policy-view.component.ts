import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BehaviorSubject } from 'rxjs';
import { PolicyStatusChangeAudit } from '../../../policy-manager/shared/entities/policy-status-change-audit';
import { CaseTypeEnum } from '../../../policy-manager/shared/enums/case-type.enum';
import { PolicyViewConfirmationDialogComponent } from './policy-view-confirmation-dialog/policy-view-confirmation-dialog.component';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PolicyCancelReasonEnum } from '../../../policy-manager/shared/enums/policy-cancel-reason.enum';
import { ReinstateReasonEnum } from '../../../policy-manager/shared/enums/reinstate-reason.enum';
import { DatePipe, KeyValue } from '@angular/common';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { ComplianceResult } from '../../../policy-manager/shared/entities/compliance-result';
import { ProductCategoryTypeEnum } from '../../../policy-manager/shared/enums/product-category-type.enum';
import { RefreshService } from '../../refresh-service/refresh-service';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.css']
})
export class PolicyViewComponent extends PermissionHelper implements OnChanges {

  requiredStartMaintainWizardPermission = 'Start RMA RML Policy Maintanance';
  requiredStartCancellationWizardPermission = 'Start RMA RML Policy Cancellation';
  requiredStartReinstateWizardPermission = 'Start RMA RML Policy Reinstatement';
  viewSlaPermission = 'View SLA';
  viewAuditPermission = 'View Audits';

  currentUser: User;

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');

  @Input() rolePlayerId: number;

  @Input() isWizard = false;
  @Input() defaultPolicyId: number; // optional input: if not set then the first policy in policies will be selected by default
  @Input() filteredPolicyIds: number[]; // optional input: if not set then all policies will show for rolePlayerId input

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isStartingWizard$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  maintenanceInProgressChecked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  maintenanceInProgress: boolean;
  reviewInProgressChecked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  reviewInProgress: boolean;
  activeWizards: Wizard[];

  selectedPolicy: Policy;
  policies: Policy[];

  active = PolicyStatusEnum.Active;
  pendingFirstPremium = PolicyStatusEnum.PendingFirstPremium;
  cancelled = PolicyStatusEnum.Cancelled;

  maintain = CaseTypeEnum.MaintainPolicyChanges;
  cancel = CaseTypeEnum.CancelPolicy;
  reinstate = CaseTypeEnum.ReinstatePolicy;

  documentSystemName = DocumentSystemNameEnum.PolicyManager;
  keyName: string;
  keyValue: any;

  slaItemType = SLAItemTypeEnum.Policy;

  isReady: boolean;
  hasPolicies: boolean;
  defaultTabsInitialised = false;
  selectedReason: string;

  memberHasActiveRMAMutualAssurancePolicy: boolean;
  isCoid: boolean;
  isVaps: boolean;
  isFuneral: boolean;
  isGroupRisk: boolean;

  tabIndex = 0;
  accountTabIndex = 0;

  complianceResult: ComplianceResult;

  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Policy;
  referralItemTypeReference: string;

  beneficiary = RolePlayerTypeEnum.Beneficiary;

  governmentSalaryDeduction = +PaymentMethodEnum.GovernmentSalaryDeduction;

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(
    public dialog: MatDialog,
    public readonly wizardService: WizardService,
    public readonly alert: ToastrManager,
    private readonly policyService: PolicyService,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    private readonly refreshService: RefreshService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      if (this.isWizard) {
        this.maintenanceInProgressChecked$.next(true);
        this.reviewInProgressChecked$.next(true);
      }

      this.rolePlayerContactOptions = [
        { key: 'Policy Owner', value: this.rolePlayerId }
      ];

      this.getRolePlayerPolicies();
    }
  }

  setSelectedPolicy($event: Policy) {
    this.selectedPolicy = $event;

    if (this.selectedPolicy) {
      this.referralItemTypeReference = this.selectedPolicy.policyNumber;
      this.setPolicyProductCategoryType();
      this.setDocumentKeysAndValues();
    }
  }

  setDocumentKeysAndValues() {
    if (this.isFuneral) {
      this.keyName = 'CaseCode';
      this.keyValue = this.selectedPolicy.policyNumber;
    } else {
      this.keyName = 'PolicyId';
      this.keyValue = this.selectedPolicy.policyId;
    }
  }

  setPolicies($event: Policy[]) {
    this.hasPolicies = $event && $event.length > 0;
  }

  setComplianceResult($event: ComplianceResult) {
    if (!this.complianceResult) { this.complianceResult = $event }

    if ($event.isBillingCompliant != this.complianceResult.isBillingCompliant || $event.isDeclarationCompliant != this.complianceResult.isDeclarationCompliant) {
      this.defaultTabsInitialised = false;
      this.triggerRefresh();
    } else if (this.defaultTabsInitialised) {
      return;
    }

    this.complianceResult = $event;

    if (!this.complianceResult.isDeclarationCompliant) {
      this.tabIndex = 0;
      this.accountTabIndex = 0;
      this.defaultTabsInitialised = true;
    } else if (!this.complianceResult.isBillingCompliant) {
      this.tabIndex = 0;
      this.accountTabIndex = 1;
      this.defaultTabsInitialised = true;
    }
  }

  getRolePlayerPolicies() {
    this.policyService.getPoliciesWithProductOptionByRolePlayer(this.rolePlayerId).subscribe(results => {
      this.policies = results;
      this.memberHasActiveRMAMutualAssurancePolicy = this.policies.some(s => s.productCategoryType == ProductCategoryTypeEnum.Coid && s.policyStatus == PolicyStatusEnum.Active);
      this.isLoading$.next(false);
    });
  }

  openAuditDialog(policy: Policy) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.Policy,
        itemId: policy.policyId,
        heading: 'Policy Details Audit',
        propertiesToDisplay: ['BrokerageId', 'ProductOptionId', 'RepresentativeId', 'JuristicRepresentativeId', 'PolicyOwnerId', 'PolicyPayeeId', 'PaymentFrequency', 'PaymentMethod',
          'PolicyNumber', 'PolicyInceptionDate', 'ExpiryDate', 'CancellationDate', 'FirstInstallmentDate', 'LastInstallmentDate', 'RegularInstallmentDayOfMonth', 'DecemberInstallmentDayOfMonth',
          'PolicyStatus', 'AnnualPremium', 'InstallmentPremium', 'CommissionPercentage', 'AdminPercentage', 'PolicyCancelReason', 'ClientReference', 'LastLapsedDate', 'LapsedCount', 'LastReinstateDate']
      }
    });
  }

  openConfirmationDialog(caseType: CaseTypeEnum) {
    let dialogText = '';
    let _title = '';
    let _reasons = [];

    switch (caseType) {
      case CaseTypeEnum.MaintainPolicyChanges: {
        _title = 'Maintain Policy';
        dialogText = 'Are you sure you want to maintain this policy?';
        break;
      }
      case CaseTypeEnum.CancelPolicy: {
        _title = 'Cancel Policy';
        dialogText = 'Why do you want to cancel this policy?';
        _reasons = this.ToArray(PolicyCancelReasonEnum);
        break;
      }
      case CaseTypeEnum.ReinstatePolicy: {
        _title = 'Reinstate Policy';
        dialogText = 'Why do you want to reinstate this policy?';
        _reasons = this.ToArray(ReinstateReasonEnum);
        break;
      }
      default: {
        _title = 'N/A';
        dialogText = 'Are you sure you want to continue?';
        break;
      }
    }

    const dialogRef = this.dialog.open(PolicyViewConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: _title,
        policy: this.selectedPolicy,
        question: dialogText,
        reasons: _reasons,
        type: caseType,
        maintenanceInProgress: this.maintenanceInProgress,
        reviewInProgress: this.reviewInProgress
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.startWizard(caseType);
      } else if (result) {
        this.selectedReason = result;
        this.startWizard(caseType);
      }
    });
  }

  calculateDaysBetween(date1: Date, date2: Date): number {
    const diff = date1.getTime() - date2.getTime();
    return Math.abs(Math.ceil(diff / (1000 * 3600 * 24)));
  }

  addDays(date: Date, days: number): string {
    date.setDate(date.getDate() + days);
    return this.datePipe.transform(date, 'yyyy/MM/dd');
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatus]);
  }

  getPaymentFrequency(paymentFrequencyId: PaymentFrequencyEnum): string {
    return this.formatText(PaymentFrequencyEnum[paymentFrequencyId]);
  }

  getPaymentMethod(paymentMethodId: PaymentMethodEnum): string {
    return this.formatText(PaymentMethodEnum[paymentMethodId]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  triggerRefresh() {
    this.isLoading$.next(true);

    this.refreshService.triggerRefresh();

    this.getPolicy();
  }

  getPolicy() {
    this.policyService.getPolicyWithProductOptionByPolicyId(this.selectedPolicy.policyId).subscribe(result => {
      this.selectedPolicy = result;
      this.isLoading$.next(false);
    });
  }

  startWizard(caseType: CaseTypeEnum) {
    this.isStartingWizard$.next(true);
    this.alert.infoToastr(`starting requested wizard...`);
    let wizardRequestType: string;

    switch (caseType) {
      case CaseTypeEnum.MaintainPolicyChanges: {
        wizardRequestType = 'rma-rml-policy-maintanance';
        break;
      }
      case CaseTypeEnum.CancelPolicy: {
        wizardRequestType = 'rma-rml-policy-cancellation';
        break;
      }
      case CaseTypeEnum.ReinstatePolicy: {
        wizardRequestType = 'rma-rml-policy-reinstatement';
        break;
      }
      default: {
        wizardRequestType = null;
        break;
      }
    }

    if (wizardRequestType) {
      const startWizardRequest = new StartWizardRequest();
      startWizardRequest.linkedItemId = this.selectedPolicy.policyId;
      startWizardRequest.type = wizardRequestType;

      if (caseType === CaseTypeEnum.CancelPolicy) {
        const policyStatusChangeAudit = new PolicyStatusChangeAudit();
        policyStatusChangeAudit.policyId = this.selectedPolicy.policyId;
        policyStatusChangeAudit.policy = this.selectedPolicy;

        const index = this.policies?.findIndex(s => s.policyId === this.selectedPolicy.policyId);
        if (index > -1) {
          this.policies.splice(index, 1)
        }

        if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.Coid) {
          const vapsPolicies = this.policies.filter(s =>
            s.productCategoryType == ProductCategoryTypeEnum.VapsAssistance || s.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory
            && s.policyStatus !== PolicyStatusEnum.Cancelled
            && s.policyStatus !== PolicyStatusEnum.PendingCancelled);

          policyStatusChangeAudit.vapsPolicies = vapsPolicies;
        }

        policyStatusChangeAudit.reason = this.selectedReason;

        var currentUser = this.authService.getCurrentUser();
        policyStatusChangeAudit.requestedBy = currentUser.email;

        this.selectedReason = String.Empty;
        startWizardRequest.data = JSON.stringify(policyStatusChangeAudit);
      } else if (caseType === CaseTypeEnum.ReinstatePolicy) {
        const policyStatusChangeAudit = new PolicyStatusChangeAudit();
        policyStatusChangeAudit.policyId = this.selectedPolicy.policyId;
        policyStatusChangeAudit.policy = this.selectedPolicy;

        const index = this.policies?.findIndex(s => s.policyId === this.selectedPolicy.policyId);
        if (index > -1) {
          this.policies.splice(index, 1)
        }

        if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.Coid) {
          const vapsPolicies = this.policies.filter(s =>
            s.productCategoryType == ProductCategoryTypeEnum.VapsAssistance || s.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory
            && s.policyStatus !== PolicyStatusEnum.Active
            && s.policyStatus !== PolicyStatusEnum.PendingReinstatement
            && s.policyCancelReasonId === +PolicyCancelReasonEnum.ParentPolicyCancelled);

          policyStatusChangeAudit.vapsPolicies = vapsPolicies;
        }

        policyStatusChangeAudit.reason = this.selectedReason;

        var currentUser = this.authService.getCurrentUser();
        policyStatusChangeAudit.requestedBy = currentUser.email;

        this.selectedReason = String.Empty;
        startWizardRequest.data = JSON.stringify(policyStatusChangeAudit);
      } else {
        startWizardRequest.data = JSON.stringify(this.selectedPolicy);
      }

      this.wizardService.startWizard(startWizardRequest).subscribe(result => {
        this.alert.successToastr(`${this.formatText(CaseTypeEnum[caseType])} started successfully`);
        this.isStartingWizard$.next(false);
        this.triggerRefresh();
        this.tabIndex = 8;
      });
    } else {
      this.isStartingWizard$.next(false);
    }
  }

  setPolicyProductCategoryType() {
    if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.Coid) {
      this.isCoid = true;
      this.isVaps = false;
      this.isFuneral = false;
      this.isGroupRisk = false;
      return;
    }

    if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.VapsAssistance || this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory) {
      this.isCoid = false;
      this.isVaps = true;
      this.isFuneral = false;
      this.isGroupRisk = false;
      return;
    }

    if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.Funeral) {
      this.isCoid = false;
      this.isVaps = false;
      this.isFuneral = true;
      this.isGroupRisk = false;
      return;
    }
    
    if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.GroupRisk) {
      this.isCoid = false;
      this.isVaps = false;
      this.isFuneral = false;
      this.isGroupRisk = true;
      return;
    }

    if (this.selectedPolicy.productCategoryType == ProductCategoryTypeEnum.None || !this.selectedPolicy.productCategoryType) {
      this.isCoid = false;
      this.isVaps = false;
      this.isFuneral = false;
      this.isGroupRisk = false;
      return;
    }
  }

  setReady($event: boolean) {
    this.isReady = $event;
  }

  setActiveWizard($event: Wizard[]) {
    if ($event && $event.length > 0) {
      this.maintenanceInProgress = $event.some(s => s.wizardConfiguration.name == 'rma-rml-policy-maintanance');
      this.activeWizards = $event;
    } else {
      this.maintenanceInProgress = false;
      this.activeWizards = null;
    }

    this.maintenanceInProgressChecked$.next(true);
  }

  setActiveReviewWizard($event: Wizard[]) {
    if ($event && $event.length > 0) {
      this.reviewInProgress = $event.some(s => s.wizardConfiguration.name == 'declaration-variance');
      this.activeWizards.push($event[0]);
    } else {
      this.reviewInProgress = false;
    }

    this.reviewInProgressChecked$.next(true);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
