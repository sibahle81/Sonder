import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PreDefinedDateFilterEnum } from './models/pre-defined-range-date-filter.enum';

@Component({
  selector: 'date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.css']
})
export class DateRangeFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;

  @Input() defaultDateRange = PreDefinedDateFilterEnum.ThisWeek;

  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  preDefinedDates: PreDefinedDateFilterEnum[];

  form: UntypedFormGroup;

  startDate: Date;
  endDate: Date;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public datepipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.preDefinedDates = this.ToArray(PreDefinedDateFilterEnum);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.setForm(false);
    } else {
      this.setForm(true);
    }

    if (changes.triggerReset) {
        this.setForm(true);
    }
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      predefinedDate: [{ value: PreDefinedDateFilterEnum[this.defaultDateRange], disabled: false }],
      startDate: [{ value: null, disabled: false }],
      endDate: [{ value: null, disabled: false }]
    });
  }

  setForm(resetDefault: boolean) {
    this.createForm();

    if (resetDefault) {
      this.form.patchValue({
        predefinedDate: PreDefinedDateFilterEnum[this.defaultDateRange]
      });
      this.setDateRange(PreDefinedDateFilterEnum[this.defaultDateRange]);
    } else {
      const startDate = this.datepipe.transform(this.startDate, 'yyyy-MM-dd')
      const endDate = new Date(new Date(this.endDate).getTime() + (1000 * 60 * 60 * 24));

      const parameters = [{ key: 'StartDate', value: startDate }, { key: 'EndDate', value: this.datepipe.transform(endDate, 'yyyy-MM-dd') }];
      this.parameterEmit.emit(parameters);
    }
  }

  setDateRange($event: any) {
    const today = new Date().getCorrectUCTDate();

    let parameters = [];

    switch (+PreDefinedDateFilterEnum[$event]) {

      case PreDefinedDateFilterEnum.Today: {
        this.startDate = new Date().getCorrectUCTDate();
        this.endDate = new Date().getCorrectUCTDate();

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });

        break;
      }

      case PreDefinedDateFilterEnum.AllTime: {
        this.startDate = null;
        this.endDate = null;

        this.form.controls.startDate.reset();
        this.form.controls.endDate.reset();

        parameters = [{ key: 'StartDate', value: 'all' }, { key: 'EndDate', value: 'all' }];
        this.parameterEmit.emit(parameters);
        break;
      }

      case PreDefinedDateFilterEnum.ThisWeek: {
        this.startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        this.endDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });

        break;
      }
      case PreDefinedDateFilterEnum.LastWeek: {
        this.startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        this.endDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });

        break;
      }
      case PreDefinedDateFilterEnum.ThisMonth: {
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });

        break;
      }
      case PreDefinedDateFilterEnum.LastMonth: {
        this.startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth(), 0);

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });
        break;
      }
      case PreDefinedDateFilterEnum.ThisYear: {
        this.startDate = new Date(today.getFullYear(), 0, 1);
        this.endDate = today;

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });
        break;
      }
      case PreDefinedDateFilterEnum.Last30Days: {
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 30); 
        this.endDate = today;

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });
        break;
      }
      case PreDefinedDateFilterEnum.Last90Days: {
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 90); 
        this.endDate = today;

        this.form.patchValue({
          startDate: this.startDate,
          endDate: this.endDate
        });
        break;
      }
      default:
        break;
    }

    if (+PreDefinedDateFilterEnum[$event] != PreDefinedDateFilterEnum.AllTime) {
      this.endDate = new Date(new Date(this.endDate).getTime() + (1000 * 60 * 60 * 24));
      parameters = [{ key: 'StartDate', value: this.datepipe.transform(this.startDate, 'yyyy-MM-dd') }, { key: 'EndDate', value: this.datepipe.transform(this.endDate, 'yyyy-MM-dd') }];
      this.parameterEmit.emit(parameters);
    }
  }

  readForm() {
    this.form.controls.predefinedDate.reset();

    this.startDate = new Date(this.form.controls.startDate.value);
    this.endDate = new Date(this.form.controls.endDate.value);

    if (this.startDate && this.endDate) {
      this.endDate = new Date(new Date(this.endDate).getTime() + (1000 * 60 * 60 * 24));

      const startDate = this.datepipe.transform(this.startDate, 'yyyy-MM-dd');
      const endDate = this.datepipe.transform(this.endDate, 'yyyy-MM-dd');

      const parameters = [{ key: 'StartDate', value: startDate }, { key: 'EndDate', value: endDate }];
      this.parameterEmit.emit(parameters);
    }
  }

  getStartDate(): Date {
    return new Date(this.form.controls.startDate.value);
  }

  getEndDate(): Date {
    return new Date(this.form.controls.endDate.value ? this.form.controls.endDate.value : Date.now);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(\d)([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])(\d)/g, '$1 $2');
  }  
}
