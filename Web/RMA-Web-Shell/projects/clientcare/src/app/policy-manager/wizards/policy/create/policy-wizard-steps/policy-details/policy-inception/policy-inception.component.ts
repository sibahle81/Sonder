import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'policy-inception',
  templateUrl: './policy-inception.component.html',
  styleUrls: ['./policy-inception.component.css']
})
export class PolicyInceptionComponent implements OnChanges {

  @Input() policy: Policy;
  @Input() isReadOnly = false;

  @Output() policyInceptionChangedEmit: EventEmitter<Policy> = new EventEmitter();

  rolePlayer: RolePlayer;

  adhocDays: number;
  fullYearNumberOfDays: number;

  maxDate: Date;
  paymentFrequencies: PaymentFrequencyEnum[];
  paymentMethods: PaymentMethodEnum[];

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showBanking$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly memberService: MemberService
  ) {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.maxDate = new Date(this.policy.expiryDate);
    this.maxDate.setDate(this.maxDate.getDate() - 1);

    this.createForm();
  }

  getLookups() {
    this.paymentFrequencies = this.ToArray(PaymentFrequencyEnum);
    this.paymentMethods = this.ToArray(PaymentMethodEnum);
  }

  createForm() {
    this.form = this.formBuilder.group({
      inceptionDate: [{ value: null, disabled: this.isReadOnly }],
      expiryDate: [{ value: null, disabled: true }],
      paymentFrequency: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      paymentMethod: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });

    this.setForm();
  }

  setForm() {
    const expiryDate = new Date(this.policy.expiryDate);

    this.form.patchValue({
      inceptionDate: this.policy.targetedPolicyInceptionDate ? this.policy.targetedPolicyInceptionDate : this.policy.policyInceptionDate,
      expiryDate: new Date(expiryDate.setDate(expiryDate.getDate() - 1)),
      paymentFrequency: this.policy.paymentFrequencyId ? PaymentFrequencyEnum[this.policy.paymentFrequencyId] : null,
      paymentMethod: this.policy.paymentMethodId ? PaymentMethodEnum[this.policy.paymentMethodId] : null,
    });

    if (this.policy.paymentMethodId == +PaymentMethodEnum.DebitOrder) {
      this.showBanking$.next(true);
    } else {
      this.showBanking$.next(false);
    }

    this.getRolePlayer();
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    if(!this.policy.policyOwner.rolePlayerBankingDetails) {
      this.policy.policyOwner.rolePlayerBankingDetails = [];
    }
    
    this.policy.policyOwner.rolePlayerBankingDetails.push($event);
  }

  readForm() {
    this.policy.paymentFrequencyId = +PaymentFrequencyEnum[this.form.controls.paymentFrequency.value];
    this.policy.paymentMethodId = +PaymentMethodEnum[this.form.controls.paymentMethod.value];
    this.policy.targetedPolicyInceptionDate = new Date(this.form.controls.inceptionDate.value).getCorrectUCTDate();

    if (this.policy.paymentMethodId == +PaymentMethodEnum.DebitOrder) {
      this.showBanking$.next(true);
    } else {
      this.showBanking$.next(false);
    }

    this.setForm();
    this.policyInceptionChangedEmit.emit(this.policy);
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

  getRolePlayer() {
    if (!this.rolePlayer) {
      this.memberService.getMember(this.policy.policyOwnerId).subscribe(result => {
        this.rolePlayer = result;
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }
}
