import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'search-criteria-filter',
  templateUrl: './search-criteria-filter.component.html',
  styleUrls: ['./search-criteria-filter.component.css']
})
export class SearchCriteriaFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  searchCriteria: string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchCriteria: [{ value: null, disabled: false }]
    });
  }

  readForm() {
    const searchCriteria = [{ key: 'SearchCriteria', value: this.form.controls.searchCriteria.value }];

    if (searchCriteria) {
      this.parameterEmit.emit(searchCriteria);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        searchCriteria: [{ value: null, disabled: false }]
      });

      this.readForm();
    }
  }
}
