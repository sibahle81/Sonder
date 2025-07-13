import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'financial-period-filter',
  templateUrl: './financial-period-filter.component.html',
  styleUrls: ['./financial-period-filter.component.css']
})
export class FinancialPeriodFilterComponent implements OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;

  selectedYear: number;
  selectedMonth: number;
  selectedPeriod: any;

  constructor(
    private readonly periodService: PeriodService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    this.selectedPeriod = null;
    this.triggerReset = !this.triggerReset;
  }

  setYear($event) {
    this.selectedYear = $event[0].value == 'all' ? null : $event[0].value;
    this.handleEmit();
  }

  setMonth($event) {
    this.selectedMonth = $event[0].value == 'all' ? null : $event[0].value;
    this.handleEmit();
  }

  handleEmit() {
    if (this.selectedYear && this.selectedMonth) {
      this.isLoading$.next(true);
      this.periodService.getPeriodByYearAndMonth(this.selectedYear, this.selectedMonth).subscribe(result => {
        this.selectedPeriod = result ? result : 'all';
        const parameters = [{ key: 'FinancialPeriodId', value: this.selectedPeriod != 'all' ? (this.selectedPeriod as Period).id : null }];
        this.parameterEmit.emit(parameters);
        this.isLoading$.next(false);
      });
    } else if (!this.selectedYear && !this.selectedMonth) {
      const parameters = [{ key: 'FinancialPeriodId', value: null }];
      this.parameterEmit.emit(parameters);
    }
  }
}
