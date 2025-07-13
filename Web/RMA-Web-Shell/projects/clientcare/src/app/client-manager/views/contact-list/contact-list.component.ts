import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContactListDataSource } from 'projects/clientcare/src/app/client-manager/views/contact-list/contact-list.datasource';
import { Contact } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { Branch } from 'projects/clientcare/src/app/client-manager/shared/Entities/branch';
import { Department } from 'projects/clientcare/src/app/client-manager/shared/Entities/department';
import { ContactListViewModel } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact-list-view-model';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './contact-list.component.html',

    selector: 'contact-details-list'
})
export class ContactListComponent extends ListFilteredComponent implements OnInit {
    client: Client;
    canAdd: boolean;

    isAddContactDetail: boolean;
    addContactDetailOption = 'branch';
    selectedContactDetail: boolean;
    canModifyContactDetail = true;
    selectedClient: any;
    canAddContactDetail = true;
    clientId: number;
    cancelUnlink: boolean;
    isUnlink: boolean;
    unlink: boolean;
    unlinkName: string;
    contactDetailOption = 'branch';
    selectedBranch: any;
    invalid: boolean;
    selectedDepartment: any;
    selectedclient: any;
    linkType: string;
    branchData: Branch[];
    departmentData: Department[];
    contactsData: Contact[];
    isModifyContactDetail: boolean;
    confirmUnlink: boolean;
    enableSave: boolean;
    linkedClientName: string;
    isSaveContactDetail: boolean;
    clientTypeId = 1;

    get isLoading(): boolean { return this.contactDetailDataSource.isLoading; }

    get branches(): Branch[] {
        if (!this.contactDetailDataSource.branches) { return new Array(); }
        return this.contactDetailDataSource.branches;
    }

    get departments(): Department[] {
        if (!this.contactDetailDataSource.departments) { return new Array(); }
        return this.contactDetailDataSource.departments;
    }

    get branchesWithoutContactDetails(): Branch[] {
        if (!this.contactDetailDataSource.branches) { return new Array(); }
        const branches = this.contactDetailDataSource.branches;
        return branches;
    }

    get departmentsWithoutContactDetails(): Department[] {
        if (!this.contactDetailDataSource.departments) { return new Array(); }
        const departments = this.contactDetailDataSource.departments;
        return departments;
    }

    get hasBranchesAndDepartments(): boolean {
        return (this.contactDetailDataSource.branches && this.contactDetailDataSource.branches.length > 0)
            || (this.contactDetailDataSource.departments && this.contactDetailDataSource.departments.length > 0);
    }

    get allBranchesAndDepartmentsAdded(): boolean {

        return this.hasBranchesAndDepartments && (this.branchesWithoutContactDetails.length === 0 && this.departmentsWithoutContactDetails.length === 0);
    }

    constructor(
        private readonly privateRouter: Router,
        private readonly location: Location,
        private readonly contactDetailDataSource: ContactListDataSource,
        ) {

        super(privateRouter, contactDetailDataSource, '', 'contactDetails', 'Contact');
        this.showActionsLink = true;
    }

    ngOnInit(): void {
        this.checkUserAddPermission();
        super.ngOnInit();

    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Contact');
    }

    getData(data: any): void {
        this.client = data;
        this.contactDetailDataSource.getData(data);
        this.clientTypeId = this.client.clientTypeId;
    }

    addContactDetail(): void {
        this.privateRouter.navigate([`clientcare/client-manager/contact/add/${this.client.id}/client/0`]);
    }

    onSelect(item: Contact): void {
        this.privateRouter.navigate(['clientcare/client-manager/contact/edit', this.client.id, 'client', item.id]);
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: ContactListViewModel) => `${row.name}` },
            { columnDefinition: 'telephoneNumber', header: 'Telephone Number', cell: (row: ContactListViewModel) => `${row.telephoneNumber}` },
            { columnDefinition: 'serviceType', header: 'Service Type', cell: (row: ContactListViewModel) => `${row.serviceTypeName}` },
            { columnDefinition: 'unsubscribe', header: 'Unsubscribed', cell: (row: ContactListViewModel) => `${this.getUnsubscribed(row.unsubscribe)}` }
        ];
    }

    back(): void {
        this.location.back();
    }

    getUnsubscribed(unsubscribe: boolean): string {
      if (unsubscribe !== undefined) {
        return unsubscribe === true ? 'Yes' : '';
      }
      return '';
    }
}
