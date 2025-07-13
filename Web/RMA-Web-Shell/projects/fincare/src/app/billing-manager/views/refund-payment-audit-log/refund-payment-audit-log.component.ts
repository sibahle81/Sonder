import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { AuditLogDatasource } from 'projects/shared-components-lib/src/lib/audit/audit-log.datasource';
import { AuditRequest, AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-refund-payment-audit-log',
  templateUrl: './refund-payment-audit-log.component.html',
  styleUrls: ['./refund-payment-audit-log.component.css']
})
export class RefundPaymentAuditLogComponent  extends ListFilteredComponent implements OnInit  {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  serviceType: ServiceTypeEnum;
  auditResult: AuditResult; // New
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
  private readonly privateDataSource: AuditLogDatasource,
  public dialogRef: MatDialogRef<RefundPaymentAuditLogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {
  super(router, privateDataSource, '', 'audit logs', 'client', false);
  this.actionsLinkText = 'View';
  this.titlePlural = 'Audit Logs';
  this.showActionsLink = true;
}

ngOnInit() {
  this.privateDataSource.data.length = 0;
  super.ngOnInit();
  this.currentUser = this.authService.getUserEmail();

  this.privateDataSource.setControls(this.paginator, this.sort, false);

  if (this.data.auditRequestData != null) {
  this.getData(this.data.auditRequestData);
  }
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

// Better  solution is to make newItem into a class
getBeneficiaryEmail(newItem: string): string {
if (!newItem) {
 return null;
}
const historyData = JSON.parse(newItem);
return historyData.EmailAddress;
}

getPaymentStatus(row: AuditResult): string {
if (!row.newItem) {
  return null;
}

const historyData = JSON.parse(row.newItem);
const olditem = JSON.parse(row.oldItem);

if (!olditem.EmailAddress) {
  return historyData.PaymentStatus;
} else {
  if (olditem.EmailAddress === historyData.EmailAddress) {
    return historyData.PaymentStatus;
  } else {
    return 'Email Address Change';
  }
}

}


setupDisplayColumns(): void {
  this.columns = [
      { columnDefinition: 'action', header: 'Action', cell: (row: AuditResult) => `${this.getPaymentStatus(row)}` },
      { columnDefinition: 'username', header: 'User', cell: (row: AuditResult) => `${row.username}` },
      { columnDefinition: 'beneficiaryEmail', header: 'Beneficiary Email Address', cell: (row: AuditResult) => `${this.getBeneficiaryEmail(row.newItem)}` },
      { columnDefinition: 'date', header: 'Date', cell: (row: AuditResult) => `${this.datePipe.transform(row.date, 'medium')}` }
  ];
}

onSelect(item: any): void {
  this.individualLoading = true;
  this.auditResult = item;
  this.getDisplayName();
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

closeDialog(): void {
this.dialogRef.close();
this.dialogRef.afterClosed().subscribe(() => {
});
}

closePaymentAudit(): void {
this.dialogRef.close();
}

}
