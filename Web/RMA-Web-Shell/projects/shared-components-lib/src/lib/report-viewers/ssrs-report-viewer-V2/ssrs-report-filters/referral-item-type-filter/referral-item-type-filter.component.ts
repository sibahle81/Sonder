import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  selector: 'referral-item-type-filter',
  templateUrl: './referral-item-type-filter.component.html',
  styleUrls: ['./referral-item-type-filter.component.css']
})
export class ReferralItemTypeFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Input() title = 'Referral Item Type';

  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  referralItemTypes: ReferralItemTypeEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.referralItemTypes = this.ToArray(ReferralItemTypeEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      referralItemType: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const referralItemType = this.form.controls.referralItemType.value;

    if (referralItemType) {
      const parameters = [{ key: 'ReferralItemType', value: referralItemType != 'all' ? +ReferralItemTypeEnum[referralItemType] : referralItemType }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        referralItemType: 'all'
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
