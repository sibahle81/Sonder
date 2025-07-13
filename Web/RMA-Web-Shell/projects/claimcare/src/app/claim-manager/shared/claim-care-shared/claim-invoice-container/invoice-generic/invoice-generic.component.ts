import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PractitionerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/practitioner-type-enum';
import { InvoiceFormService } from '../invoice-form.service';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { Claim } from '../../../entities/funeral/claim.model';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { maximumPayableAmount } from 'projects/shared-utilities-lib/src/lib/validators/maximum-payable.validator';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'invoice-generic',
  templateUrl: './invoice-generic.component.html',
  styleUrls: ['./invoice-generic.component.css']
})
export class InvoiceGenericComponent extends UnSubscribe implements OnChanges {

  @Input() claimInvoice: ClaimInvoice;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() action: string;
  @Input() disableControls: string[] = [];
  @Input() selectedPayeeTypes = [PayeeTypeEnum[PayeeTypeEnum.Individual], PayeeTypeEnum[PayeeTypeEnum.Employer],
  PayeeTypeEnum[PayeeTypeEnum.HealthCareProvider], PayeeTypeEnum[PayeeTypeEnum.SundryProvider]];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading invoice details...please wait');

  form: UntypedFormGroup;
  payeeTypes: PayeeTypeEnum[];
  practitioners: PractitionerTypeEnum[];
  payees: any[] = [];
  payeeType: PayeeTypeEnum;
  beneficiary = PayeeTypeEnum.Individual;
  healthCareProvider = PayeeTypeEnum.HealthCareProvider;
  sundryProvider = PayeeTypeEnum.SundryProvider;
  employer = PayeeTypeEnum.Employer;
  maxAmountAllowed: number = 9999999;
  showMessage: boolean;
  payeeRolePlayerId: number = 0;

