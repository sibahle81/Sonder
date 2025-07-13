import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { ClientManagerRoutingModule } from './client-manager-routing.module';
import { GroupLastViewedListDataSource } from './views/group-last-viewed-list/group-last-viewed-list.datasource';
import { ClientManagerHomeComponent } from './views/client-manager-home/client-manager-home.component';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { SearchModule } from '../shared/search/search.module';
import { AddressService } from './shared/services/address.service';
import { BankService } from './shared/services/bank.service';
import { BankAccountService } from './shared/services/bank-account.service';
import { BankAccountTypeService } from './shared/services/bank-account-type.service';
import { BankBranchService } from './shared/services/bank-branch.service';
import { BranchService } from './shared/services/branch.service';
import { BreadcrumbClientService } from './shared/services/breadcrumb-client.service';

import { ClientService } from './shared/services/client.service';
import { ContactService } from './shared/services/contact.service';
import { DepartmentService } from './shared/services/department.service';
import { GroupService } from './shared/services/group.service';
import { PaymentMethodService } from './shared/services/payment-method.service';
import { AddressDetailsComponent } from './views/address-details/address-details.component';
import { BankAccountDetailsComponent } from './views/bank-account-details/bank-account-details.component';
import { BankAccountListComponent } from './views/bank-account-list/bank-account-list.component';
import { BankAccountListDataSource } from './views/bank-account-list/bank-account-list.datasource';
import { BranchDetailsComponent } from './views/branch-details/branch-details.component';

import { ClientAddressListComponent } from './views/client-address-list/client-address-list.component';
import { ClientAddressListDataSource } from './views/client-address-list/client-address-list.datasource';
import { ClientBranchListComponent } from './views/client-branch-list/client-branch-list.component';
import { ClientBranchListDatasource } from './views/client-branch-list/client-branch-list.datasource';
import { ClientDepartmentListComponent } from './views/client-department-list/client-department-list.component';
import { ClientDepartmentListDatasource } from './views/client-department-list/client-department-list.datasource';
import { ClientAffinityComponent } from './views/client-details/client-affinity.component';
import { ClientCompanyComponent } from './views/client-details/client-company.component';
import { ClientDetailsComponent } from './views/client-details/client-details.component';
import { ClientGroupIndividualComponent } from './views/client-details/client-group-individual.component';
import { ClientIndividualComponent } from './views/client-details/client-individual.component';
import { ClientLastViewedComponent } from './views/client-last-viewed/client-last-viewed.component';
import { ClientLastViewedDataSource } from './views/client-last-viewed/client-last-viewed.datasource';
import { ClientListComponent } from './views/client-list/client-list.component';
import { ClientProfileComponent } from './views/client-profile/client-profile.component';
import { ClientSubsidiaryDetailsComponent } from './views/client-subsidiary-details/client-subsidiary-details.component';
import { ClientSubsidiaryDetailsDataSource } from './views/client-subsidiary-details/client-subsidiary-details.datasource';
import { ClientSubsidiaryListComponent } from './views/client-subsidiary-list/client-subsidiary-list.component';
import { ClientSubsidiaryListDataSource } from './views/client-subsidiary-list/client-subsidiary-list.datasource';
import { ContactDetailsComponent } from './views/contact-details/contact-details.component';
import { ContactListComponent } from './views/contact-list/contact-list.component';
import { ContactListDataSource } from './views/contact-list/contact-list.datasource';
import { MultipleContactListComponent } from './views/contact-list/multiple-contact-list.component';
import { MultipleContactListDataSource } from './views/contact-list/multiple-contact-list.datasource';
import { DepartmentDetailsComponent } from './views/department-details/department-details.component';
import { FindClientComponent } from './views/find-client/find-client.component';
import { FindGroupComponent } from './views/find-group/find-group.component';
import { GroupClientListComponent } from './views/group-client-list/group-client-list.component';
import { GroupClientListDatasource } from './views/group-client-list/group-client-list.datasource';
import { GroupDetailsComponent } from './views/group-details/group-details.component';
import { GroupLastViewedListComponent } from './views/group-last-viewed-list/group-last-viewed-list.component';
import { GroupListComponent } from './views/group-list/group-list.component';
import { GroupListDataSource } from './views/group-list/group-list.datasource';
import { FrameworkModule } from 'src/app/framework.module';
import { ClientManagerLayoutComponent } from './views/client-manager-layout/client-manager-layout.component';
import { CommunicationTypeService } from './shared/services/communication-type.service';
import { BankAccountApprovalListComponent } from './views/bank-account-approval-list/bank-account-approval-list.component';
import { BankAccountApprovalListDataSource } from './views/bank-account-approval-list/bank-account-approval-list.datasource';
import { BankAccountApprovalDetailsComponent } from './views/bank-account-approval-details/bank-account-approval-details.component';

@NgModule({
  imports: [
    FrameworkModule,
    SearchModule,
    ClientManagerRoutingModule,
    ClientCareSharedModule
  ],
  declarations: [
    ClientManagerHomeComponent,
    ClientManagerLayoutComponent,
    AddressDetailsComponent,
    BankAccountDetailsComponent,
    BankAccountListComponent,
    BranchDetailsComponent,
    ClientAddressListComponent,
    ClientAffinityComponent,
    ClientBranchListComponent,
    ClientCompanyComponent,
    ClientDepartmentListComponent,
    ClientDetailsComponent,
    ClientGroupIndividualComponent,
    ClientIndividualComponent,
    ClientLastViewedComponent,
    ClientListComponent,
    ClientSubsidiaryDetailsComponent,
    ClientSubsidiaryListComponent,
    ContactListComponent,
    DepartmentDetailsComponent,
    GroupDetailsComponent,
    GroupListComponent,
    MultipleContactListComponent,
    ClientProfileComponent,
    ContactDetailsComponent,
    FindClientComponent,
    FindGroupComponent,
    GroupClientListComponent,
    GroupLastViewedListComponent,
    BankAccountApprovalListComponent,
    BankAccountApprovalDetailsComponent
  ],
  exports: [
    ClientIndividualComponent,
    ClientAffinityComponent,
    ClientCompanyComponent,
    ClientLastViewedComponent
  ],
  providers: [
    BankAccountListDataSource,
    ClientAddressListDataSource,
    ClientBranchListDatasource,
    ClientDepartmentListDatasource,
    ClientService,
    ClientSubsidiaryDetailsDataSource,
    ClientSubsidiaryListDataSource,
    ContactListDataSource,
    ContactService,
    GroupClientListDatasource,
    MultipleContactListDataSource,
    AddressService,
    BankAccountService,
    BankAccountTypeService,
    BankBranchService,
    BankService,
    BranchService,
    BreadcrumbClientService,
    ClientLastViewedDataSource,
    DepartmentService,
    GroupLastViewedListDataSource,
    GroupListDataSource,
    GroupService,
    PaymentMethodService,
    CommunicationTypeService,
    BankAccountApprovalListDataSource
  ]
})
export class ClientManagerModule {
  constructor() {
  }
}
