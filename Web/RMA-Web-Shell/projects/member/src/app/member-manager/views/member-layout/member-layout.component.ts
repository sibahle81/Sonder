import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './member-layout.component.html'
})
export class MemberLayoutComponent extends ModuleMenuComponent implements OnInit {

  hasCreateClaimsPermission: boolean;
  createClaimsPermission = 'Create Claim';

  hasBillingViewPermission: boolean;
  viewBillingPermission = 'Billing View';

  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {
    this.hasCreateClaimsPermission = userUtility.hasPermission(this.createClaimsPermission);
    this.hasBillingViewPermission = userUtility.hasPermission(this.viewBillingPermission);
  }
}
