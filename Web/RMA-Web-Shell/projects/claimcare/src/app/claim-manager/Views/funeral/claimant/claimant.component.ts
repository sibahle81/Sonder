import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
@Component({
  selector: 'claimant-component',
  templateUrl: './claimant.component.html',
  styleUrls: ['./claimant.component.css']
})
export class ClaimantComponent extends WizardDetailBaseComponent<PersonEventModel> {

  firstName: string;
  displayName: string;
  relationType: number;
  selectedRelation: number;
  DOB: Date;
  isDOBDisabled: boolean;
  minDate: Date;
  claimant: RolePlayer;
  relation: any;
  isLoading = false;
  rolePlayerTypes: RolePlayerType[] = [];
  year = (new Date().getFullYear() - 1).toString();
  day = new Date().getDay().toString();
  showSetting: boolean = false;
  canEditForm: boolean = false;

  rolePlayerTypeIds = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly claimCareService: ClaimCareService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any) {
    // This.clearDisplayName();
    if (this.form) { return; }
    this.minDate = new Date(`${this.year}-01-${this.day}`);

    this.form = this.formBuilder.group({
      idNumber: '',
      passportNumber: '',
      firstName: '',
      lastName: '',
      contactNumber: '',
      beneficiaryType: '',
      dateOfBirth: ''
    });
  }

  onLoadLookups(): void {
    this.getRolePlayerTypes();
  }

  populateModel(): void {    
    const form = this.form.value;
    this.claimant.person.idNumber = form.idNumber;
    this.claimant.person.passportNumber = form.passportNumber;
    this.claimant.person.firstName = form.firstName;
    this.claimant.person.surname = form.lastName;
    this.claimant.cellNumber = form.contactNumber;
    this.claimant.person.dateOfBirth = form.dateOfBirth;
  }

  populateForm(): void {
    if (this.model) {
      this.readClaimStatus();
      this.claimant = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.Claimant]]]);
      // Leave this == as is as the type is different
      this.relation = this.claimant.toRolePlayers.find(a => a.toRolePlayerId == this.claimant.rolePlayerId && a.fromRolePlayerId == this.model.insuredLifeId);
      if (this.relation) {
        this.relationType = this.relation.rolePlayerTypeId;
      } else { this.relationType = RolePlayerTypeEnum[RolePlayerTypeEnum[RolePlayerTypeEnum.Other]]; }
      this.form.patchValue({
        idNumber: this.claimant.person.idType === IdTypeEnum.SA_ID_Document ? this.claimant.person.idNumber : null,
        passportNumber: this.claimant.person.idType === IdTypeEnum.Passport_Document ? this.claimant.person.passportNumber : null,
        firstName: this.claimant.person.firstName,
        lastName: this.claimant.person.surname,
        contactNumber: this.claimant.cellNumber,
        beneficiaryType: this.relationType,
        dateOfBirth: this.claimant.person.dateOfBirth,
        selectedRelation: 1
      });
      this.setDOB();
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  getRolePlayerTypes() {
    this.isLoading = true;
    this.rolePlayerService.getRolePlayerTypes(this.rolePlayerTypeIds).subscribe(
      data => {
        this.rolePlayerTypes = data;
      }
    );
    this.isLoading = false;
  }

  relationChanged($event: any) {
    this.selectedRelation = $event.value as number;
  }

  setDOB() {
    const formModel = this.form.value;
    const idNumber = formModel.idNumber as string;
    if (idNumber !== null && idNumber.length >= 6) {
      const birthDate = idNumber.substring(0, 6);
      const d = birthDate; // YYMMDD
      const yy = d.substr(0, 2);
      const mm = d.substr(2, 2);
      const dd = d.substr(4, 2);
      const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;
      this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
      this.form.patchValue({
        dateOfBirth: this.DOB
      });
      this.form.get('dateOfBirth').disable();
      this.isDOBDisabled = true;
    } else {
      this.form.patchValue({
        idNumber: null,
        dateOfBirth: this.claimant.person.dateOfBirth
      });
      this.form.get('dateOfBirth').disable();
      this.isDOBDisabled = true;
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
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
      this.form.get('idNumber').enable();
      this.form.get('passportNumber').enable();
      this.form.get('contactNumber').enable();
      this.form.get('beneficiaryType').enable();

      if(!this.isDOBDisabled){
        this.form.get('dateOfBirth').enable();
      }
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
    this.form.get('dateOfBirth').disable();
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
