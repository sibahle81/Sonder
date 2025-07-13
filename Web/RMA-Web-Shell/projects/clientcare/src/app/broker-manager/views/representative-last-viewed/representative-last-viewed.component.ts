import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepresentativeLastViewedListDataSource } from 'projects/clientcare/src/app/broker-manager/datasources/representative-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({

  selector: 'representative-last-viewed',
  templateUrl: './representative-last-viewed.component.html',
})
export class RepresentativeLastViewedComponent extends ListComponent implements OnInit {

  canEdit: boolean;

  get isLoading(): boolean { return this.privateDataSource.isLoading; }

  constructor(
    router: Router,
    alertService: AlertService,
    private readonly privateDataSource: RepresentativeLastViewedListDataSource
  ) {
    super(alertService, router, privateDataSource, 'clientcare/broker-manager/broker-details', 'Representative', 'Representatives', '', false, true);
    this.checkUserPermissions();
    this.hideAddButton = true;
  }

  checkUserPermissions(): void {
    this.canEdit = userUtility.hasPermission('Edit Representative');
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'code', header: 'Code', cell: (row: Representative) => `${row.code}` },
      { columnDefinition: 'name', header: 'Name', cell: (row: Representative) => `${row.name}` },
      { columnDefinition: 'idNumber', header: 'Id Number', cell: (row: Representative) => `${row.idNumber}` }
    ];
  }

  linkAgent(item: Representative): void {
    this.router.navigate(['clientcare/broker-manager/link-agent/new', item.id]);
  }
}
