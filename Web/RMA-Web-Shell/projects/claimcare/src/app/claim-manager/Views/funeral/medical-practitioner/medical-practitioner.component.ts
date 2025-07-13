import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { PractitionerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/practitioner-type-enum';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'medical-practitioner',
  templateUrl: './medical-practitioner.component.html',
  styleUrls: ['./medical-practitioner.component.css']
})
export class MedicalPractitionerComponent extends WizardDetailBaseComponent<PersonEventModel> {
  firstName: string;
  displayName: string;
  step: string;
  isValid: boolean;
  selectedMedicalPractitionerType: number;
  medical: RolePlayer;
  isLoading: boolean;
  practitionerTypeId: number;
  practitionerType: string;
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

  createForm(id: any): void {
    // This.clearDisplayName();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      rolePlayerId: 0,
      firstName: '',
      lastName: '',
      medicalPractitionerType: '',
      contactNumber: '',
      registrationNumber: '',
      isValid: ''
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.medical.rolePlayerId = formModel.rolePlayerId;
    this.medical.person.firstName = formModel.firstName;
    this.medical.person.surname = formModel.lastName;
    this.medical.healthCareProvider.providerTypeId = formModel.medicalPractitionerType;
    this.medical.cellNumber = formModel.contactNumber;
    this.medical.healthCareProvider.practiceNumber = formModel.registrationNumber;
  }

  populateForm(): void {
    this.readClaimStatus();

    this.medical = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.MedicalServiceProvider]]]);

    this.practitionerTypeId = PractitionerTypeEnum[PractitionerTypeEnum[this.medical.healthCareProvider.providerTypeId]];
    if (this.practitionerTypeId === 0) {
      this.practitionerType = '';
    }

    this.form.patchValue({
      rolePlayerId: this.medical.rolePlayerId,
      firstName: this.medical.person.firstName,
      lastName: this.medical.person.surname,
      medicalPractitionerType: PractitionerTypeEnum[PractitionerTypeEnum[this.practitionerTypeId]],
      contactNumber: this.medical.cellNumber,
      registrationNumber: this.medical.healthCareProvider.practiceNumber
    });

    this.form.controls.firstName.disable();
    this.form.controls.lastName.disable();
    this.form.controls.medicalPractitionerType.disable();
    this.form.controls.contactNumber.disable();
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
          this.practitionerType = PractitionerTypeEnum[PractitionerTypeEnum[PractitionerTypeEnum[rolePlayerDetails?.healthCareProvider?.providerTypeId]]].toString();
          console.log(rolePlayerDetails);
          this.form.patchValue({
            rolePlayerId: rolePlayerDetails.rolePlayerId,
            firstName: rolePlayerDetails.person.firstName,
            lastName: rolePlayerDetails.person.surname,
            medicalPractitionerType: PractitionerTypeEnum[PractitionerTypeEnum[PractitionerTypeEnum[rolePlayerDetails.healthCareProvider.providerTypeId]]],
            contactNumber: rolePlayerDetails.cellNumber,
            registrationNumber: regNumber
          });
          this.isLoading = false;
        });
    }
  }

  isActiveChange($event: any) {
    this.isValid = $event.checked;
  }

  SearchRole() {
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
