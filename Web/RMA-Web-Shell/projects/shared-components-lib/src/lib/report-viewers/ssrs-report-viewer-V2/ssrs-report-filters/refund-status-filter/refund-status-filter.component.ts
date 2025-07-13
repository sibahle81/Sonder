import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RefundStatusEnum } from 'projects/fincare/src/app/shared/enum/refund-status.enum';

@Component({
  selector: 'refund-status-filter',
  templateUrl: './refund-status-filter.component.html',
  styleUrls: ['./refund-status-filter.component.css']
})
export class RefundStatusFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  refundStatuses: RefundStatusEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.refundStatuses = this.ToArray(RefundStatusEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      refundStatus: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const refundStatus = this.form.controls.refundStatus.value;

    if (refundStatus) {
      const parameters = [{ key: 'RefundStatusId', value: refundStatus != 'all' ? +RefundStatusEnum[refundStatus] : refundStatus }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        refundStatus: 'all'
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
