import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { ContactService } from '../../shared/services/contact.service';
import { Contact } from '../../shared/Entities/contact';
import { Client } from '../../shared/Entities/client';
import { Branch } from '../../shared/Entities/branch';
import { BranchService } from '../../shared/services/branch.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DepartmentService } from '../../shared/services/department.service';
import { Department } from '../../shared/Entities/department';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';

@Injectable()
export class MultipleContactListDataSource extends Datasource {
    loadCounter = 0;
    contactDetails: Contact[];
    clients: Client[];
    branches: Branch[];
    departments: Department[];
    contactdDetailsList: Contact[];
    contactDetail: Contact;
    client: Client;

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly clientService: ClientService,
        private readonly branchService: BranchService,
        private readonly departmentService: DepartmentService,
        private readonly contactDetalsService: ContactService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'clientName';
    }

    getData(contact: Contact[]) {
        this.isLoading = true;
        this.loadCounter = 0;
        this.dataChange.next(contact);
        this.stopLoading();
        this.isLoading = false;
    }


    connect(): Observable<Contact[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Contact) => {
                const searchStr = (item.name + item.email).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
