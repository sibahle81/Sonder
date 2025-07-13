import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerDialogRegistrationNumberComponent } from '../role-player-dialog-registration-number/role-player-dialog-registration-number.component';

@Component({
  selector: 'undertaker',
  templateUrl: './undertaker.component.html',
  styleUrls: ['./undertaker.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class UndertakerComponent extends WizardDetailBaseComponent<PersonEventModel> {
  firstName: string;
  displayName: string;
  step: string;
  DOB: Date;
  role: RolePlayer;
  isLoading: boolean;
  maxDate: Date;
  isDOBDisabled: boolean;
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
    private roleplayerService: RolePlayerService,
    private dialogBox: MatDialog) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any): void {
    if (this.form) { return; }
    var d = new Date();
    var year = d.getFullYear();
    this.maxDate = new Date(year - 18, d.getMonth(), d.getDate());

    this.form = this.formBuilder.group({
      id: 0,
      idNumber: '',
      passportNumber: '',
      dateOfBirth: '',
      firstName: '',
      lastName: '',
      contactNumber: '',
      placeOfBurial: '',
      dateOfBurial: '',
      registrationNumber: '',
    });
  }

  populateModel(): void {
    const form = this.form.value;
    this.role.funeralParlor.rolePlayerId = form.id;
    this.role.person.idNumber = form.idNumber;
    this.role.person.passportNumber = form.passportNumber;
    this.role.person.dateOfBirth = form.dateOfBirth == '' || form.dateOfBirth == null ?  this.maxDate : form.dateOfBirth;
    this.role.person.firstName = form.firstName;
    this.role.person.surname = form.lastName;
    this.role.tellNumber = form.contactNumber;
    this.role.undertaker.dateOfBurial = form.dateOfBurial;
    this.role.undertaker.placeOfBurial = form.placeOfBurial;
    this.role.undertaker.registrationNumber = form.registrationNumber;
  }

  populateForm(): void {
    
    this.readClaimStatus();
    this.role = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.Undertaker]]]);

    this.form.patchValue({
      id: this.role.rolePlayerId,
      idNumber: this.role.person.idNumber,
      passportNumber: this.role.person.passportNumber,
      dateOfBirth: this.role.person.dateOfBirth,
      firstName: this.role.person.firstName,
      lastName: this.role.person.surname,
      contactNumber: this.role.tellNumber,
      dateOfBurial: this.role.undertaker.dateOfBurial,
      placeOfBurial: this.role.undertaker.placeOfBurial,
      registrationNumber: this.role.undertaker.registrationNumber
    });
    this.setDOB();
  }

  onLoadLookups(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {

    }
    return validationResult;
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
        this.isDOBDisabled = true;      
      }
    } else {
      this.form.patchValue({
        dateOfBirth: this.maxDate
      });
      this.form.get('dateOfBirth').enable();
      this.isDOBDisabled = false;
    }
  }

  search() {
    const regNumber = this.form.controls.registrationNumber.value;

    if (regNumber) {
      this.isLoading = true;
      this.roleplayerService.SearchRolePlayersByRegistrationNumber(KeyRoleEnum.Undertaker, regNumber).subscribe(
        rolePlayersDetails => {
       
          if (rolePlayersDetails.length == 1){
            const details  = rolePlayersDetails[0];
            this.loadSelectedRolePlayerDetails(details, regNumber);            
          } else if(rolePlayersDetails.length > 1) {
            
            const dialogConfig = new MatDialogConfig();      
            dialogConfig.data = {
              disableClose: true,
              dataSource: rolePlayersDetails,
              title: 'Undertaker',
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
            rolePlayerId: rolePlayerDetails.rolePlayerId,
            firstName: rolePlayerDetails.person.firstName,
            lastName: rolePlayerDetails.person.surname,
            idNumber: rolePlayerDetails.person.idNumber,
            funeralParlorName: rolePlayerDetails.displayName,
            contactNumber: rolePlayerDetails.tellNumber,
            passportNumber: rolePlayerDetails.person.passportNumber,
            registrationNumber: regNumber           
          });
          this.setDOB(); //
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
      this.form.get('dateOfBurial').enable();
      this.form.get('placeOfBurial').enable();
      this.form.get('registrationNumber').enable();
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
