import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';

@Component({
  selector: 'payment-status-filter',
  templateUrl: './payment-status-filter.component.html',
  styleUrls: ['./payment-status-filter.component.css']
})
export class PaymentStatusFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  paymentStatuses: PaymentStatusEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.paymentStatuses = this.ToArray(PaymentStatusEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      paymentStatus: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const paymentStatus = this.form.controls.paymentStatus.value;

    if (paymentStatus) {
      const parameters = [{ key: 'PaymentStatusId', value: paymentStatus != 'all' ? +PaymentStatusEnum[paymentStatus] : paymentStatus }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        paymentStatus: 'all'
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
