import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MultipleContactListDataSource } from './multiple-contact-list.datasource';
import { Contact } from '../../shared/Entities/contact';
import { Client } from '../../shared/Entities/client';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './multiple-contact-list.component.html',

    selector: 'multiple-contact-list'
})
export class MultipleContactListComponent extends ListFilteredComponent implements OnInit {
    client: Client;
    canAdd: boolean;

    get isLoading(): boolean { return this.multipleContactListDataSource.isLoading; }


    constructor(

        private readonly privateRouter: Router,
        private readonly location: Location,
        private readonly multipleContactListDataSource: MultipleContactListDataSource

    ) {

        super(privateRouter, multipleContactListDataSource, '', 'contactDetails', 'Contact');

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
        this.multipleContactListDataSource.getData(data);
    }


    onRemove(item: Contact): void {
        const index = this.multipleContactListDataSource.data.findIndex(detail => detail.email === item.email);
        this.multipleContactListDataSource.data.splice(index, 1);
        this.getData(this.multipleContactListDataSource.data);
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Contact) => `${row.name}` },
            { columnDefinition: 'email', header: 'Email', cell: (row: Contact) => `${row.email}` },
            { columnDefinition: 'designation', header: 'Designation', cell: (row: Contact) => `${row.designation}` },
            { columnDefinition: 'telephoneNumber', header: 'Telephone Number', cell: (row: Contact) => `${row.telephoneNumber}` },
            { columnDefinition: 'mobileNumber', header: 'Mobile Number', cell: (row: Contact) => `${row.mobileNumber}` }
        ];
    }

    back(): void {
        this.location.back();
    }

}
