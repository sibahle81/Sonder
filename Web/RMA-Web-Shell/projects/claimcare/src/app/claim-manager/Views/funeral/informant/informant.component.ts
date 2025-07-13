import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';

@Component({
  selector: 'informant-component',
  templateUrl: './informant.component.html',
  styleUrls: ['./informant.component.css']
})
export class InformantComponent extends WizardDetailBaseComponent<PersonEventModel> {
  firstName: string;
  displayName: string;
  selectedRelation: number;
  DOB: Date;
  isDOBDisabled:boolean;
  passportDOB: Date;
  informant: RolePlayer;
  minDate: Date;
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
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder) {

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
    this.informant.person.idNumber = form.idNumber;
    this.informant.person.passportNumber = form.passportNumber;
    this.informant.person.firstName = form.firstName;
    this.informant.person.surname = form.lastName;
    this.informant.tellNumber = form.contactNumber;
    this.informant.informant.beneficiaryTypeId = form.beneficiaryType;
    this.informant.person.dateOfBirth = form.dateOfBirth == '' || form.dateOfBirth == null ? new Date(2099 ,0, 1) : form.dateOfBirth;
  }

  populateForm(): void {
    if (this.model) {
      this.readClaimStatus();
      this.informant = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.Informant]]]);

      this.form.patchValue({
        idNumber: this.informant.person.idNumber,
        passportNumber: this.informant.person.passportNumber,
        firstName: this.informant.person.firstName,
        lastName: this.informant.person.surname,
        contactNumber: this.informant.tellNumber,
        beneficiaryType: this.informant.informant.beneficiaryTypeId,
        dateOfBirth: this.informant.person.dateOfBirth,
        selectedRelation: 1
      });

      this.passportDOB = new Date(this.informant.person.dateOfBirth.toString()).toString() === new Date('0001-01-01T00:00:00').toString()
        ? new Date(2099, 0, 1) : this.informant.person.dateOfBirth;
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
    const idNumber = this.form.get('idNumber').value;
    if (idNumber) {
      if (idNumber.length >= 6) {
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
        this.passportDOB = undefined;
        this.isDOBDisabled = true;
      }
    } else {
      const pass = this.passportDOB == undefined ? '' : this.passportDOB;
      this.form.patchValue({
        idNumber: null,
        dateOfBirth: pass
      });
      this.form.get('dateOfBirth').enable();
      this.isDOBDisabled = false;
    }
  }

  search() {
    const idNumber = this.form.controls.idNumber.value;
    const passportNumber = this.form.controls.passportNumber.value;

    if (idNumber || passportNumber) {
      this.isLoading = true;

      this.rolePlayerService.GetPersonDetailsByIdNumber(idNumber !== null ? IdTypeEnum.SA_ID_Document : IdTypeEnum.Passport_Document, idNumber !== null ? idNumber : passportNumber).subscribe(
        rolePlayerDetails => {
          console.log(rolePlayerDetails);
          this.form.patchValue({
            rolePlayerId: rolePlayerDetails.rolePlayerId === 0 ? this.informant.rolePlayerId = 0 : this.informant.rolePlayerId = rolePlayerDetails.rolePlayerId,
            firstName: rolePlayerDetails.person.firstName === null ? this.informant.person.firstName : rolePlayerDetails.person.firstName,
            lastName: rolePlayerDetails.person.surname === null ? this.informant.person.surname : rolePlayerDetails.person.surname,
            idNumber: idNumber,
            funeralParlorName: rolePlayerDetails.displayName === null ? this.informant.displayName : rolePlayerDetails.displayName,
            passportNumber: passportNumber,
            contactNumber: rolePlayerDetails.tellNumber === null ? this.informant.tellNumber : rolePlayerDetails.tellNumber,
            // beneficiaryType: rolePlayerDetails.informant.beneficiaryTypeId === null ? this.informant.informant.beneficiaryTypeId : rolePlayerDetails.informant.beneficiaryTypeId,
          });
          this.isLoading = false;
        });
    }
    this.setDOB();
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
      this.form.get('idNumber').enable();
      this.form.get('passportNumber').enable();
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
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