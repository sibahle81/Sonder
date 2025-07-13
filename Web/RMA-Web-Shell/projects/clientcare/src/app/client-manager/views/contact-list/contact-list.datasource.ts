import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Branch } from '../../shared/Entities/branch';
import { BranchService } from '../../shared/services/branch.service';
import { Client } from '../../shared/Entities/client';
import { Contact } from '../../shared/Entities/contact';
import { ContactListViewModel } from '../../shared/Entities/contact-list-view-model';
import { ContactService } from '../../shared/services/contact.service';
import { Department } from '../../shared/Entities/department';
import { DepartmentService } from '../../shared/services/department.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';



@Injectable()
export class ContactListDataSource extends Datasource {
  loadCounter = 0;
  contactDetails: Contact[];
  clients: Client[];
  branches: Branch[];
  departments: Department[];
  contactDetail: Contact;
  client: Client;
  contactTypes: Lookup[];

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly clientService: ClientService,
    private readonly branchService: BranchService,
    private readonly departmentService: DepartmentService,
    private readonly contactDetailsService: ContactService,
    private readonly lookupService: LookupService) {
    super(appEventsManager, alertService);

    this.defaultSortColumn = 'name';
  }

  getData(client: Client) {
    this.isLoading = true;
    this.loadCounter = 0;

    if (client) {
      this.isLoading = true;
      this.client = client;
      this.getClientBranches(client.id);
      this.getClientDepartments(client.id);
      this.getContactDetail(this.client.id);
    }
  }


  getContactDetail(clientId: number): void {
    this.contactDetailsService.getContacts(clientId).subscribe(
      contacts => {

        console.log('contacts', contacts);

        this.lookupService.getServiceTypes().subscribe(lookUp => {
          // tslint:disable-next-line: prefer-const
          let serviceTypes = lookUp;
          const contactListDetails = new Array<ContactListViewModel>();
          contacts.forEach(contact => {

            console.log('Contact', contact);

            const viewModel = new ContactListViewModel();
            viewModel.id = contact.id;
            viewModel.designation = contact.designation;
            viewModel.name = contact.name;
            viewModel.telephoneNumber = contact.telephoneNumber;
            viewModel.unsubscribe = contact.unsubscribe;
            viewModel.serviceTypeName = contact.serviceTypeIds
              .map(item => serviceTypes.find(i => i.id === item)
                ? serviceTypes.find(i => i.id === item).name
                : '').join(' | ');
            contactListDetails.push(viewModel);

          });

          this.dataChange.next(contactListDetails);
          this.stopLoading();
          this.isLoading = false;

        });
      }
    );
  }

  getClientDepartments(clientId: number): void {
    if (clientId == null) { return; }
    this.departmentService.getDepartmentsByClient(clientId).subscribe(
      departments => {
        this.departments = departments;
      });
  }

  getClientBranches(clientId: number): void {
    if (clientId == null) { return; }
    this.branchService.getBranchesByClient(clientId).subscribe(
      branches => {
        this.branches = branches;
      });
  }

  connect(): Observable<ContactListViewModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: ContactListViewModel) => {
        const searchStr = (item.name + item.designation).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      const sortedData = this.getSortedData(this.filteredData.slice());
      return sortedData;
    }));
  }
}
