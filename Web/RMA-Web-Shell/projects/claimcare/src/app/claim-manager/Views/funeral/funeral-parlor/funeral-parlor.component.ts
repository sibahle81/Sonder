import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RolePlayerDialogRegistrationNumberComponent } from '../role-player-dialog-registration-number/role-player-dialog-registration-number.component';

@Component({
  selector: 'funeral-parlor',
  templateUrl: './funeral-parlor.component.html',
  styleUrls: ['./funeral-parlor.component.css']
})
export class FuneralParlorComponent extends WizardDetailBaseComponent<PersonEventModel> {
  firstName: string;
  displayName: string;
  step: string;
  funeral: RolePlayer;
  isLoading: boolean;
  roleplayerId: number;
  showSetting: boolean = false;
  canEditForm: boolean = false;
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly claimCareService: ClaimCareService,
    private roleplayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder,
    private dialogBox: MatDialog) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any) {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      id: 0,
      funeralParlorName: '',
      registrationNumber: '',
      addressLine1: '',
      addressLine2: '',
      contactNumber: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      passportNumber: '',
      dateOfBirth: ''
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.funeral.funeralParlor.rolePlayerId = formModel.id;
    this.funeral.displayName = formModel.funeralParlorName;
    this.funeral.funeralParlor.registrationNumber = formModel.registrationNumber;
    this.funeral.funeralParlor.addressLine1 = formModel.addressLine1;
    this.funeral.funeralParlor.addressLine2 = formModel.addressLine2;
    this.funeral.tellNumber = formModel.contactNumber;
    this.funeral.person.firstName = formModel.firstName;
    this.funeral.person.surname = formModel.lastName;
    this.funeral.person.idNumber = formModel.idNumber;
    this.funeral.person.passportNumber = formModel.passportNumber;
    this.funeral.person.dateOfBirth = formModel.dateOfBirth;
  }

  populateForm(): void {

    this.readClaimStatus();
    this.funeral = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.FuneralParlor]]]);

    this.form.patchValue({
      id: this.funeral.rolePlayerId,
      funeralParlorName: this.funeral.displayName,
      registrationNumber: this.funeral.funeralParlor.registrationNumber,
      addressLine1: this.funeral.funeralParlor.addressLine1,
      addressLine2: this.funeral.funeralParlor.addressLine2,
      contactNumber: this.funeral.tellNumber,
      firstName: this.funeral.person.firstName,
      lastName: this.funeral.person.surname,
      idNumber: this.funeral.person.idNumber,
      passportNumber: this.funeral.person.passportNumber,
      dateOfBirth: this.funeral.person.dateOfBirth
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }
  search() {
    const regNumber = this.form.controls.registrationNumber.value;

    if (regNumber) {
      this.isLoading = true;
      this.roleplayerService.SearchRolePlayersByRegistrationNumber(KeyRoleEnum.FuneralParlor, regNumber).subscribe(
        rolePlayersDetails => {
       
          if (rolePlayersDetails.length == 1){
            const details  = rolePlayersDetails[0];
            this.loadSelectedRolePlayerDetails(details, regNumber);            
          } else if(rolePlayersDetails.length > 1) {
            const dialogConfig = new MatDialogConfig();      
            dialogConfig.data = {
              disableClose: true,
              dataSource: rolePlayersDetails,
              title: 'Funeral Parlor',
              registrationNumber: regNumber
            };
            const dialog = this.dialogBox.open(RolePlayerDialogRegistrationNumberComponent, dialogConfig);
            dialog.afterClosed().subscribe((details: RolePlayer) => {
              if (details) {
                this.loadSelectedRolePlayerDetails(details, regNumber);
              }
            });
          }
         
          this.isLoading = false;
        });
    }
  }
  loadSelectedRolePlayerDetails(rolePlayerDetails: RolePlayer, regNumber: string){
               this.form.patchValue({
                id: rolePlayerDetails.person.rolePlayerId,
                firstName: rolePlayerDetails.person.firstName,
                lastName: rolePlayerDetails.person.surname,
                idNumber: rolePlayerDetails.person.idNumber,
                funeralParlorName: rolePlayerDetails.displayName,
                contactNumber: rolePlayerDetails.tellNumber,
                passportNumber: rolePlayerDetails.person.passportNumber,
                registrationNumber: regNumber
              });
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
