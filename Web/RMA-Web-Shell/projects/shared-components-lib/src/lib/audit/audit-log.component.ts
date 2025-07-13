import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuditResult, AuditRequest, AuditLogPropertyDetail } from './audit-models';
import { AuditLogDatasource } from './audit-log.datasource';
import { ListFilteredComponent } from '../list-filtered-component/list-filtered.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AuditLogService } from './audit-log.service';
import * as moment from 'moment';
import { WizardService } from '../wizard/shared/services/wizard.service';
import { ProductType } from '../wizard/shared/models/product-type.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent extends ListFilteredComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  serviceType: ServiceTypeEnum;
  auditResult: AuditResult;
  individualLoading = false;
  isHostAdd = true;
  itemType: string;
  actionAdded = 'Added';
  actionModified = 'Modified';
  wizardName: string;

  @Input() name: string;
  displayName: string;
  currentUser: string;
  titlePlural: string;

  constructor(
    router: Router,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    private readonly privateDataSource: AuditLogDatasource,
    private readonly wizardService: WizardService
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
      { columnDefinition: 'date', header: 'Date', cell: (row: AuditResult) => `${this.datePipe.transform(row.date, 'yyyy/MM/dd HH:mm:ss')}` }
    ];
  }

  onSelect(item: any): void {
    this.individualLoading = true;
    this.auditLogService.getAuditLog(this.serviceType, item.id).subscribe(
      data => {
        this.itemType = data.itemType;
        this.auditResult = data;
        this.auditResult.propertyDetails.forEach(property => {
          if (property.propertyName.includes('date')) {
            property.oldValue = moment(property.oldValue, 'yyyy/MM/dd HH:mm:ss', true).toString();
            property.newValue = moment(property.newValue, 'yyyy/MM/dd HH:mm:ss', true).toString();
          }
          if (property.propertyName === 'Code') {
            this.getCreator(item);
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

  getCreator(item: any) {
    if (item.wizardId !== null && item.wizardId !== undefined ) {    
      this.wizardService.getWizard(item.wizardId).subscribe(result => {
        if (result != null) {
          this.createPropertyDetail(result.createdBy);
        } else {
          this.createPropertyDetail('Not Available');
        }
      });
    }
  }

  getNameField(name: string, actionType: string) {
    switch (this.itemType) {
      case ProductType[ProductType.product_Product]:
        this.wizardName = `${actionType} Product: '${name}'`;
        break;
      case ProductType[ProductType.product_ProductOption]:
        this.wizardName = `${actionType} Option: '${name}'`;
        break;
      case ProductType[ProductType.product_Benefit]:
        this.wizardName = `${actionType} Benefit: '${name}'`;
        break;
    }
  }

  createPropertyDetail(value: string) {
    if (this.serviceType === ServiceTypeEnum.ProductManager) {
      const detail = new AuditLogPropertyDetail();
      detail.propertyName = 'Requested by';
      detail.newValue = value;
      this.auditResult.propertyDetails.push(detail);
    }
  }
}
