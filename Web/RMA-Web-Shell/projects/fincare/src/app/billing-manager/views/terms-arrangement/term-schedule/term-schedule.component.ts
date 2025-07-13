import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TermArrangementScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-schedule-status';
import { TermArrangementSchedule } from '../../../models/term-arrangement-schedule';

@Component({
  selector: 'app-term-schedule',
  templateUrl: './term-schedule.component.html',
  styleUrls: ['./term-schedule.component.css']
})
export class TermScheduleComponent implements OnInit, AfterViewInit {

  displayedColumns = ['paymentDate', 'termStatus', 'amount', 'balance','collectableBalance', 'disableCollection', 'collectBalance'];
  termschedule: TermArrangementSchedule[] = [];
  datasource = new MatTableDataSource<TermArrangementSchedule>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  showSubmit =true;

  constructor(public dialogRef: MatDialogRef<TermScheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.termschedule = data.termschedule;
    this.datasource.data = this.termschedule;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  close(): void {
    this.dialogRef.close(null);
  }
  
  update() {
    this.dialogRef.close({ termschedule: this.datasource.data });
  }

  getStatusDescription(value: number): string {
    return TermArrangementScheduleStatusEnum[value];
  }

  disableCollectionSelection($event: any, row: TermArrangementSchedule) {
    if ($event.checked) {
      row.isCollectionDisabled = true;
    }
    else {
      row.isCollectionDisabled = false;
    }
  };

  collectBalanceSelection($event: any, row: TermArrangementSchedule) {
    if ($event.checked) {
      row.collectBalance = true;
    }
    else {
      row.collectBalance = false;
    }
  };

  getCollectableBalance(termArrangement: TermArrangementSchedule)
  {
    const sum=termArrangement.adhocPaymentInstructionsTermArrangementSchedules.filter(x=>x.isActive && !x.isDeleted)
    .reduce((sum,current)=> sum+ current.amount, 0);
    const balance = termArrangement.amount - sum;
    return balance;
  }

}
