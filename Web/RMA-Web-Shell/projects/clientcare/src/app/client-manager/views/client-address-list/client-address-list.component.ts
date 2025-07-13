import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientAddressListDataSource } from './client-address-list.datasource';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { Address } from 'projects/clientcare/src/app/client-manager/shared/Entities/address';
import { Branch } from 'projects/clientcare/src/app/client-manager/shared/Entities/branch';
import { Department } from 'projects/clientcare/src/app/client-manager/shared/Entities/department';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BranchService } from 'projects/clientcare/src/app/client-manager/shared/services/branch.service';
import { DepartmentService } from 'projects/clientcare/src/app/client-manager/shared/services/department.service';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './client-address-list.component.html',

    selector: 'client-address-list'
})
export class ClientAddressListComponent extends ListFilteredComponent implements OnInit {

    client: Client;

    canAdd: boolean;
    isModifyAddress: boolean;
    isUnlink: boolean;
    unlinkName: string;

    canModifyAddress = true;
    modificationType = 'add';

    addressOption = 'branch';
    selectedAddress: any;
    selectedBranch: any;
    selectedDepartment: any;

    get addresses(): Address[] {
        if (!this.addressListDataSource.addresses) { return new Array(); }
        return this.addressListDataSource.addresses;
    }

    get branches(): Branch[] {
        if (!this.addressListDataSource.branches) { return new Array(); }
        return this.addressListDataSource.branches;
    }

    get branchesWithoutAddresses(): Branch[] {
        if (!this.addressListDataSource.branches) { return new Array(); }
        const branches = this.addressListDataSource.branches.filter(branch => branch.addressId == null);
        return branches;
    }

    get departments(): Department[] {
        if (!this.addressListDataSource.departments) { return new Array(); }
        return this.addressListDataSource.departments;
    }

    get departmentsWithoutAddresses(): Department[] {
        if (!this.addressListDataSource.departments) { return new Array(); }
        const departments = this.addressListDataSource.departments.filter(department => department.addressId == null);
        return departments;
    }

    get hasBranchesAndDepartments(): boolean {
        return (this.addressListDataSource.branches && this.addressListDataSource.branches.length > 0)
            || (this.addressListDataSource.departments && this.addressListDataSource.departments.length > 0);
    }

    get allBranchesAndDepartmentsAdded(): boolean {

        return this.hasBranchesAndDepartments && (this.branchesWithoutAddresses.length === 0 && this.departmentsWithoutAddresses.length === 0);
    }

    get isNotCompany(): boolean {
        if (!this.client) { return true; }
        return this.client.clientTypeId !== 3;
    }

    constructor(
        private readonly alertService: AlertService,
        private readonly appEventsManager: AppEventsManager,
        private readonly branchService: BranchService,
        private readonly departmentService: DepartmentService,
        private readonly privateRouter: Router,
        private readonly addressListDataSource: ClientAddressListDataSource) {
        super(privateRouter, addressListDataSource, '', 'addresses', 'client');
        this.showActionsLink = true;
    }

    ngOnInit(): void {
        this.checkUserAddPermission();
        super.ngOnInit();
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Address');
    }

    getData(data: Client): void {
        this.client = data;
        this.addressListDataSource.getData(data);
    }

    onViewClick(item: Address): void {

        this.privateRouter.navigate([`clientcare/client-manager/address-details/client/${this.client.id}/edit` , item.linkedType.toLowerCase(), item.id]);
    }

    onUnlinkClick(item: Address): void {
        this.isUnlink = true;
        this.selectedAddress = item;

        if (item.linkedType === 'Branch') {
            this.addressOption = 'branch';
            this.selectedBranch = this.branches.find(branch => branch.id === item.linkedId);
            this.unlinkName = this.selectedBranch.name;
        } else {
            this.addressOption = 'department';
            this.selectedDepartment = this.departments.find(department => department.id === item.linkedId);
            this.unlinkName = this.selectedDepartment.name;
        }
    }

