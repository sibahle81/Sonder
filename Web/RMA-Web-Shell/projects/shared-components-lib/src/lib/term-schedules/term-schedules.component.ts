import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { TermArrangementSchedule } from 'projects/fincare/src/app/billing-manager/models/term-arrangement-schedule';
import { TermScheduleComponent } from 'projects/fincare/src/app/billing-manager/views/terms-arrangement/term-schedule/term-schedule.component';
import { TermArrangementScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-schedule-status';

@Component({
  selector: 'term-schedules',
  templateUrl: './term-schedules.component.html',
  styleUrls: ['./term-schedules.component.css']
})
export class TermSchedulesComponent implements OnInit {
  @Input() rolePlayer: RolePlayer;

  displayedColumns = ['paymentDate', 'termStatus', 'amount', 'balance'];
  termschedule: TermArrangementSchedule[] = [];
  datasource = new MatTableDataSource<TermArrangementSchedule>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor() {
    this.datasource.data = this.termschedule;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getStatusDescription(value: number): string {
    return TermArrangementScheduleStatusEnum[value];
  }
}
