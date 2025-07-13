import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from './views/user-home/user-home.component';
import { RoleListComponent } from './views/role-list/role-list.component';
import { UserDetailsComponent } from './views/user-details/user-details.component';
import { RoleDetailsComponent } from './views/role-details/role-details.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { UserLayoutComponent } from './views/user-layout/user-layout.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
    {
        path: '', component: UserLayoutComponent, 
        canActivate: [SignInGuard, PermissionGuard],
        canActivateChild: [PermissionGuard],
        data: { permissions: ['User manager view'] },
        children: [
            { path: '', component: UserHomeComponent },
            { path: 'role-list', component: RoleListComponent },
            { path: 'role-details', component: RoleDetailsComponent },
            { path: 'role-details/:id', component: RoleDetailsComponent },
            { path: 'user-details', component: UserDetailsComponent },
            { path: 'user-details/:id', component: UserDetailsComponent },
            { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent }​​​​,
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserManagerRoutingModule { }
