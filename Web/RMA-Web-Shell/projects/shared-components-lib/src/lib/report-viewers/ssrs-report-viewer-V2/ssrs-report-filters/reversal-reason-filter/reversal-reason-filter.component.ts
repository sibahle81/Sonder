import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReversalReasonEnum } from 'projects/shared-models-lib/src/lib/enums/reversal-reason-enum';

@Component({
  selector: 'reversal-reason-filter',
  templateUrl: './reversal-reason-filter.component.html',
  styleUrls: ['./reversal-reason-filter.component.css']
})
export class ReversalReasonFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  reversalReasons: ReversalReasonEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.reversalReasons = this.ToArray(ReversalReasonEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      reversalReason: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const reversalReason = this.form.controls.reversalReason.value;

    if (reversalReason) {
      const parameters = [{ key: 'ReversalReason', value: reversalReason != 'all' ? +ReversalReasonEnum[reversalReason] : reversalReason }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        reversalReason: 'all'
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
