import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CorrectiveEntryNotification } from 'projects/shared-components-lib/src/lib/models/corrective-entry-notification.model';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-corrective-entry-details',
  templateUrl: './corrective-entry-details.component.html',
  styleUrls: ['./corrective-entry-details.component.css']
})
export class CorrectiveEntryDetailsComponent extends WizardDetailBaseComponent<CorrectiveEntryNotification> implements OnInit{
  entryTypes: Lookup[];
  loading: boolean;
  scheduleTypes: Lookup[];
  entryChangeReasons: Lookup[];
  entryStatuses: Lookup[];
  form: UntypedFormGroup;
  today = new Date();

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  ngOnInit(): void {
    this.createForm();
  }
  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      entryType: new UntypedFormControl(''),
      entryDate: new UntypedFormControl(''),
      entryChangeReason: new UntypedFormControl(''),
      scheduleType: new UntypedFormControl(''),
      amount: new UntypedFormControl(''),
      payeAmount: new UntypedFormControl(''),
      normalMonthlyPension: new UntypedFormControl({value: '', disabled: true}),
      currentMonthlyPension: new UntypedFormControl({value: '', disabled: true}),
      paymentDate: new UntypedFormControl(''),
    });
  }


  onLoadLookups(): void {
    this.getEntryTypes();
    this.getEntryChangeReasons();
    this.getScheduleTypes();
    this.getEntryStatuses();
  }



  getEntryTypes(){
    if (this.entryTypes) return;
    this.loading = true;
    this.lookupService.getEntryTypes().subscribe(
      data => {
        this.entryTypes = data;
      }
    );
  }

  getEntryChangeReasons() {
    if (this.entryChangeReasons) return;
    this.loading = true;
    this.lookupService.getEntryChangeReasons().subscribe(
      data => {
        this.entryChangeReasons = data;
      }
    );
  }

  getScheduleTypes() {
    if (this.scheduleTypes) return;
    this.loading = true;
    this.lookupService.getScheduleTypes().subscribe(
      data => {
        this.scheduleTypes = data;
      }
    );
  }

  getEntryStatuses() {
    if (this.entryStatuses) return;
    this.loading = true;
    this.lookupService.getEntryTypes().subscribe(
      data => {
        this.entryStatuses = data;
      }
    );
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model) {
      this['model'] = new CorrectiveEntryNotification();
    }
    if (!this.model.correctiveEntry) {
      this.model['correctiveEntry'] = new CorrectiveEntry();
    }

    this.model.correctiveEntry.entryType = value.entryType;
    this.model.correctiveEntry.entryDate = value.entryDate;
    this.model.correctiveEntry.entryChangeReason = value.entryChangeReason;
    this.model.correctiveEntry.scheduleType = value.scheduleType;
    this.model.correctiveEntry.amount = value.amount;
    this.model.correctiveEntry.payeAmount = value.payeAmount;
    this.model.correctiveEntry.updatedBy = value.updatedBy;
    this.model.correctiveEntry.normalMonthlyPension =  !value.normalMonthlyPension ? 0 : Number(value.normalMonthlyPension);
    this.model.correctiveEntry.currentMonthlyPension =  !value.currentMonthlyPension ? 0 : Number(value.currentMonthlyPension);
    this.model.correctiveEntry.paymentDate = value.paymentDate;
  }
  populateForm(): void {
    if (this.model && this.model.correctiveEntry) {
      this.form.patchValue({
        entryType: this.model.correctiveEntry.entryType,
        entryDate: this.model.correctiveEntry.entryDate,
        entryChangeReason: this.model.correctiveEntry.entryChangeReason,
        scheduleType: this.model.correctiveEntry.scheduleType,
        amount: this.model.correctiveEntry.amount,
        payeAmount: this.model.correctiveEntry.payeAmount,
        updatedBy: this.model.correctiveEntry.updatedBy,
        normalMonthlyPension: this.model.correctiveEntry.normalMonthlyPension ?? this.model.ledger?.normalMonthlyPension,
        currentMonthlyPension: this.model.correctiveEntry.currentMonthlyPension ?? this.model.ledger?.currentMonthlyPension,
        paymentDate: this.model.correctiveEntry.paymentDate,
      });
    }
    else {
      this.form.patchValue({
        normalMonthlyPension: this.model.ledger?.normalMonthlyPension,
        currentMonthlyPension: this.model.ledger?.currentMonthlyPension,
      });
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
