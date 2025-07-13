import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
    templateUrl: './claim-layout.component.html'
})
export class ClaimLayoutComponent extends ModuleMenuComponent implements OnInit {
    isInternalUser: boolean;
    hasManageUsersPermission: boolean;
    requiredManageUsersPermission = 'Manage Linked Users';
    
    get showCoidMenuOptions(): boolean {
        return FeatureflagUtility.isFeatureFlagEnabled('CoidMenuOptions');
    }
    
    constructor(
        readonly router: Router,
        private readonly authService: AuthService,    ) {
        super(router);
    }

    ngOnInit() { 
        var currentUser = this.authService.getCurrentUser();
        this.isInternalUser = currentUser.isInternalUser;
        this.hasManageUsersPermission = userUtility.hasPermission(this.requiredManageUsersPermission);
    }
}
