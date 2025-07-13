import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Earning } from '../../../../shared/entities/earning-model';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { BehaviorSubject } from 'rxjs';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { KeyValue } from '@angular/common';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';

@Component({
  templateUrl: './capture-earnings-section-51.component.html'
})
export class CaptureEarningsSection51 extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isOverrideRequired$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  overrideReasons: string[];

  earnings: Earning[];
  allRequiredDocumentsUploaded = false;

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  rolePlayerContactOptions: KeyValue<string, number>[];

  earningType = EarningsTypeEnum.FutureProbable;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.rolePlayerContactOptions = [
      { key: 'Employee', value: this.model.insuredLifeId }
    ];

    this.getEvent();
    this.isOverrideRequired();
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.earnings || this.earnings.length <= 0) {
      validationResult.errors++;
      validationResult.errorMessages.push('earnings must be captured');
    }

    if (this.earnings && this.earnings.length > 0) {
      const isEarningsCaptured = this.earnings.some(s => !s.earningId || s.earningId <= 0) || (this.earnings.length == 1 && this.earnings[0].isVerified);
      if (!isEarningsCaptured) {
        validationResult.errors++;
        validationResult.errorMessages.push('earnings must be captured');
      }
    }

    if (!this.allRequiredDocumentsUploaded) {
      validationResult.errors++;
      validationResult.errorMessages.push('earnings documents are required');
    }

    return validationResult;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.isLoading$.next(false);
    });
  }

  setEarnings($event: Earning[]) {
    this.earnings = $event;
    this.model.earnings = this.earnings;
    this.saveWizardData();
    this.isOverrideRequired();
  }

  private saveWizardData() {
    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.updateLockedUser = true;
    saveWizardRequest.lockedToUser = this.authService.getUserEmail();
    saveWizardRequest.currentStep = this.context.wizard.currentStepIndex;
    this.wizardService.saveWizard(saveWizardRequest).subscribe();
  }

  isOverrideRequired() {
    this.overrideReasons = [];
    let result = false;

    // if is edited then override needed
    if (this.model.earnings?.length == 1) {
      var index = this.model.earnings.findIndex(s => s.earningId > 0 && s.isVerified);
      if (index > -1) {
        var isEdit = true;
        result = true;
        this.overrideReasons.push('editing previously verified earnings');
      }
    }

    // if is current earnings is less then accident or future earnings then override needed
    var currentEarnings = this.model.earnings?.find(s => s.earningsType == EarningsTypeEnum.Current);
    if (currentEarnings != null) {
      var accidentEarnings = this.model.earnings?.find(s => (s.earningsType == EarningsTypeEnum.Accident && !s.isEstimated) || s.earningsType == EarningsTypeEnum.FutureProbable);
      if (accidentEarnings != null) {
        if (currentEarnings.total < accidentEarnings.total) {
          if (!result) {
            result = true;
          }
          this.overrideReasons.push('current earnings is less then accident earnings');
        }
      }
    }

    // if is variable earnings is more then non variable then override
    if (isEdit) {
      var earning = this.model.earnings[0];
      if (earning != null) {
        if (earning.variableSubTotal > earning.nonVariableSubTotal) {
          if (!result) {
            result = true;
          }
          this.overrideReasons.push('variable earnings is more then non variable earnings');
        }
      }
    } else {
      var newEarnings = this.model.earnings?.find(s => s.earningId <= 0 || !s.earningId);
      if (newEarnings != null) {
        if (newEarnings.variableSubTotal > newEarnings.nonVariableSubTotal) {
          if (!result) {
            result = true;
          }
          this.overrideReasons.push('variable earnings is more then non variable earnings');
        }
      }
    }


    this.isOverrideRequired$.next(result);
  }
}