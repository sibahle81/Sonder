import { Component, OnInit, Input } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';

@Component({
  selector: 'add-claimant-details',
  templateUrl: './add-claimant-details.component.html',
  styleUrls: ['./add-claimant-details.component.css']
})
export class AddClaimantDetailsComponent extends DetailsComponent implements OnInit {

  constructor(
    appEventsManager: AppEventsManager,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly rolePlayerService: RolePlayerService) {
    super(appEventsManager, alertService, router, 'Funeral claim', 'claimcare/claim-manager/search', 1);
  }

  @Input() strMeesage: string;

  claimantForm: UntypedFormGroup;
  rolePlayerType: RolePlayerType;
  rolePlayerTypes: RolePlayerType[];

  readOnly: boolean;
  isEmailBrokerChecked = false;

  DOB: Date;
  deathDate: Date;
  notifiedDate: Date;
  currentAction: string;
  maxDate: Date;

  typeOfDeath = 0;
  communicationType = 0;
  validateDate: number;
  rolePlayerId: number;

  stringReg = '[a-zA-Z ]*';
  numericNumberReg = '^-?[0-9]\\d*(\\.\\d{1,2})?$';

  ngOnInit() {
    this.createForm('');
    this.maxDate = new Date();
  }

  createForm(id: any) {
    this.getRolePlayerTypes();

    this.claimantForm = this.formBuilder.group({
      id: id as number,
      claimantEmail: new UntypedFormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      claimantMobileNumber: new UntypedFormControl('', [ValidatePhoneNumber]),
      claimantFirstName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      claimantLastName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      claimantIdentityNumber: new UntypedFormControl('', [Validators.required]),
      claimantDOB: new UntypedFormControl('', [Validators.required]),
      claimantRelation: new UntypedFormControl('', [Validators.required]),
      communicationType: new UntypedFormControl('', [Validators.required]),
      emailBroker: new UntypedFormControl(''),
    });
  }


  getRolePlayerTypes() {
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(
      data => {
        this.rolePlayerTypes = data;
      }
    );
  }

  onSelectClaimantRelation(value: RolePlayerType) {
    if (value !== undefined) {
      this.rolePlayerType = value;
    }
  }

  emailBroker($event: any) {
    this.isEmailBrokerChecked = $event;
  }

  getDateNotified(value: Date) {
    this.notifiedDate = new Date(value);
    if (this.deathDate !== undefined || this.deathDate != null) {
      if (this.deathDate > this.notifiedDate) {
        this.validateDate = 1;
      } else {
        this.validateDate = 0;
      }
    }
  }

  getDateOfDeath(value: Date) {
    this.deathDate = new Date(value);
    if (this.notifiedDate !== undefined || this.notifiedDate != null) {
      if (this.deathDate > this.notifiedDate) {
        this.validateDate = 1;
      } else {
        this.validateDate = 0;
      }
    }
  }

  typeOfDeathChanged($event: any) {
    this.typeOfDeath = $event.value as number;
  }

  communicationTypeChanged($event: any) {
    this.communicationType = $event.value as number;
    this.setCommunicationValidators($event);
  }

  
  setCommunicationValidators(event: any) {
    this.claimantForm.get('claimantMobileNumber').setValidators([ValidatePhoneNumber]);
    this.claimantForm.get('claimantEmail').setValidators([ValidateEmail]);
    switch (event.value) {
      case 1: // Email
        this.claimantForm.get('claimantEmail').setValidators([Validators.required, ValidateEmail]);
        break;
      case 2: // Phone
        this.claimantForm.get('claimantMobileNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
      case 3: // SMS
        this.claimantForm.get('claimantMobileNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
        case 5: // Whats app
        this.claimantForm.get('claimantMobileNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
    }
    this.claimantForm.get('claimantMobileNumber').updateValueAndValidity();
    this.claimantForm.get('claimantEmail').updateValueAndValidity();
  }

  setForm() {
  }

  cancel() {
    this.router.navigateByUrl('claimcare/claim-manager/search');
  }

  save() {
  }

  addClaimantInfo(): number {
    this.claimantForm.disable();
    this.currentAction = this.strMeesage;
    this.rolePlayerService.addRolePlayer(this.addRolePlayerDetails()).subscribe(id => {
      this.rolePlayerId = id;
      this.alertService.success('Claimant saved successfully');
    });
    return this.rolePlayerId;
  }

  addRolePlayerDetails(): RolePlayer {
    const claimantFormModel = this.claimantForm.getRawValue();

    let rolePlayer = new RolePlayer();
    if (rolePlayer.person == undefined){
      rolePlayer.person = new Person();
    }     

    if (this.claimantForm.valid) {
      rolePlayer.displayName = claimantFormModel.claimantFirstName + ' ' + claimantFormModel.claimantLastName;
      rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
      rolePlayer.tellNumber = claimantFormModel.claimantMobileNumber;
      rolePlayer.cellNumber = claimantFormModel.claimantMobileNumber;
      rolePlayer.emailAddress = claimantFormModel.claimantEmail;
      rolePlayer.preferredCommunicationTypeId = claimantFormModel.communicationType;
      rolePlayer.person.firstName = claimantFormModel.claimantFirstName;
      rolePlayer.person.surname = claimantFormModel.claimantLastName;
      rolePlayer.person.idType = claimantFormModel.claimantIdentityNumber.length === 13
        ? IdTypeEnum.SA_ID_Document 
        : IdTypeEnum.Passport_Document;
      rolePlayer.person.idNumber = claimantFormModel.claimantIdentityNumber;
      rolePlayer.person.dateOfBirth = claimantFormModel.claimantDOB;
      rolePlayer.person.isAlive = true;
      rolePlayer.person.isVopdVerified = false;
      rolePlayer.person.isStudying = false;
      rolePlayer.person.isDisabled = false;
      rolePlayer.rolePlayerTypeId = claimantFormModel.claimantRelation.rolePlayerTypeId;
    } else {
      this.validateAllFormFields(this.claimantForm);
      rolePlayer = null;
    }
    return rolePlayer;
  }
 
  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);

        
      }
    });
  }

  setDOB() {
    const formModel = this.claimantForm.value;
    const idNumber = formModel.claimantIdentityNumber as string;
    if (idNumber !== null && idNumber.length >= 12) {
      const birthDate = idNumber.substring(0, 6);
      const d = birthDate;
      const yy = d.substr(0, 2);
      const mm = d.substr(2, 2);
      const dd = d.substr(4, 2);
      const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;
      this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
      this.claimantForm.get('claimantDOB').setValue(this.DOB);
      this.claimantForm.get('claimantDOB').disable();
    } else {
      this.claimantForm.get('claimantDOB').enable();
      this.validateDateField();
    }
  }

  validateDateField() {
    const control = this.claimantForm.get('claimantDOB');
    if (control instanceof UntypedFormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof UntypedFormGroup) {
      this.validateDateField();
    }
  }

  validateEmailField(){
    if (this.claimantForm.get('claimantEmail').hasError('required') || this.form.get('claimantEmail').hasError('email')) {
      return false;
    } else {
      this.claimantForm.get('claimantEmail').setErrors(null);
      this.claimantForm.get('claimantEmail').updateValueAndValidity();
    }
  }
 
  readForm() {
  }
}
