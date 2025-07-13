import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { GroupRiskPolicyCaseModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/group-risk-policy-case-model';

@Component({
  templateUrl: './policy-manager-layout.component.html'
})
export class PolicyManagerLayoutComponent extends ModuleMenuComponent {

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  hasUploadBulkPaymentListingPermission = userUtility.hasPermission('Upload Bulk Payment Listing');
  enable_grouprisk_policy_reports: boolean = FeatureflagUtility.isFeatureFlagEnabled('Enable_GroupRisk_Policy_Reports');
  get showCoidMenuOptions(): boolean {
    return FeatureflagUtility.isFeatureFlagEnabled('CoidMenuOptions');
  }

  get canLapsePolicies(): boolean {
    return userUtility.hasPermission('Bulk Lapse Policies');
  }

  get canCancelPolicies(): boolean {
    return userUtility.hasPermission('Bulk Cancel Policies');
  }

  get canSendPolicySchedules(): boolean {
    return userUtility.hasPermission('Bulk Send Policy Schedules');
  }

  get showProcessQlinkPermission(): boolean {
    return userUtility.hasPermission('Processing Qlink Transactions');
  }
  
  constructor(
    readonly router: Router,
    private readonly wizardService: WizardService
  ) {
    super(router);
  }

  home(): void {
    this.router.navigate(['clientcare/policy-manager']);
  }

  captureGroupRiskPolicy() {
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new GroupRiskPolicyCaseModel();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'manage-group-risk-policies';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`clientcare/policy-manager/manage-group-risk-policies/continue/${wizard.id}`);
      })
  }
}
