import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'forensic-pathologist',
  templateUrl: './forensic-pathologist.component.html',
  styleUrls: ['./forensic-pathologist.component.css'],
   providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})

export class ForensicPathologistComponent extends WizardDetailBaseComponent<PersonEventModel> {

  firstName: string;
  displayName: string;
  step: string;
  isValid: boolean;
  forensic: RolePlayer;
  isLoading: boolean;
  minDate: Date;
  year = (new Date().getFullYear() - 1).toString();
  day = new Date().getDay().toString();
  showSetting: boolean = false;
  canEditForm: boolean = false;
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly claimCareService: ClaimCareService,
    private readonly formBuilder: UntypedFormBuilder,
    private roleplayerService: RolePlayerService) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any) {
    this.minDate = new Date(`${this.year}-01-${this.day}`);
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      rolePlayerId: 0,
      firstName: '',
      lastName: '',
      contactNumber: '',
      isValid: '',
      dateOfPostMortem: '',
      mortuaryName: '',
      postMortemNumber: '',
      bodyNumber: '',
      sapCaseNumber: '',
      registrationNumber: ''
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    const formModel = this.form.getRawValue();

    this.forensic.rolePlayerId = formModel.rolePlayerId;
    this.forensic.person.firstName = formModel.firstName;
    this.forensic.person.surname = formModel.lastName;
    this.forensic.tellNumber = formModel.contactNumber;
    this.forensic.forensicPathologist.isValid = formModel.isValid;
    this.model.personEventDeathDetail.dateOfPostmortem = formModel.dateOfPostMortem;
    this.forensic.forensicPathologist.mortuaryName = formModel.mortuaryName;
    this.model.personEventDeathDetail.postMortemNumber = formModel.postMortemNumber;
    this.model.personEventDeathDetail.bodyNumber = formModel.bodyNumber;
    this.model.personEventDeathDetail.sapCaseNumber = formModel.sapCaseNumber;
    this.forensic.forensicPathologist.registrationNumber = formModel.registrationNumber;
  }

  populateForm(): void {
    this.readClaimStatus();
    this.forensic = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.ForensicPathologist]]]);

    this.form.patchValue({
      firstName: this.forensic.person.firstName,
      lastName: this.forensic.person.surname,
      contactNumber: this.forensic.tellNumber,
      registrationNumber: this.forensic.forensicPathologist.registrationNumber,
      isValid: this.forensic.forensicPathologist.isValid,
      dateOfPostMortem: this.model.personEventDeathDetail.dateOfPostmortem,
      mortuaryName: this.forensic.forensicPathologist.mortuaryName,
      postMortemNumber: this.model.personEventDeathDetail.postMortemNumber,
      bodyNumber: this.model.personEventDeathDetail.bodyNumber,
      sapCaseNumber: this.model.personEventDeathDetail.sapCaseNumber,
    });

    this.form.controls.firstName.disable();
    this.form.controls.lastName.disable();
    this.form.controls.contactNumber.disable();
    this.form.controls.isValid.disable();
    this.form.controls.mortuaryName.disable();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {

    }
    return validationResult;
  }

  searchMsp() {
    const regNumber = this.form.controls.registrationNumber.value;

    if (regNumber) {
      this.isLoading = true;
      this.roleplayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.MedicalServiceProvider, regNumber).subscribe(
        rolePlayerDetails => {
          console.log(rolePlayerDetails);
          this.form.patchValue({
            rolePlayerId: rolePlayerDetails.rolePlayerId,
            firstName: rolePlayerDetails.person.firstName,
            lastName: rolePlayerDetails.person.surname,
            contactNumber: rolePlayerDetails.tellNumber,
            registrationNumber: regNumber,
            mortuaryName: rolePlayerDetails.healthCareProvider.name,
          });
          this.isLoading = false;
        });
    }
  }

  readClaimStatus(){
    if(this.isDisabled){
      this.showSetting = this.isDisabled;
      this.claimCareService.getEvent(this.model.eventId).subscribe(result => {
        //get claim status
        result.personEvents.forEach(personEvent => {
          personEvent.claims.forEach(claim => {
            if(claim.claimStatus == ClaimStatusEnum.PendingRequirements ||
              claim.claimStatus == ClaimStatusEnum.AwaitingDecision || 
              claim.claimStatus == ClaimStatusEnum.PendingPolicyAdmin || 
              claim.claimStatus == ClaimStatusEnum.PendingInvestigations || 
              claim.claimStatus == ClaimStatusEnum.InvestigationCompleted || 
              claim.claimStatus == ClaimStatusEnum.Reopened || 
              claim.claimStatus == ClaimStatusEnum.ReturnToAssessor || 
              claim.claimStatus == ClaimStatusEnum.Waived || 
              claim.claimStatus == ClaimStatusEnum.PolicyAdminCompleted || 
              claim.claimStatus == ClaimStatusEnum.Reversed ||
              claim.claimStatus == ClaimStatusEnum.Repay || 
              claim.claimStatus == ClaimStatusEnum.PendingAcknowledgement
              ){
              this.canEditForm = true;
              }
          });
        });
      });
    }
  }
  
  
 edit() {
    if(this.canEditForm){
    this.form.enable();
    this.showSetting = false;
    }
  }
  
  save() {
    this.isSaving$.next(true);
    this.readForm();
    this.resetForm();
  }
  
  resetForm() {
    this.showSetting = true;
    this.form.disable();
  }
  
  cancel() {
    this.populateForm();  
    this.resetForm();
  }

  readForm() {
    this.populateModel();
    this.isSaving$.next(false);
  }

  reset() {
    this.form.reset();
  }

}

