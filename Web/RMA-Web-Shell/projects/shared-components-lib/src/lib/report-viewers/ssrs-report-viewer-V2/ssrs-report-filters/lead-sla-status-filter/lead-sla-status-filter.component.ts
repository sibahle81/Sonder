import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';

@Component({
  selector: 'lead-sla-status-filter',
  templateUrl: './lead-sla-status-filter.component.html',
  styleUrls: ['./lead-sla-status-filter.component.css']
})
export class LeadSlaStatusFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  statuses: LeadClientStatusEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.statuses = this.ToArray(LeadClientStatusEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      status: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const status = this.form.controls.status.value as string;

    if (status) {
      const parameters = [{ key: 'Status', value: status }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        status: 'all'
      });
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