  hideAmount = false;
  claim: Claim;
  maxDate = new Date();
  minDate: Date | string;
  date: string;
  ttdInvoice = false;
  isEdit = false;
  beneficiaryAmountExceedMessage = '';
  selectedPayeeType: PayeeTypeEnum;
  beneficiaries: RolePlayer[] = [];


  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly invoiceFormService: InvoiceFormService,
    public readonly claimCareService: ClaimCareService,
    public readonly rolePlayerService: RolePlayerService,
    private readonly claimInvoiceService: ClaimInvoiceService) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.claimInvoice) {
      this.date = this.claimInvoice.claimInvoiceType != +ClaimInvoiceTypeEnum.SundryInvoice
        && this.claimInvoice.claimInvoiceType != +ClaimInvoiceTypeEnum.DaysOffInvoice ? 'Date Submitted' : 'Date Received';

      this.getEvent();
      this.createForm();
      this.ttdInvoice = this.claimInvoice.claimInvoiceType
        && this.claimInvoice.claimInvoiceType != ClaimInvoiceTypeEnum.DaysOffInvoice
        && this.claimInvoice.claimInvoiceType != ClaimInvoiceTypeEnum.PartialDependencyLumpsum
        && this.claimInvoice.claimInvoiceType != ClaimInvoiceTypeEnum.SundryInvoice;

      this.clearValidationToFormControl();
    }

    if (this.claimInvoice && this.claimInvoice.claimInvoiceType === ClaimInvoiceTypeEnum.DaysOffInvoice) {
      this.clearDaysOffValidationToFormControl();
    }
  }

  clearValidationToFormControl() {
    this.form.get('dateReceived').clearValidators();
    this.form.get('dateReceived').markAsTouched();
    this.form.controls.dateReceived.updateValueAndValidity();
  }

  clearDaysOffValidationToFormControl() {
    this.form.get('invoiceAmount').clearValidators();
    this.form.get('invoiceAmount').markAsTouched();
    this.form.controls.dateReceived.updateValueAndValidity();
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  getLookups() {
    this.payeeTypes = this.ToArray(PayeeTypeEnum);
    this.practitioners = this.ToArray(PractitionerTypeEnum);
  }

  getEvent() {
    this.claimCareService.getEvent(this.personEvent.eventId).subscribe(result => {
      this.minDate = result.eventDate;
    })
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  payeeTypeChange($event: PayeeTypeEnum, payeeClaimInvoice: ClaimInvoice) {
    if (payeeClaimInvoice && payeeClaimInvoice.payeeTypeId && payeeClaimInvoice.payeeTypeId > 0) {
      if (this.claimInvoice.payeeRolePlayerId > 0) {
        this.rolePlayerService.getRolePlayer(this.claimInvoice.payeeRolePlayerId).subscribe(result => {
          this.payees = [];
          this.payees.push(result.displayName);
          this.form.controls["payee"].setValue(result.displayName);
          this.form.controls["payeeRolePlayer"].setValue(result.rolePlayerId);
          this.isLoading$.next(false);
        });
      }
      else if (payeeClaimInvoice.payee !== '') {
        this.payees = [];
        this.payees.push(payeeClaimInvoice.payee);
        this.form.controls["payee"].setValue(payeeClaimInvoice.payee);
        this.isLoading$.next(false);
      }
    }
    else {
      this.isEdit = true;
      let type = +PayeeTypeEnum[$event]
      if (type === this.employer) {
        this.getEmployer();
      }
      else {
        this.payeeType = +PayeeTypeEnum[$event];
        this.payees = [];
        this.form.controls["payee"].enable();
        this.form.controls["payee"].reset();
        this.form.controls["payee"].markAsTouched();
        this.form.updateValueAndValidity();
      }
    }

    this.selectedPayeeType = $event;
    if (this.personEvent && this.beneficiaries.length === 0) {
      if (+PayeeTypeEnum[$event] == +PayeeTypeEnum.Individual || $event == +PayeeTypeEnum.Individual)
        this.getBeneficiaries();
    }
  }

  getEmployer() {
    this.rolePlayerService.getRolePlayer(this.personEvent.companyRolePlayerId).subscribe(result => {
      this.payees = [];
      this.payees.push(result.displayName);
      this.form.controls["payee"].setValue(result.displayName);
      this.form.controls["payeeRolePlayer"].setValue(result.rolePlayerId);
    });
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      invoiceDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      dateReceived: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      payeeType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      payee: [{ value: null, disabled: true }, Validators.required],
      invoiceAmount: [{ value: null, disabled: this.isReadOnly }, [Validators.required, Validators.min(1), Validators.max(this.maxAmountAllowed)]],
      description: [{ value: null, disabled: this.isReadOnly }],
      capturedDate: [{ value: null, disabled: this.isReadOnly }],
      payeeRolePlayer: [{ value: null, disabled: false }],
    });

    if (this.claimInvoice.claimInvoiceType === ClaimInvoiceTypeEnum.WidowLumpSumAward) {
      this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.WidowsLumpSum, this.personEvent.personEventId)
        .subscribe(result => {
          if (result && result.length > 0) {
            this.maxAmountAllowed = result[0].estimatedValue;
            this.form.get('invoiceAmount').setValidators([Validators.required, Validators.min(1), Validators.max(this.maxAmountAllowed)]);
            if (!this.claimInvoice.invoiceAmount) //dont override value set during setForm() on edit
              this.form.get("invoiceAmount").setValue(result[0].outstandingValue);
          }
        });
    }
    else if (this.claimInvoice.claimInvoiceType === ClaimInvoiceTypeEnum.FuneralExpenses) {
      this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.Funeral, this.personEvent.personEventId)
        .subscribe(result => {
          if (result && result.length > 0) {
            this.maxAmountAllowed = result[0].estimatedValue;
            this.form.get('invoiceAmount').setValidators([Validators.required, Validators.min(1), Validators.max(this.maxAmountAllowed)]);
            if (!this.claimInvoice.invoiceAmount)
              this.form.get("invoiceAmount").setValue(result[0].outstandingValue);
          }
        });
    }
    else if (this.claimInvoice.claimInvoiceType === ClaimInvoiceTypeEnum.SundryInvoice) {
      this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.Sundry, this.personEvent.personEventId)
        .subscribe(result => {
          if (result && result.length > 0) {
            this.maxAmountAllowed = result[0].estimatedValue;
            this.form.get('invoiceAmount').setValidators([Validators.required, Validators.min(1), Validators.max(this.maxAmountAllowed)]);
            if (!this.claimInvoice.invoiceAmount) 
              this.form.get("invoiceAmount").setValue(result[0].outstandingValue);
          }
        });
    }

    if (this.disableControls.length > 0) {
      this.hideAmount = true;
      this.form.get(this.disableControls[0]).clearValidators();
      this.form.controls.invoiceAmount.updateValueAndValidity();
    }

    this.invoiceFormService.addForm(this.form);
    this.setForm();
    this.payeeTypes = this.payeeTypes.filter(a => this.selectedPayeeTypes.includes(a.toString()));

    if (this.claimInvoice.claimInvoiceType === ClaimInvoiceTypeEnum.DaysOffInvoice) {
      this.form.controls["payeeType"].setValue(PayeeTypeEnum[PayeeTypeEnum.Employer]);
    }

    this.payeeTypeChange(this.form.getRawValue().payeeType, this.claimInvoice)

    if (this.claimInvoice && this.claimInvoice.payeeTypeId && this.claimInvoice.payeeTypeId > 0) {
      this.form.controls["payeeType"].setValue(PayeeTypeEnum[this.claimInvoice.payeeTypeId]);
      this.isEdit = false
    }
  }

  setForm() {
    this.form.patchValue({
      invoiceDate: this.claimInvoice && this.claimInvoice.dateSubmitted ? this.claimInvoice.dateSubmitted : this.claimInvoice.invoiceDate,
      dateReceived: this.claimInvoice && this.claimInvoice.dateReceived ? this.claimInvoice.dateReceived : null,
      payeeType: this.claimInvoice && this.claimInvoice.payeeTypeId ? this.claimInvoice.payeeTypeId : null,
      payee: null,
      payeeRolePlayer: null,
      invoiceAmount: this.claimInvoice && this.claimInvoice.invoiceAmount ? this.claimInvoice.invoiceAmount : null,
      description: this.action ? this.action : null,
      capturedDate: new Date()
    });

    this.isLoading$.next(false);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  populatePayee($event: any) {
    if (this.claimInvoice && this.claimInvoice.payeeTypeId && this.claimInvoice.payeeTypeId > 0 && !$event) {
      this.rolePlayerService.getRolePlayer(this.claimInvoice.payeeRolePlayerId).subscribe(result => {
        this.form.controls["payee"].setValue(result.displayName);
        this.form.controls["payeeRolePlayer"].setValue(result.rolePlayerId);
        this.payeeRolePlayerId = result.rolePlayerId;
      });
    }
    else {
      this.isEdit = true;
      if ($event && $event.displayName) {
        this.payees.push($event.displayName);
        this.form.controls["payee"].setValue($event.displayName);
        this.form.controls["payeeRolePlayer"].setValue($event.rolePlayerId);
        this.payeeRolePlayerId = $event.rolePlayerId;
      }
      else if ($event && $event.name) {
        this.payees.push($event.name);
        this.form.controls["payee"].setValue($event.name);
        this.form.controls["payeeRolePlayer"].setValue($event.rolePlayerId);
        this.payeeRolePlayerId = $event.rolePlayerId;
      }
    }
  }

  closePayeeTableEmit() {
    this.payeeType = undefined;
    this.form.controls.payeeType.setValue('');
    this.payeeTypes = this.payeeTypes.filter(a => this.selectedPayeeTypes.includes(a.toString()));
  }

  checkWidowPayoutMaxTotals() {
    if (this.maxAmountAllowed > 0) {
      let beneficiariesCount = 0;
      beneficiariesCount = this.beneficiaries.filter(b => b.fromRolePlayers[0].rolePlayerTypeId == +BeneficiaryTypeEnum.Spouse ||
        b.fromRolePlayers[0].rolePlayerTypeId == +BeneficiaryTypeEnum.Husband ||
        b.fromRolePlayers[0].rolePlayerTypeId == +BeneficiaryTypeEnum.Wife
      ).length;
      if (beneficiariesCount > 1) {
        const payable = +(this.maxAmountAllowed / beneficiariesCount).toFixed(2);
        this.beneficiaryAmountExceedMessage = `${beneficiariesCount} spouses identified. The maximum amount paid to each widow cannot execeed ${payable}`
        this.form.get('invoiceAmount').setValidators([maximumPayableAmount(payable)]);
        this.form.get('invoiceAmount').markAsTouched();
        this.form.get('invoiceAmount').updateValueAndValidity();
      }
    }
  }

  getBeneficiaries() {
    if (this.claimInvoice.claimInvoiceType == ClaimInvoiceTypeEnum.WidowLumpSumAward) {//different types can be added here if split beneficary payment calculation is required
      this.claimCareService.getPersonEventDetails(this.personEvent.personEventId).subscribe(result => {
        if (result.personEvents && result.personEvents.length > 0) {
          let beneficiaryIds = result.personEvents[0].rolePlayer.toRolePlayers.map(a => a.fromRolePlayerId);
          if (beneficiaryIds.length > 0) {
            this.rolePlayerService.getBeneficiaries(beneficiaryIds).pipe(tap(data => {
              if (data && data.length > 0) {
                this.beneficiaries = [...data];
                if (this.claimInvoice.claimInvoiceType == ClaimInvoiceTypeEnum.WidowLumpSumAward) {//do custom logic based on type
                  this.checkWidowPayoutMaxTotals();
                }
              }
            })).subscribe();
          }
        }
      })
    }
  }
}

