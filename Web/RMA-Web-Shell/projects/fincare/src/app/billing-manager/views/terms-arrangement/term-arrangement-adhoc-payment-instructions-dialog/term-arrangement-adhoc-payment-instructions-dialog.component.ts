import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AdhocPaymentInstructionsTermArrangementSchedule } from '../../../models/adhoc-payment-instructions-termArrangement-schedule';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TermArrangementSchedule } from '../../../models/term-arrangement-schedule';
import { AdhocPaymentInstructionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/adhoc-payment-instruction-status-enum';

@Component({
  selector: 'app-term-arrangement-adhoc-payment-instructions-dialog',
  templateUrl: './term-arrangement-adhoc-payment-instructions-dialog.component.html',
  styleUrls: ['./term-arrangement-adhoc-payment-instructions-dialog.component.css']
})
export class TermArrangementAdhocPaymentInstructionsDialogComponent implements OnInit, AfterViewInit {

  displayedColumns = ['contractPaymentDate','contractAmount', 'dateToPay', 'amount', 'createdDate', 'status'];
  datasource = new MatTableDataSource<AdhocPaymentInstructionsTermArrangementSchedule>();
  adhocPaymentInstructionsTermArrangementSchedules: AdhocPaymentInstructionsTermArrangementSchedule[]=[];
  paymentInstructionStatuses: { id: number, name: string }[];
  termArrangementSchedules: TermArrangementSchedule[]= [];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;


  constructor(public dialogRef: MatDialogRef<TermArrangementAdhocPaymentInstructionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.adhocPaymentInstructionsTermArrangementSchedules = data.adhocPaymentInstructionsTermArrangementSchedules;
    this.termArrangementSchedules = data.termschedule;
    this.datasource.data = this.adhocPaymentInstructionsTermArrangementSchedules;
  }

  ngOnInit() {
    this.paymentInstructionStatuses = this.ToKeyValuePair(AdhocPaymentInstructionStatusEnum);
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getStatus(statusId: number): string {
    let status = 'Unknown';
    if (this.paymentInstructionStatuses.filter(c => c.id == statusId)[0].name) {
      status = this.formatLookup(this.paymentInstructionStatuses.filter(c => c.id == statusId)[0].name)
    }
    return status;
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }
  
  close(): void {
    this.dialogRef.close(null);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getTermArrangementSchedule(termArrangementScheduleId: number)
  {
   var termSchedule =this.termArrangementSchedules.find(x=>x.termArrangementScheduleId == termArrangementScheduleId);
   return termSchedule;
  }
}
