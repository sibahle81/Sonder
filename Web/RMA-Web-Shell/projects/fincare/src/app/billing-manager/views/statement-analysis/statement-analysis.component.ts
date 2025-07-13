import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StatementAnalysisDatasource } from './statement-analysis.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-statement-analysis',
  templateUrl: './statement-analysis.component.html'
})
export class StatementAnalysisComponent implements OnInit {
  canExport: number;
  displayedColumns = ['controlNumber','controlName','year','period',
  'statementNumber','statementLineNumber','debtorName','userReference','transactionDate',
   'amount','bankAccountNumber','rmaReference','allocated','bankCode'];

  columns: any[] = [
      { display: 'CONTROL NUMBER', variable: 'controlNumber', },
      { display: 'CONTROL NAME', variable: 'controlName', },
      { display: 'YEAR', variable: 'year', },
      { display: 'PERIOD', variable: 'period', },
      { display: 'BANK ACCOUNT NUMBER', variable: 'bankAccountNumber', },
      { display: 'STATEMENT NUMBER', variable: 'statementNumber', },
      { display: 'STATEMENT LINE NUMBER', variable: 'statementLineNumber', },
      { display: 'DATE', variable: 'transactionDate', },
      { display: 'DESCRIPTION', variable: 'userReference', },
      { display: 'AMOUNT', variable: 'amount', },
      { display: 'BANK CODE', variable: 'bankCode', },
      { display: 'ALLOCATED', variable: 'allocated', },
      { display: 'DEBTOR', variable: 'debtorName', },
      { display: 'RMA REFERENCE', variable: 'rmaReference', },
  ];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  constructor(public readonly dataSource: StatementAnalysisDatasource,
              private readonly router: Router,
              private readonly datePipe: DatePipe,
              private readonly alertService: AlertService,
              private readonly toastr: ToastrManager) {
  }

  ngOnInit() {
    this.getData();
 }
 getData(){
  this.dataSource.filter = '';
  this.dataSource.setControls(this.paginator, this.sort);
  this.dataSource.getData();

  if (this.dataSource.data != null) {
      this.canExport = 1;
    }
}

exporttoCSV(): void {
  const def: any[] = [];
  const exprtcsv: any[] = [];
  ( JSON.parse(JSON.stringify(this.dataSource.data)) as any[]).forEach(x => {
      const obj = new Object();
      const frmt = new Format();
      for (let i = 0; i < this.columns.length; i++) {
          const transfrmVal = frmt.transform(x[this.columns[i].variable], '');
          obj[this.columns[i].display] = transfrmVal;
      }
      exprtcsv.push(obj);
  }
  );

  DataGridUtil.downloadcsv(exprtcsv, def, 'List_Of' + 'StatementAnalysis');
  this.toastr.successToastr('Statement analysis exported successfully');
}

applyFilter(filterValue: any) {
this.dataSource.filter = filterValue.trim().toLowerCase();
}

clear() {
this.router.navigate(['fincare/billing-manager/']);
}

}
