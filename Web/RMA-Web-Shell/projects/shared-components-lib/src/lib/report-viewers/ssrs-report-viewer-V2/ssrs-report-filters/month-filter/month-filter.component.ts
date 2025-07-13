import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';

@Component({
  selector: 'month-filter',
  templateUrl: './month-filter.component.html',
  styleUrls: ['./month-filter.component.css']
})
export class MonthFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  months: MonthEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.months = this.ToArray(MonthEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      month: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const month = this.form.controls.month.value;

    if (month) {
      const parameters = [{ key: 'MonthId', value: month != 'all' ? +MonthEnum[month] : month }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        month: 'all'
      });

      this.readForm();
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
