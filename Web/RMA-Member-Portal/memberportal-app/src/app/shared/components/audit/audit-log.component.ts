import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
 
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuditResult, AuditRequest } from 'src/app/core/models/audit-models';
import { AuditLogService } from 'src/app/core/services/audit-log.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ServiceType } from '../../enums/service-type.enum';
import { ListFilteredComponent } from '../list-filtered-component/list-filtered.component';
import { AuditLogDatasource } from './audit-log.datasource';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent extends ListFilteredComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  serviceType: ServiceType;
  auditResult: AuditResult;
  individualLoading = false;
  isHostAdd = true;

  @Input() name: string;
  displayName: string;
  currentUser: string;
  titlePlural: string;

  constructor(
    router: Router,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    private readonly privateDataSource: AuditLogDatasource
  ) {
    super(router, privateDataSource, '', 'audit logs', 'client', false);
    this.actionsLinkText = 'View';
    this.titlePlural = 'Audit Logs';
    this.showActionsLink = true;
  }

  ngOnInit(): void {
    this.privateDataSource.data.length = 0;
    super.ngOnInit();
    this.currentUser = this.authService.getUserEmail();

    this.privateDataSource.setControls(this.paginator, this.sort, false);
  }

  getData(data: AuditRequest): void {
    this.isHostAdd = false;
    this.serviceType = data.serviceType;
    this.privateDataSource.getData(data);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.privateDataSource.filter = filterValue;
  }

  clearFilter() {
    this.privateDataSource.filter = '';
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'action', header: 'Action', cell: (row: AuditResult) => `${row.action}` },
      { columnDefinition: 'username', header: 'User', cell: (row: AuditResult) => `${row.username}` },
      { columnDefinition: 'date', header: 'Date', cell: (row: AuditResult) => `${this.datePipe.transform(row.date, 'yyyy/MM/dd hh:mm:ss')}` }
    ];
  }

  onSelect(item: any): void {
    this.individualLoading = true;
    this.auditLogService.getAuditLog(this.serviceType, item.id).subscribe(
      data => {
        this.auditResult = data;
        this.auditResult.propertyDetails.forEach(property => {
          if (property.propertyName.includes('date')) {
            property.oldValue = moment(property.oldValue, 'yyyy/MM/dd hh:mm:ss', true).toString();
            property.newValue = moment(property.newValue, 'yyyy/MM/dd hh:mm:ss', true).toString();
          }
        });
        this.getDisplayName();
      }
    );
  }

  getDisplayName(): void {
    if (this.auditResult.username === this.currentUser) {
      this.displayName = 'you';
      this.individualLoading = false;
    } else {
      this.displayName = this.auditResult.username;
      this.individualLoading = false;
    }
  }

  back(): void {
    this.auditResult = null;
  }
}
