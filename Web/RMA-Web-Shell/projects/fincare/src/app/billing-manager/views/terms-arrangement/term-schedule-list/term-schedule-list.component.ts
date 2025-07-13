import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TermArrangementSchedule } from '../../../models/term-arrangement-schedule';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { TermArrangement } from '../../../models/term-arrangement';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { TermArrangementScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-schedule-status';

@Component({
  selector: 'app-term-schedule-list',
  templateUrl: './term-schedule-list.component.html',
  styleUrls: ['./term-schedule-list.component.css']
})
export class TermScheduleListComponent implements OnInit, AfterViewInit {

  @Input() rolePlayerId: number;
  @Input() selectedTermArrangementScheduleIds: number[] = [];
  @Input() termArrangementScheduleStatus : TermArrangementScheduleStatusEnum = TermArrangementScheduleStatusEnum.Pending;
  @Input() filterWithStatus = false;
  @Output() selectionChangeEmit: EventEmitter<TermArrangementSchedule[]> = new EventEmitter();

  selectedTermArrangementSchedules: TermArrangementSchedule[] = [];
  debtorActiveTermArrangement: TermArrangement ;
  errorMessage = '';

  isLoadingTermArrangements$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  displayedColumns = ['paymentDate', 'termStatus', 'amount', 'balance','collectableBalance', 'actions'];
  termschedule: TermArrangementSchedule[] = [];
  datasource = new MatTableDataSource<TermArrangementSchedule>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  
  constructor(
    private termArrangementService: TermArrangementService,
  ) { }

  ngOnInit() {
    this.getTermArrangement();
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getTermArrangement() {
    this.isLoadingTermArrangements$.next(true);
    this.termArrangementService.getTermArrangementsByRolePlayerId(this.rolePlayerId).pipe(map(data => {
      if (data) {

      this.debtorActiveTermArrangement = data.find(x=>x.isActive);
      let termArrangementSchedules : TermArrangementSchedule[];

      if(!this.debtorActiveTermArrangement)
      {
        this.errorMessage ="No active  Term Arrangement found";
      }
      else
      {
          if(this.filterWithStatus)
          {
            termArrangementSchedules =this.debtorActiveTermArrangement.termArrangementSchedules.filter(x=> x.termArrangementScheduleStatus == this.termArrangementScheduleStatus && !x.isCollectionDisabled)
          }
          else
          {
            termArrangementSchedules =this.debtorActiveTermArrangement.termArrangementSchedules.filter(x=>!x.isCollectionDisabled);
          }

          //filter for hasCollectablePositiveBalance
          termArrangementSchedules =termArrangementSchedules.filter(x=> this.hasCollectablePositiveBalance(x));

          this.datasource.data = termArrangementSchedules;
          this.selectedTermArrangementSchedules = termArrangementSchedules.filter(x=> this.selectedTermArrangementScheduleIds.indexOf(x.termArrangementScheduleId) > -1 );

          if( termArrangementSchedules == undefined || termArrangementSchedules.length ===0)
          {
            this.errorMessage ="No Active Term Arrangement Schedules found";
          }
          
      }

        this.isLoadingTermArrangements$.next(false);
      }
      else {
        this.errorMessage ="No active  Term Arrangement found";
        this.isLoadingTermArrangements$.next(false);
      }
    })).subscribe();
  }

  getCollectableBalance(termArrangement: TermArrangementSchedule)
  {
    const sum=termArrangement.adhocPaymentInstructionsTermArrangementSchedules.filter(x=>x.isActive && !x.isDeleted)
    .reduce((sum,current)=> sum+ current.amount, 0);

    const balance = termArrangement.amount - sum;
    return balance;
  }

  hasCollectablePositiveBalance(termArrangement: TermArrangementSchedule): boolean
  {
    const sum=termArrangement.adhocPaymentInstructionsTermArrangementSchedules.filter(x=>x.isActive && !x.isDeleted)
    .reduce((sum,current)=> sum+ current.amount, 0);

    const balance = termArrangement.amount - sum;
    return (balance > 0)
  }

  termScheduleChecked(event: any, item: TermArrangementSchedule) {
    if (event.checked) {
      this.selectedTermArrangementScheduleIds.push(item.termArrangementScheduleId);
      this.selectedTermArrangementSchedules.push(item);
      this.selectionChangeEmit.emit(this.selectedTermArrangementSchedules);
    } else {
      this.unTickItem(item.termArrangementScheduleId);
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.selectedTermArrangementSchedules.length; i++) {
      if ((this.selectedTermArrangementScheduleIds[i] === itemId)) {
        this.selectedTermArrangementScheduleIds.splice(i, 1);
        const indexOfItem = this.selectedTermArrangementSchedules.findIndex(c => c.termArrangementScheduleId === itemId)
        if (indexOfItem > -1) {
          this.selectedTermArrangementSchedules.splice(indexOfItem, 1);
        }
        break;
      }
    }
    this.selectionChangeEmit.emit(this.selectedTermArrangementSchedules);
  }

  getStatusDescription(value: number): string {
    return TermArrangementScheduleStatusEnum[value];
  }

}
