import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Payment } from '../../../../shared/models/payment.model';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { PaymentTableRefundDataSource } from './payment-table-refund.datasource';

@Component({
  selector: 'payment-table-refund',
  templateUrl: './payment-table-refund.component.html',
  styleUrls: ['./payment-table-refund.component.css']
})
export class PaymentTableRefundComponent implements OnInit {

  // dataSource: ClaimTableDashboardDataSource;
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild('filter', { static: false }) filter: ElementRef;

  // Setting up the Datagrid columns
  columnDefinitions: any[] = [
    { display: 'Policy Number', def: 'policyReference', show: true },
    { display: 'Status', def: 'paymentStatus', show: true },
    { display: 'Amount', def: 'amount', show: true },
    { display: 'Action', def: 'action', show: true }
  ];

  heading: string;
  tablePayments: Payment[];
  hasTablePayments = false;

  get hasPayments(): boolean {
    if (this.isLoading) { return false; }
    if (!this.dataSource || !this.dataSource.data) { return false; }
    return this.dataSource.data.length > 0;
  }

  constructor(
    public dataSource: PaymentTableRefundDataSource,
    protected readonly router: Router,
    protected readonly wizardService: WizardService,
  ) {
    this.loadLookupLists();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.paginator && this.sort) {
      this.dataSource.setControls(this.paginator, this.sort);
    }
  }

  loadLookupLists(): void {
  }

  ngOnInit() {
  }

  // Populating the table with data
  fillData(payments: Payment[], name: string) {
    this.getDataValues(payments);
    this.tablePayments = payments;
    this.heading = name;
    this.hasTablePayments = true;
  }

  // Setting the data for datagrid
  getDataValues(payments: Payment[]) {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    this.dataSource.getData(payments);

  }

  // Hiding table
  hideTable() {
    this.tablePayments = null;
    this.hasTablePayments = false;
  }

  // Getting the display name from the enum to show in Grid
  getType(index: number): any {
    const name = PaymentStatusEnum[index];
    switch (name) {
      case PaymentStatusEnum[PaymentStatusEnum.NotReconciled]:
        return 'Not Reconciled';
      default:
        return name;
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  onSelect(row: any) {
    this.router.navigate(['']);
  }
}
