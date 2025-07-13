import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { EuropAssistPremiumsDatasource } from './europ-assist-premiums.datasource';

@Component({
  selector: 'app-europ-assist-premiums',
  templateUrl: './europ-assist-premiums.component.html',
})
export class EuropAssistPremiumsComponent implements OnInit {
  canExport: number;
  searchText: string;
  placeHolder = 'Search by User Reference, Policy Number, Debtor Name,Invoice Number or Bank Account Number';
  displayedColumns = ['debtorName', 'invoiceNumber', 'policyNumber', 'transactionDate', 'amount','schemeName','brokerName',
'policyStatus','clientType'];

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  constructor(public readonly dataSource: EuropAssistPremiumsDatasource,
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
  this.dataSource.data.forEach(element => {
      delete element.debtorPaymentId;
      delete element.bankStatementEntryId;
      delete element.hyphenDateProcessed;
      delete element.hyphenDateReceived;
      delete element.bankAccountNumber;
  });
  const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {header:[]});
  const workBook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
  XLSX.writeFile(workBook, 'EuropeAssistPremiums.xlsx');
  this.toastr.successToastr('Europe assist premiums exported successfully');
}

searchData(data) {
  this.applyFilter(data);
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

clear() {
 this.router.navigate(['fincare/billing-manager/']);
}

}

