import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'year-filter',
  templateUrl: './year-filter.component.html',
  styleUrls: ['./year-filter.component.css']
})
export class YearFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  years: number[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.setYears();
  }

  setYears() {
    this.years = [];
    const currentYear = +(new Date().getCorrectUCTDate().getFullYear());

    for (let index = currentYear - 3; index <= currentYear + 1; index++) {
      this.years.push(+index);
    }

    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      year: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const year = this.form.controls.year.value;

    if (year) {
      const parameters = [{ key: 'Year', value: year != 'all' ? year : year }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        year: 'all'
      });

      this.readForm();
    }
  }
}
