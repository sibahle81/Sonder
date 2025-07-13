import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  styleUrls: ['../../../../../../../../assets/css/site.css'],
  templateUrl: './hcp-member-layout.component.html'
})
export class HCPMemberLayoutComponent extends ModuleMenuComponent implements OnInit {

  hasManageUsersPermission: boolean;
  requiredManageUsersPermission = 'Manage Linked Users';

  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {
    this.hasManageUsersPermission = userUtility.hasPermission(this.requiredManageUsersPermission);
  }
}
