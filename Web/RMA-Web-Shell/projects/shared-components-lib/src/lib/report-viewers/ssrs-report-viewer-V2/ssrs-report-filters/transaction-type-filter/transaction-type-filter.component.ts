import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';

@Component({
  selector: 'transaction-type-filter',
  templateUrl: './transaction-type-filter.component.html',
  styleUrls: ['./transaction-type-filter.component.css']
})
export class TransactionTypeFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Input() title = 'Transaction Type';

  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  transactionTypes: TransactionTypeEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.transactionTypes = this.ToArray(TransactionTypeEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      transactionType: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const transactionType = this.form.controls.transactionType.value;

    if (transactionType) {
      const parameters = [{ key: 'TransactionType', value: transactionType != 'all' ? +TransactionTypeEnum[transactionType] : transactionType }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        transactionType: 'all'
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
