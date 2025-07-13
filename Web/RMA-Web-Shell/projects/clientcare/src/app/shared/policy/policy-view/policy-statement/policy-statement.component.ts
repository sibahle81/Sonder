import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { PolicyStatementDataSource } from './policy-statement.datasource';

@Component({
  selector: 'policy-statement',
  templateUrl: './policy-statement.component.html',
  styleUrls: ['./policy-statement.component.css']
})
export class PolicyStatementComponent implements OnChanges {

  @Input() policyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['transactionDate', 'description', 'debitAmount', 'creditAmount'];

  form: any;
  dataSource: PolicyStatementDataSource;
  currentQuery: any;

  constructor(
    private readonly invoiceService: InvoiceService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new PolicyStatementDataSource(this.invoiceService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }
}