    unlinkAddress(): void {
        if (this.addressOption === 'branch') {

            this.appEventsManager.loadingStart(`Removing branch ${this.selectedBranch.name} link to address ${this.selectedAddress.addressLine1}`);
            this.branchService.editBranchAddress(this.selectedBranch.id, null)
                .subscribe(() => this.unlinkAddressDone('Branch', this.selectedBranch.name, this.selectedAddress.addressLine1));
        } else {

            this.appEventsManager.loadingStart(`Removing department ${this.selectedDepartment.name} link to address ${this.selectedAddress.addressLine1}`);
            this.departmentService.editDepartmentAddress(this.selectedDepartment.id, null)
                .subscribe(() => this.unlinkAddressDone('Department', this.selectedDepartment.name, this.selectedAddress.addressLine1));
        }
    }

    cancelUnlinkAddress(): void {
        this.isUnlink = false;
    }
    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'type', header: 'Type', cell: (row: Address) => `${row.linkedType}` },
            { columnDefinition: 'name', header: 'Name', cell: (row: Address) => `${row.linkedName}` },
            { columnDefinition: 'addressLine1', header: 'Street Address 1', cell: (row: Address) => `${row.addressLine1}` },
            { columnDefinition: 'addressPostalCode', header: 'Street Postal Code', cell: (row: Address) => `${row.addressPostalCode}` }
        ];
    }

    showModifyAddress(modificationType: string): void {
        this.modificationType = modificationType;

        if (this.addresses.length > 0 && this.selectedAddress == null) {
            this.selectedAddress = this.addresses[0];
        }

        if (!this.selectedBranch && this.branchesWithoutAddresses.length > 0) {
            this.selectedBranch = this.branchesWithoutAddresses[0];
        }

        if (!this.selectedDepartment && this.departmentsWithoutAddresses.length > 0) {
            this.selectedDepartment = this.departmentsWithoutAddresses[0];
        }

        this.canModifyAddress = this.selectedBranch != null || this.selectedDepartment != null;
        if (this.canModifyAddress && this.selectedBranch != null) { this.addressOption = 'branch'; }
        else if (this.canModifyAddress && this.selectedDepartment != null) { this.addressOption = 'department'; }
        this.isModifyAddress = true;
    }

    cancelModifyAddress(): void {
        this.isModifyAddress = false;
    }

    modifyAddress(): void {
        if (this.modificationType === 'add') {
            const selectedId = this.addressOption === 'branch' ? this.selectedBranch.id : this.selectedDepartment.id;
            this.privateRouter.navigate([`clientcare/client-manager/address-details/client/${this.client.id}/add`, this.addressOption, selectedId]);
        } else {
            if (this.addressOption === 'branch') {


                this.appEventsManager.loadingStart(`Linking branch ${this.selectedBranch.name} to address ${this.selectedAddress.addressLine1}`);
                this.branchService.editBranchAddress(this.selectedBranch.id, this.selectedAddress.id)
                    .subscribe(() => this.linkAddressDone('Branch', this.selectedBranch.name, this.selectedAddress.addressLine1));
            } else {


                this.appEventsManager.loadingStart(`Linking department ${this.selectedDepartment.name} to address ${this.selectedAddress.addressLine1}`);
                this.departmentService.editDepartmentAddress(this.selectedDepartment.id, this.selectedAddress.id)
                    .subscribe(() => this.linkAddressDone('Department', this.selectedDepartment.name, this.selectedAddress.addressLine1));
            }
        }
    }

    linkAddressDone(type: string, itemName: string, address: string): void {
        this.alertService.success(`${type} ${itemName} linked to address ${address}`);
        this.isModifyAddress = false;

        this.linkedDone();
    }

    unlinkAddressDone(type: string, itemName: string, address: string): void {
        this.alertService.success(`${type} ${itemName} unlinked from address ${address}`);
        this.isUnlink = false;

        this.linkedDone();
    }

    linkedDone(): void {
        this.appEventsManager.loadingStop();
        this.getData(null);
    }

    selectionChange(): void {
        this.canModifyAddress = true;
        if (this.addressOption === 'branch') {
            this.canModifyAddress = this.branchesWithoutAddresses.length > 0;
        } else {
            this.canModifyAddress = this.departmentsWithoutAddresses.length > 0;
        }
    }
}
