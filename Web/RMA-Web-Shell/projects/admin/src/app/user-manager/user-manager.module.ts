import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { UserLastViewedListDataSource } from './views/user-last-viewed-list/user-last-viewed-list.datasource';
import { RoleDetailsComponent } from './views/role-details/role-details.component';
import { RoleListComponent } from './views/role-list/role-list.component';
import { RoleLastViewedListComponent } from './views/role-last-viewed-list/role-last-viewed-list.component';
import { RoleLastViewedListDataSource } from './views/role-last-viewed-list/role-last-viewed-list.datasource';
import { UserDetailsComponent } from './views/user-details/user-details.component';
import { PortalUserDetailsComponent } from './views/portal-user-details/portal-user-details.component';
import { UserManagerRoutingModule } from './user-manager-routing.module';
import { SearchModule } from 'projects/clientcare/src/app/shared/search/search.module';
import { FrameworkModule } from 'src/app/framework.module';
import { UserHomeComponent } from './views/user-home/user-home.component';
import { UserLayoutComponent } from './views/user-layout/user-layout.component';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { UserManagerBreadcrumbService } from './shared/services/user-manager-breadcrumb.service';
import { UserLastViewedListComponent } from './views/user-last-viewed-list/user-last-viewed-list.component';
import { PermissonGroupComponent } from './views/permisson-group/permisson-group.component';
import { PermissionGroupFilterPipe } from 'projects/shared-utilities-lib/src/lib/pipes/permission-group-filter-pipe';
import { UserSearchComponent } from './views/user-search/user-search.component';
import { RoleSearchComponent } from './views/role-search/role-search.component';
import { RoleSearchDataSource } from './views/role-search/role-search.datasource';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { UserMemberPortalWizard } from './views/member-portal/user-member-portal-wizard';
import { UserAddressMemberPortalComponent } from './views/member-portal/user-approval-wizard/user-address-member-portal/user-address-member-portal.component';
import { UserDetailsMemberPortalComponent } from './views/member-portal/user-approval-wizard/user-details-member-portal/user-details-member-portal.component';
import { UserDocumentMemberPortalComponent } from './views/member-portal/user-approval-wizard/user-document-member-portal/user-document-member-portal.component';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { ConfigManagerModule } from '../configuration-manager/config-manager.module';

@NgModule({
    imports: [
        FrameworkModule,
        SearchModule,
        UserManagerRoutingModule,
        WizardModule,
        ConfigManagerModule
    ],
    declarations: [
        UserHomeComponent,
        UserLayoutComponent,
        RoleListComponent,
        UserLastViewedListComponent,
        RoleLastViewedListComponent,
        RoleDetailsComponent,
        UserDetailsComponent,
        PortalUserDetailsComponent,
        PermissonGroupComponent,
        PermissionGroupFilterPipe,
        UserSearchComponent,
        RoleSearchComponent,
        UserAddressMemberPortalComponent,
        UserDetailsMemberPortalComponent,
        UserDocumentMemberPortalComponent,
    ],
    exports: [],
    providers: [
        UserManagerBreadcrumbService,
        UserLastViewedListDataSource,
        RoleLastViewedListDataSource,
        UserService,
        RoleSearchDataSource,
    ]
})
export class UserManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFacotry: WizardContextFactory) {
        contextFacotry.addWizardContext(new UserMemberPortalWizard(componentFactoryResolver), 'user-approval-member-portal');
    }
}
