import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';

@Component({
  selector: 'claim-payment-referral',
  templateUrl: './claim-payment-referral.component.html',
  styleUrls: ['./claim-payment-referral.component.css']
})
export class ClaimPaymentReferralComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');

  form: UntypedFormGroup;
  
  constructor( private readonly formBuilder: UntypedFormBuilder) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.personEvent.personEventId) { return }
    this.isLoading$.next(false);
  }

  getLookups() {}

  createForm() {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      country: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      marriageType: [{ value: '', disabled: this.isReadOnly }],
      marriageDate: [{ value: '', disabled: this.isReadOnly }],
    });
  }

  patchForm(rolePlayer: any) {
    this.form.patchValue({
      country: rolePlayer.person.countryOriginId,
      marriageType: rolePlayer.person.marriageType,
      marriageDate: rolePlayer.person.marriageDate,
    });
  }

  readForm(): any {
    if (!this.form.valid) {
      return;
    }
    const formDetails = this.form.getRawValue();
    const personEvent = this.personEvent;
  

    return personEvent;
  }
}
