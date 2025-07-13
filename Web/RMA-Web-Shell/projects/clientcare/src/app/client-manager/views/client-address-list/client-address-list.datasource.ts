import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { Client } from '../../shared/Entities/client';
import { Address } from '../../shared/Entities/address';
import { AddressService } from '../../shared/services/address.service';
import { Branch } from '../../shared/Entities/branch';
import { BranchService } from '../../shared/services/branch.service';
import { Department } from '../../shared/Entities/department';
import { DepartmentService } from '../../shared/services/department.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ClientAddressListDataSource extends Datasource {
    loadCounter = 0;
    addresses: Address[];
    branches: Branch[];
    departments: Department[];

    client: Client;

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly clientService: ClientService,
        private readonly addressService: AddressService,
        private readonly branchService: BranchService,
        private readonly departmentService: DepartmentService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'clientName';
    }

    getData(client: Client): void {
        this.loadCounter = 0;
        if (client) { this.client = client; }

        this.getClientAddresses(this.client.id);
        this.getClientBranches(this.client.id);
        this.getClientDepartments(this.client.id);
    }

    getClientAddresses(clientId: number): void {
        this.addressService.getAllAddressesForClient(clientId).subscribe(
            addresses => {
                this.addresses = addresses;
                this.combineData();
            });
    }

    getClientBranches(clientId: number): void {
        this.branchService.getBranchesByClient(clientId).subscribe(
            branches => {
                this.branches = branches;
                this.combineData();
            });
    }

    getClientDepartments(clientId: number): void {
        this.departmentService.getDepartmentsByClient(clientId).subscribe(
            departments => {
                this.departments = departments;
                this.combineData();
            });
    }

    combineData(): void {
        this.loadCounter++;
        if (this.loadCounter !== 3) { return; }

        const combinedAddresses = new Array<Address>();

        const clientAddress = this.addresses.find(lookup => lookup.id === this.client.addressId);
        let address = new Address();

        address.linkedId = this.client.id;
        address.linkedName = this.client.name;
        address.linkedType = 'Client';
        address.id = clientAddress.id;
        address.addressLine1 = clientAddress.addressLine1;
        address.addressPostalCode = clientAddress.addressPostalCode;
        combinedAddresses.push(address);

        this.branches.forEach(branch => {
// tslint:disable-next-line: no-shadowed-variable
            const branchAddress = this.addresses.find(address => address.id === branch.addressId);
            if (branchAddress) {
                address = new Address();
                address.linkedId = branch.id;
                address.linkedName = branch.name;
                address.linkedType = 'Branch';
                address.id = branchAddress.id;
                address.addressLine1 = branchAddress.addressLine1;
                address.addressPostalCode = branchAddress.addressPostalCode;
                combinedAddresses.push(address);
            }
        });

        this.departments.forEach(department => {
            const departmentAddress = this.addresses.find(address => address.id === department.addressId);
            if (departmentAddress) {
                address = new Address();
                address.linkedId = department.id;
                address.linkedName = department.name;
                address.linkedType = 'Department';
                address.id = departmentAddress.id;
                address.addressLine1 = departmentAddress.addressLine1;
                address.addressPostalCode = departmentAddress.addressPostalCode;
                combinedAddresses.push(address);
            }
        });

        this.isLoading = false;
        this.dataChange.next(combinedAddresses);
    }

    connect(): Observable<Client[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Address) => {
                const searchStr = (item.linkedName + item.linkedType + item.addressPostalCode + item.addressLine1).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
