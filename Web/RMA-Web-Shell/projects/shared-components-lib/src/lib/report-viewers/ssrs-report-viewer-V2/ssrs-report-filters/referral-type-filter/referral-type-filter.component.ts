import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReferralTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-type-enum';

@Component({
  selector: 'referral-type-filter',
  templateUrl: './referral-type-filter.component.html',
  styleUrls: ['./referral-type-filter.component.css']
})
export class ReferralTypeFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Input() title = 'Referral Type';

  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  referralTypes: ReferralTypeEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.referralTypes = this.ToArray(ReferralTypeEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      referralType: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const referralType = this.form.controls.referralType.value;

    if (referralType) {
      const parameters = [{ key: 'ReferralType', value: referralType != 'all' ? +ReferralTypeEnum[referralType] : referralType }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        moduleType: 'all'
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
