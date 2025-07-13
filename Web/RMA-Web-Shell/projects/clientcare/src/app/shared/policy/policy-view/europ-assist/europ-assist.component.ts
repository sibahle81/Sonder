import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'europ-assist',
  templateUrl: './europ-assist.component.html',
  styleUrls: ['./europ-assist.component.css']
})
export class EuropAssistComponent implements OnChanges {

  @Input() policy: Policy;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: UntypedFormGroup;

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policy) {
      this.createForm();
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      isEuropAssist: [{ value: null, disabled: this.isReadOnly }],
      europAssistEffectiveFromDate: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      europAssistEffectiveToDate: [{ value: null, disabled: this.isReadOnly }],
    });

    this.isLoading$.next(false);
  }

  check() {
    if (!this.policy.isEuropAssist) {
      this.policy.europAssistEffectiveDate = null;
      this.policy.europAssistEndDate = null;
    }
  }
}
