import { Component, OnInit } from '@angular/core';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'app-reports-manager-layout',
  templateUrl: './reports-manager-layout.component.html',
  styleUrls: ['./reports-manager-layout.component.css']
})
export class ReportsManagerLayoutComponent extends ModuleMenuComponent {

  get showCoidMenuOptions(): boolean {
    return FeatureflagUtility.isFeatureFlagEnabled('CoidMenuOptions');
  }
  
  constructor(
    readonly router: Router,
    readonly authService: AuthService) {
    super(router);
  }

}
