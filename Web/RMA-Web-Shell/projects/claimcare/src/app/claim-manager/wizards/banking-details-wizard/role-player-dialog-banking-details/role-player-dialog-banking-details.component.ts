import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'app-role-player-dialog-banking-details',
  templateUrl: './role-player-dialog-banking-details.component.html',
  styleUrls: ['./role-player-dialog-banking-details.component.css']
})
export class RolePlayerDialogBankingDetailsComponent implements OnInit {
  dataSource: any;
  dateFormat: string ='yyy/MM/dd';
  bankAccountTypes: Lookup[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filter: ElementRef;
  displayedColumns = ['bankName', 'bankAccountType', 'branchCode', 'accountHolderName', 'accountNumber', 'effectiveDate','actions'];
  constructor(public dialogRef: MatDialogRef<RolePlayerDialogBankingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.dataSource = new MatTableDataSource(data.dataSource);
      this.bankAccountTypes = data.bankAccountTypes;
    }

  ngOnInit(){ }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  onSelect(bankingDetails: RolePlayerBankingDetail): void {
    this.dialogRef.close(bankingDetails);
  }

}
