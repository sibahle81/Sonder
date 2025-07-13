import { Component, Inject, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GeneralAuditDataSource } from './general-audit-dialog.datasource';
import { ClientItemTypeEnum } from 'src/app/shared/enums/client-item-type-enum';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditResult, AuditLogPropertyDetail } from '../../audit/audit-models';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';
import { userUtility } from 'src/app/shared-utilities/user-utility/user-utility';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'general-audit-dialog',
  templateUrl: './general-audit-dialog.component.html',
  styleUrls: ['./general-audit-dialog.component.css']
})
export class GeneralAuditDialogComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  form: any;
  query = '';
  dataSource: GeneralAuditDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  displayedColumns: string[] = ['username', 'action', 'date', 'actions'];

  requiredPermission = 'View Audits';
  hasPermission = false;

  propertiesToDisplay: string[] = ['IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate'];
  hiddenProperties: string[] = ['IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate'];

  selectedAuditResult: AuditResult;
  selectedPropertyDetails: AuditLogPropertyDetail[];

  currentQuery: any;
  auditResults: AuditResult;
  serviceType: ServiceType;
  clientItemType: ClientItemTypeEnum;
  heading = '';

  showDetail: boolean;
  showSubDetail: boolean;

  constructor(
    public dialogRef: MatDialogRef<GeneralAuditDataSource>,
    private readonly auditService: AuditLogService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    dialogRef.disableClose = true;
    
    this.serviceType = data.serviceType;
    this.clientItemType = data.clientItemType;
    this.currentQuery = data.itemId;
    this.heading = data.heading;

    if (data.propertiesToDisplay && data.propertiesToDisplay.length > 0) {
      data.propertiesToDisplay.forEach((s: string) => {
        this.propertiesToDisplay.push(s);
      });
    }
  }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.dataSource = new GeneralAuditDataSource(this.auditService);
    this.dataSource.serviceType = this.serviceType;
    this.dataSource.clientItemType = this.clientItemType;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);;
    this.getAuditLogs();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getAuditLogs() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  viewAuditResultDetails(auditResult: AuditResult) {
    this.selectedAuditResult = auditResult;
    this.selectedPropertyDetails = this.selectedAuditResult.propertyDetails.filter(s => !this.propertyDetailEndsWithId(s) && !this.hiddenProperties.includes(s.propertyName) && s.hasChanged && this.propertiesToDisplay.includes(s.propertyName));
    this.showDetail = true;
  }

  closeAuditResult() {
    if (this.showDetail) {
      this.showDetail = !this.showDetail;
    } else
      this.dialogRef.close();
  }

  propertyDetailEndsWithId(propertyDetail: AuditLogPropertyDetail): boolean {
    return propertyDetail.propertyName.toLowerCase().includes('userid') ? false : propertyDetail.propertyName.toLowerCase().endsWith('id');
  }

  closeAuditResultDetails() {
    this.showDetail = false;
  }

  closeAuditSubResultDetails() {
    this.showSubDetail = false;
    this.reset();
  }

  formatValues(value: string): string {
    return value ? value : '<no data>';
  }

  formatText(text: string) {
    if (!text) { return 'N/A'; }
    const result = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
    return result.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
  }

  reset() {
    this.selectedAuditResult = null;
  }
}
