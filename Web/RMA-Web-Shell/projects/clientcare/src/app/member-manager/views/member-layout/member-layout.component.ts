import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MasterMenuComponent } from 'projects/shared-components-lib/src/lib/menu/master-menu.component';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { RolePlayer } from '../../../policy-manager/shared/entities/roleplayer';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';

@Component({
  templateUrl: './member-layout.component.html'
})
export class MemberLayoutComponent extends MasterMenuComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  enable_grouprisk_renewals: boolean = FeatureflagUtility.isFeatureFlagEnabled('Enable_GroupRisk_Renewals');

  constructor(
    appEventsManager: AppEventsManager,
    readonly router: Router,
    private readonly rolePlayerService: RolePlayerService,
    private readonly wizardService: WizardService)   {
    super(appEventsManager);
  }


  onboardGroupLifeRolePlayer() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new RolePlayer();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'roleplayer-onboarding';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`clientcare/member-manager/roleplayer-onboarding/continue/${wizard.id}`);
        this.isLoading$.next(false);
      })
  }
}
