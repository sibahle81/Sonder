import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { ConcurrentPeriodDialogComponent } from '../concurrent-period-dialog/concurrent-period-dialog.component';
import { PeriodService } from '../../../shared/period.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Period } from '../../../shared/period';

@Component({
  selector: 'app-manage-periods',
  templateUrl: './manage-periods.component.html',
  styleUrls: ['../../../../../../../../assets/css/site.css']
})
export class ManagePeriodsComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isRollingPeriod$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  dataSource$: BehaviorSubject<Period[]> = new BehaviorSubject([]);

  runPeriodConcurrently: boolean;
  yearsFilter: number[];
  year: number;

  displayColumns = ['startDate', 'endDate', 'modifiedBy', 'modifiedDate', 'status'];

  constructor(
    public dialog: MatDialog,
    private readonly periodService: PeriodService,
    private readonly toastr: ToastrManager
  ) { }

  ngOnInit() {
    this.year = new Date().getFullYear();
    this.getPeriods();
  }

  getPeriods() {
    this.dataSource$.next([]);
    this.isLoading$.next(true);
    this.periodService.getPeriods().subscribe({
      next: (data: Period[]) => {
        const periods = data.filter(p => new Date(p.endDate).getFullYear() === this.year);
        this.yearsFilter = Array.from((new Set(data.map(event => (new Date(event.endDate).getFullYear())))));
        this.dataSource$.next(periods);
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  yearChange($event) {
    this.year = $event.value as number;
    this.getPeriods();
  }

  addPeriods() {
    this.isLoading$.next(true);
    this.periodService.createBillingPeriods().subscribe({
      next: (result) => {
        this.getPeriods();
        this.toastr.successToastr('Billing periods have been created.');
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  startRollPeriods() {
    const dialogRef = this.dialog.open(ConcurrentPeriodDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data != null) {
          this.runPeriodConcurrently = data.runPeriodConcurrently as boolean;
          this.rollPeriods();
        }
      }
    });
  }

  closeCurrentPeriod()
  {
    this.runPeriodConcurrently = false;
    this.rollPeriods();
  }

  rollPeriods() {
    this.isRollingPeriod$.next(true);
    this.periodService.rollBillingPeriods(this.runPeriodConcurrently).subscribe({
      next: (count: number) => {
        if (count > 0) {
          this.getPeriods();
          this.toastr.successToastr('Billing period has been rolled.');
        } else {
          this.toastr.errorToastr('No records have been updated.');
        }
      },
      error: () => {
        this.toastr.errorToastr('Could not roll periods.');
      },
      complete: () => {
        this.isRollingPeriod$.next(false);
      }
    });
  }

  getModifiedBy(period: Period): string {
    return period.status === 'Future' ? null : period.modifiedBy;
  }

  getModifiedDate(period: Period): Date {
    return period.status === 'Future' ? null : period.modifiedDate;
  }

  getPeriodClass(period: Period): string {
    switch (period.status.toLowerCase()) {
      case 'history':
        return 'gray';
      case 'current':
      case 'latest':
        return 'green';
      case 'future':
        return 'blue';
      default:
        return '';
    }
  }
}
