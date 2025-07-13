import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { RecoveryAbilityPostingAuditDatasource } from './recovery-ability-posting-audit.datasource';

@Component({
  selector: 'app-recovery-ability-posting-audit',
  templateUrl: './recovery-ability-posting-audit.component.html',
  styleUrls: ['./recovery-ability-posting-audit.component.css']
})
export class RecoveryAbilityPostingAuditComponent implements OnInit {
  canExport: number;
  searchText: string;
  displayedColumns = ['PayeeDetails', 'Bank', 'PaymentType', 'AccountDetails', 'BankBranch', 'Amount', 'PaymentDate', 'time', 'Reference'];
  id: number;
  amountLabel: string;
  placeHolder = 'Search by Reference';
  @ViewChild('TABLE', { static: true }) table: ElementRef;
  columns: any[] = [
      { display: 'PAYEE DETAILS', variable: 'payeeDetails', },
      { display: 'BANK', variable: 'bank', },
      { display: 'PAYMENT TYPE', variable: 'paymentType', },
      { display: 'ACCOUNT DETAILS', variable: 'accountDetails', },
      { display: 'BANK BRANCH', variable: 'bankBranch', },
      { display: 'AMOUNT PAID', variable: 'amount', }, { display: 'DATE', variable: 'date', },
      { display: 'TIME', variable: 'time', },
      { display: 'REFERENCE', variable: 'reference', }
  ];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  constructor(public readonly dataSource: RecoveryAbilityPostingAuditDatasource,
              private readonly abilityCollectionsService: AbilityCollectionsService,
              private readonly router: Router,
              private readonly datePipe: DatePipe,
              private readonly activatedRoute: ActivatedRoute,
              private readonly alertService: AlertService) {

  }

  ngOnInit() {
      this.id = 0;
      this.amountLabel = 'AMOUNT';
      this.dataSource.setControls(this.paginator, this.sort);
      this.activatedRoute.params.subscribe((params: any) => {
          if (params.id) {
              this.id = params.id;
          }
      });
      if (this.id > 0) {
          this.getAbilityPosting(this.id);
      }
  }

  getAbilityPosting(id: number) {
      this.abilityCollectionsService.getAbilityCollection(id).subscribe(data => {
          // this.dataSource.startLoading('Loading transactions....')
          this.dataSource.filter = data.reference;

          this.dataSource.setControls(this.paginator, this.sort);
          this.dataSource.getData();

          if (this.dataSource.data != null) {
              this.canExport = 1;
          } else {
              this.canExport = 0;
          }
      });
  }

  getAbilityPostings(): void {
      this.dataSource.filter = '';
      this.dataSource.setControls(this.paginator, this.sort);
      this.dataSource.getData();
      this.dataSource.isLoading = false;

      if (this.dataSource.data != null) {
          this.canExport = 1;
      } else {
          this.canExport = 0;
      }
  }

  done(statusMesssage: string) {
      this.alertService.success(statusMesssage, 'Success', true);
      this.dataSource.isLoading = true;
      this.dataSource.getData();
  }

  searchData(searchFilter) {
    this.applyFilter(searchFilter);
  }

  applyFilter(filterValue: any) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      this.paginator.length = this.dataSource.filteredData.length;
      this.dataSource.paginator.firstPage();
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  exporttoCSV(): void {
    this.dataSource.data.forEach(element => {
        delete element.id;
        delete element.isDeleted;
        delete element.isActive;
        delete element.createdBy;
        delete element.createdDate;
        delete element.modifiedBy;
        delete element.modifiedDate;
    });
    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {header: []});
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, this.dataSource.data[0].reference + '_Transactions_Details.xlsx');
    this.alertService.success('Transactions exported successfully');
  }

  clear() {
      this.router.navigate(['fincare/finance-manager/recovery-posting-list']);
  }

}


