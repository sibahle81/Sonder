import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { GroupListDataSource } from './group-list.datasource';
import { Group } from '../../shared/Entities/group';
import { GroupService } from '../../shared/services/group.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';


@Component({
    templateUrl: './group-list.component.html',

    selector: 'group-details-list'
})
export class GroupListComponent extends ListComponent  {
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    isRemove: boolean;
    reference: string;
    itemType: string;
    followUpId: number;

    getData(): void {
        this.privateDataSource.getData();
    }


    constructor(
        alertService: AlertService,
        private readonly privateRouter: Router,
        private readonly privateDataSource: GroupListDataSource,
        private readonly groupService: GroupService,
        private privateservice: AlertService, ) {
        super(alertService, privateRouter, privateDataSource, 'client-manager/group-details', 'Group', 'Groups');
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['clientcare/client-manager/group-details', item.id]);
    }


    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Group Name', cell: (row: Group) => `${row.name}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Group) => `${row.description}` }
        ];
    }
}
