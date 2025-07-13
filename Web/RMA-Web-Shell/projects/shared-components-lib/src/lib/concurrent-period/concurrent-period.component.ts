import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-concurrent-period',
  templateUrl: './concurrent-period.component.html',
  styleUrls: ['./concurrent-period.component.css']
})
export class ConcurrentPeriodComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Output() periodSelected: EventEmitter<PeriodStatusEnum> = new EventEmitter();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter();
  @Input() validationDate: Date;

  concurrentPeriodsDetected = false;
  periods: Period[];
  concurrentPeriods: Period[];

  default = 'Current';
  messages: string[] = [];

  constructor(
    private readonly periodService: PeriodService
  ) { }

  ngOnInit() {
    this.checkOpenPeriods();
  }

  checkOpenPeriods() {
    this.periodService.getPeriods().subscribe(periods => {
      this.periods = periods;
      this.concurrentPeriods = periods.filter(s => s.status.toLocaleLowerCase() === 'current' || s.status.toLocaleLowerCase() === 'latest');
      this.concurrentPeriodsDetected = this.concurrentPeriods.length > 1;
      this.periodChange('Current');
      this.isLoading$.next(false);
    });
  }

  periodChange(periodStatus) {
    const selectedPeriod = periodStatus.value ? periodStatus.value.toString().toLocaleLowerCase() : periodStatus.toString().toLocaleLowerCase();
    const passedRules = this.checkPeriodRules(selectedPeriod);
    if (passedRules) {
      if (selectedPeriod === 'latest') {
        this.periodSelected.emit(PeriodStatusEnum.Latest);
      } else {
        this.periodSelected.emit(PeriodStatusEnum.Current);
      }
    }

    this.isValid.emit(passedRules);
  }

  checkPeriodRules(selectedPeriod: string): boolean {
    this.messages = [];

    if (this.validationDate !== null || this.validationDate !== undefined) {
      this.runBackwardAllocationRule(selectedPeriod);
    } else {
      return true;
    }

    return this.messages.length === 0;
  }

  runBackwardAllocationRule(selectedPeriod: string) {
    const period = this.periods.find(s => s.status.toLocaleLowerCase() === selectedPeriod);

    const paymentDate = +(new Date(this.validationDate).getTime());
    const selectedPeriodDate = +(new Date(period.endDate).getTime());
    if (paymentDate > selectedPeriodDate) {
      this.messages.push('Violation of the GL period, Please select a different period');
    }
  }
}
