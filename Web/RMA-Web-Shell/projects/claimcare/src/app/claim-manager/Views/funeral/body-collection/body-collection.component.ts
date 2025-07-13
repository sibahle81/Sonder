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
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerDialogRegistrationNumberComponent } from '../role-player-dialog-registration-number/role-player-dialog-registration-number.component';

@Component({
  selector: 'body-collection',
  templateUrl: './body-collection.component.html',
  styleUrls: ['./body-collection.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class BodyCollectionComponent extends WizardDetailBaseComponent<PersonEventModel> {

  step: string;
  firstName: string;
  displayName: string;
  DOB: Date;
  maxDate: Date;
  body: RolePlayer;
  isLoading: boolean;
  isDoBDisabled: boolean;
  year = (new Date().getFullYear() - 1).toString();
  day = new Date().getDay().toString();
  showSetting: boolean = false;
  canEditForm: boolean = false;
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
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
      contactNumber: '',
      idNumber: '',
      passportNumber: '',
      collectionOfBodyDate: '',
      dateOfBirth: '',
      firstName: '',
      lastName: '',
      registrationNumber: '',
    });
  }

  populateModel(): void {

    const formModel = this.form.getRawValue();
    this.body.bodyCollector.rolePlayerId = formModel.id;
    this.body.cellNumber = formModel.contactNumber;
    this.body.person.idNumber = formModel.idNumber;
    this.body.person.passportNumber = formModel.passportNumber;
    this.model.personEventDeathDetail.bodyCollectionDate = formModel.collectionOfBodyDate;
    this.body.person.dateOfBirth = formModel.dateOfBirth == '' || formModel.dateOfBirth == null ?  this.maxDate : formModel.dateOfBirth;
    this.body.person.firstName = formModel.firstName;
    this.body.person.surname = formModel.lastName;
    this.body.bodyCollector.registrationNumber = formModel.registrationNumber;
  }

  populateForm(): void {
    this.readClaimStatus();

    this.body = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.BodyCollector]]]);

    this.form.patchValue({
      id: this.body.rolePlayerId,
      registrationNumber: this.body.bodyCollector.registrationNumber,
      contactNumber: this.body.cellNumber,
      idNumber: this.body.person.idNumber,
      passportNumber: this.body.person.passportNumber,
      collectionOfBodyDate: this.model.personEventDeathDetail.bodyCollectionDate,
      dateOfBirth: this.body.person.dateOfBirth,
      firstName: this.body.person.firstName,
      lastName: this.body.person.surname,
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
        this.isDoBDisabled = true;
      }
    } else {
      this.form.patchValue({
        dateOfBirth: this.maxDate
      });
      this.form.get('dateOfBirth').enable();
      this.isDoBDisabled = false;
    }
  }

  search() {
    const regNumber = this.form.controls.registrationNumber.value;

    if (regNumber) {
      this.isLoading = true;
      this.roleplayerService.SearchRolePlayersByRegistrationNumber(KeyRoleEnum.BodyCollector, regNumber).subscribe(
        rolePlayersDetails => {
     
          if (rolePlayersDetails.length == 1){
            const details  = rolePlayersDetails[0];
            this.loadSelectedRolePlayerDetails(details, regNumber);            
          } else if(rolePlayersDetails.length > 1) {
            const dialogConfig = new MatDialogConfig();      
            dialogConfig.data = {
              disableClose: true,
              dataSource: rolePlayersDetails,
              title: 'Body Collector',
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
            id: rolePlayerDetails.rolePlayerId,
            firstName: rolePlayerDetails.person.firstName,
            lastName: rolePlayerDetails.person.surname,
            idNumber: rolePlayerDetails.person.idNumber,
            funeralParlorName: rolePlayerDetails.displayName,
            contactNumber: rolePlayerDetails.cellNumber,
            passportNumber: rolePlayerDetails.person.passportNumber,
            registrationNumber: regNumber
          });
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
        this.form.get('registrationNumber').enable();
        this.form.get('contactNumber').enable();
        this.form.get('idNumber').enable();
        this.form.get('passportNumber').enable();
        this.form.get('collectionOfBodyDate').enable();
        this.form.get('firstName').enable();
        this.form.get('lastName').enable();
        if(!this.isDoBDisabled){
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
