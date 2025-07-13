import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';

@Component({
  selector: 'industry-class-filter',
  templateUrl: './industry-class-filter.component.html',
  styleUrls: ['./industry-class-filter.component.css']
})
export class IndustryClassFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  industryClasses: IndustryClassEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const industryClass = this.form.controls.industryClass.value;

    if (industryClass) {
      const parameters = [{ key: 'IndustryClassId', value: industryClass != 'all' ? +IndustryClassEnum[industryClass] : industryClass }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        industryClass: 'all'
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
