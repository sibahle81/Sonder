import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './configuration-manager-layout.component.html'
})
export class ConfigurationManagerLayoutComponent extends ModuleMenuComponent {

  disable_coid_vaps_e2e_admin = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_Admin');
  hasPermission:boolean = userUtility.hasPermission('Manage Periods');

  constructor(
    readonly router: Router,
    readonly authService: AuthService) {
    super(router);
  }

  home(): void {
    this.router.navigate(['config-manager']);
  }
}
