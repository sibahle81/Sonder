import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDetailsComponent } from './views/client-details/client-details.component';
import { ClientSubsidiaryDetailsComponent } from './views/client-subsidiary-details/client-subsidiary-details.component';
import { AddressDetailsComponent } from './views/address-details/address-details.component';
import { BankAccountDetailsComponent } from './views/bank-account-details/bank-account-details.component';
import { BranchDetailsComponent } from './views/branch-details/branch-details.component';
import { DepartmentDetailsComponent } from './views/department-details/department-details.component';
import { ContactListComponent } from './views/contact-list/contact-list.component';
import { ContactDetailsComponent } from './views/contact-details/contact-details.component';
import { BankAccountListComponent } from './views/bank-account-list/bank-account-list.component';
import { GroupListComponent } from './views/group-list/group-list.component';
import { GroupDetailsComponent } from './views/group-details/group-details.component';
import { FindClientComponent } from './views/find-client/find-client.component';
import { FindGroupComponent } from './views/find-group/find-group.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { ClientProfileComponent } from './views/client-profile/client-profile.component';
import { ClientListComponent } from './views/client-list/client-list.component';
import { ClientManagerLayoutComponent } from './views/client-manager-layout/client-manager-layout.component';
import { ClientManagerHomeComponent } from './views/client-manager-home/client-manager-home.component';
import { BankAccountApprovalListComponent } from './views/bank-account-approval-list/bank-account-approval-list.component';
import { BankAccountApprovalDetailsComponent } from './views/bank-account-approval-details/bank-account-approval-details.component';
const routes: Routes = [
  {
    path: '', component: ClientManagerLayoutComponent, 
    canActivate: [SignInGuard, PermissionGuard], 
    canActivateChild: [PermissionGuard],
    data: { title: 'Client Manager', permissions: ['Client manager view'] },
    children: [
      { path: '', component: ClientManagerHomeComponent, data: { title: 'Client Manager' } },
      { path: 'client-list', component: ClientListComponent, canActivate: [SignInGuard], data: { title: 'Clients', group: 2 } },
      { path: 'client-profile/:id', component: ClientProfileComponent, canActivate: [SignInGuard], data: { title: 'Client profile', group: 2 } },
      { path: 'client-profile/:id/:tabIndex', component: ClientProfileComponent, canActivate: [SignInGuard], data: { title: 'Client profile', group: 2 } },

      { path: 'client-details/:id', component: ClientDetailsComponent, data: { title: 'Client Details', group: 2, permissions: ['View Client'] }, canActivate: [SignInGuard] },
      { path: 'client-details/:id/:tabIndex', component: ClientDetailsComponent, data: { title: 'Client Details', group: 2, permissions: ['View Client'] }, canActivate: [SignInGuard] },
      { path: 'find-client', component: FindClientComponent, data: { title: 'Find a Client', group: 2, permissions: ['View Client'] }, canActivate: [SignInGuard] },

      { path: 'address-details/client/:linkId/:action/:linkType/:id', component: AddressDetailsComponent, data: { title: 'Address Details', group: 3 } },
      { path: 'address-details/:linkType/:id/:action', component: AddressDetailsComponent, data: { title: 'Address Details', group: 3 } },
      { path: 'address-details/:linkType/:linkId/:action/:id', component: AddressDetailsComponent, data: { title: 'Address Details', group: 3 } },

      { path: 'bank-account-list', component: BankAccountListComponent, data: { title: 'Banking Details', group: 4 } },
      { path: 'bank-account-details/:action/:linkId/:linkType', component: BankAccountDetailsComponent, data: { title: 'Banking Detail', group: 4 } },
      { path: 'bank-account-details/:action/:linkId/:linkType/:selectedId', component: BankAccountDetailsComponent, data: { title: 'Banking Details', group: 4 } },
      { path: 'bank-account-approval-list', component: BankAccountApprovalListComponent, data: { title: 'Approve Banking Details', group: 4 } },
      { path: 'bank-account-approval-details/:id', component: BankAccountApprovalDetailsComponent, data: { title: 'Approve Banking Details', group: 4 } },

      { path: 'branch-details/:action/:id', component: BranchDetailsComponent, data: { title: 'Create Branch', group: 3 } },
      { path: 'department-details/:action/:id', component: DepartmentDetailsComponent, data: { title: 'Create Department', group: 3 } },

      { path: 'client-subsidiary-details/:action/:id', component: ClientSubsidiaryDetailsComponent, data: { title: 'Create Subsidiary', group: 3 } },

      { path: 'contact-list', component: ContactListComponent, data: { title: 'Contact Details', group: 5 } },
      { path: 'contact/:action/:itemId/:linkType/:selectedId', component: ContactDetailsComponent, data: { title: 'Contact Details', group: 5 } },
      { path: 'contact/:action/:itemId/:linkType', component: ContactDetailsComponent, data: { title: 'Contact Detail', group: 5 } },

      { path: 'group-list', component: GroupListComponent, data: { title: 'Group Details', group: 6, permissions: ['View Group'] }, canActivate: [SignInGuard] },
      { path: 'group-details', component: GroupDetailsComponent, data: { title: 'Create Group', group: 3, permissions: ['View Group'] }, canActivate: [SignInGuard] },
      { path: 'group-details/:id', component: GroupDetailsComponent, data: { title: 'Group Details', group: 3, permissions: ['View Group'] }, canActivate: [SignInGuard] },
      { path: 'group-details/:id/:tabIndex', component: GroupDetailsComponent, data: { title: 'Group Details', group: 3, permissions: ['View Group'] }, canActivate: [SignInGuard] },
      { path: 'find-group', component: FindGroupComponent, data: { title: 'Find a Group', group: 3, permissions: ['View Group'] }, canActivate: [SignInGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientManagerRoutingModule { }
