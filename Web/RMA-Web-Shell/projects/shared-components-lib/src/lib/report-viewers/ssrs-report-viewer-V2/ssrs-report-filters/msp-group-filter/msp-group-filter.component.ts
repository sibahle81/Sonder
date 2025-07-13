import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { GetMSPGroups } from 'projects/fincare/src/app/payment-manager/models/get-msp-groups-model';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'msp-group-filter',
  templateUrl: './msp-group-filter.component.html',
  styleUrls: ['./msp-group-filter.component.css']
})
export class MspGroupFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  mspGroups: GetMSPGroups[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.paymentService.getMSPGroups().subscribe(results => {
      this.mspGroups = results;
      this.createForm();
      this.isLoading$.next(false)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      mspGroup: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const mspGroup = this.form.controls.mspGroup.value;

    if (mspGroup) {
      const parameters = [{ key: 'mspGroupName', value: mspGroup != 'all' ? mspGroup.name : '' }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        branch: 'all'
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
