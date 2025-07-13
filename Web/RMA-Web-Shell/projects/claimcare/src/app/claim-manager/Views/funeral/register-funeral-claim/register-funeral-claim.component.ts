import { Component, OnInit, ViewChild } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { formatDate } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PolicyList } from '../../../shared/entities/funeral/policy-list';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { DeathDetail } from '../../../shared/entities/funeral/death-details';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { RolePlayerSearchResult } from '../../../shared/entities/funeral/roleplayer-search-result';
import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { PersonEventDeathDetailModel } from '../../../shared/entities/personEvent/personEventDeathDetail.model';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { EventStatusEnum } from '../../../shared/enums/event-status-enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';

@Component({
  selector: 'app-register-funeral-claim',
  templateUrl: './register-funeral-claim.component.html',
  styleUrls: ['./register-funeral-claim.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})

export class RegisterFuneralClaimComponent extends DetailsComponent implements OnInit {
  @ViewChild('registerClaimant', { static: false }) registerClaimant: { addRolePlayerDetails: () => RolePlayer; };
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly brokerageService: BrokerageService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly confirmservice: ConfirmationDialogsService) {
    super(appEventsManager, alertService, router, 'Funeral claim', 'claimcare/claim-manager/search', 1);
  }

  deathDetails: DeathDetail[];
  deactivateRegister = false;
  deceasedForm: UntypedFormGroup;
  claimantForm: UntypedFormGroup;
  insuredLive = 0;
  insuredLives: InsuredLife;
  insuredLifeId = 0;
  typeOfDeath = 0;
  communicationType = 0;
  claimantId = 0;
  claimants = 0;
  isLoading = false;
  readOnly: boolean;
  isSaving: boolean;
  minDate: Date;
  maxDate: Date;
  currentAction: string;
  policies: PolicyList[];
  selectedIndex = 0;
  brokerage: Brokerage;
  isEmailBrokerChecked = false;
  isConfirmed = false;
  notifiedDate: Date;
  selectedClaimantRelation: RolePlayerType;
  deathDate: Date;
  validateDate: number;
  errorMessageIDNumber = '';
  idType = '';
  errorMessage = 'The death date cannot be after the date notified';
  errMessage = 'Claimant cannot be the deceased';
  isValidClaimant = 0;
  isInValidIDNumber = 0;
  validFields: number;
  isLoadingBrokerage = 0;
  hideBrokerage = true;
  numericNumberReg = '^-?[0-9]\\d*(\\.\\d{1,2})?$';
  stringReg = '[a-zA-Z ]*';
  rolePlayerTypes: RolePlayerType[];
  rolePlayerType: RolePlayerType;
  rolePlayerTypeId: number;
  claimantRolePlayer: RolePlayer;
  addClaimant = 0;
  policyId = 0;
  claimreferencenumber: string;
  continueRolePlayerSearchResult: RolePlayerSearchResult;
  DOB: Date;
  isNextClicked: boolean;
  isConfirmedTab: boolean;

  ngOnInit() {
    this.createForm('');
    this.maxDate = new Date();
  }

  createForm(id: any) {
    this.getRolePlayerTypes();
    this.currentAction = '';
    this.minDate = new Date();
    this.validFields = 10;

    this.deceasedForm = this.formBuilder.group({
      id: id as number,
      typeOfDeath: new UntypedFormControl('', [Validators.required]),
      dateOfDeath: new UntypedFormControl('', [Validators.required]),
      dateNotified: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      lastName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
    });

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


  getRolePlayerTypes() {
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(data => {
      this.rolePlayerTypes = data;
    });
  }

  onSelectClaimantRelation(value: RolePlayerType) {
    if (value) {
      this.rolePlayerType = value;
    }
  }

  claimantChangeHandler(rolePlayerSearchResult: RolePlayerSearchResult): void {
    this.rolePlayerTypeId = rolePlayerSearchResult.rolePlayerTypeId;
    this.selectedClaimantRelation = this.rolePlayerTypes.filter(x => x.rolePlayerTypeId === this.rolePlayerTypeId)[0];
    this.rolePlayerType = this.selectedClaimantRelation;
    this.claimantId = rolePlayerSearchResult.rolePlayerId;
    this.policyId = rolePlayerSearchResult.policyId;

    if (this.claimantId !== this.insuredLifeId) {
      this.claimants = 1;
      this.isValidClaimant = 0;
      this.claimantForm.patchValue({
        claimantFirstName: rolePlayerSearchResult.firstName,
        claimantLastName: rolePlayerSearchResult.surname,
        claimantIdentityNumber: rolePlayerSearchResult.idNumber,
        claimantMobileNumber: rolePlayerSearchResult.cellNumber,
        claimantEmail: rolePlayerSearchResult.emailAddress,
        claimantDOB: formatDate(rolePlayerSearchResult.dateOfBirth, 'yyyy/MM/dd', 'en-US'),
        claimantRelation: rolePlayerSearchResult.relation,
        communicationType: rolePlayerSearchResult.communicationTypeId,

      });
      this.setDOB();
      this.claimantRolePlayer = new RolePlayer();
      this.rolePlayerService.getRolePlayer(rolePlayerSearchResult.rolePlayerId).subscribe(player => {
        this.claimantRolePlayer = player;
      });
    } else {
      this.claimants = 0;
      this.isValidClaimant = 1;
    }
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

  addClaimantInfo() {
    const rolePlayer = this.registerClaimant.addRolePlayerDetails();
    if (rolePlayer) {
      this.deactivateRegister = true;
      this.currentAction = 'Adding claimant details...';

      this.rolePlayerService.CheckIfRolePlayerExists(rolePlayer.person.idNumber).subscribe(rolePlayerId => {
        if (rolePlayerId !== 0) {
          this.claimantId = rolePlayerId;
          rolePlayer.rolePlayerId = rolePlayerId;
          this.rolePlayerService.updateRolePlayer(rolePlayer).subscribe(() => {
            this.alertService.success('Claimant Details Updated successfully');
            this.addDeceasedInfoForClaimant();
          }, error => {
            this.alertService.error(error);
            this.isLoading = false;
          });
        } else {
          this.rolePlayerService.addRolePlayer(rolePlayer).subscribe(id => {
            this.claimantId = id;
            this.createRolePlayerRelation(id, rolePlayer.rolePlayerTypeId);
            this.alertService.success('Claimant saved successfully');
            this.addDeceasedInfoForClaimant();
          });
        }
      });
    }
  }

  createRolePlayerRelation(notifierId: number, rolePlayerTypeId: number) {

    const rolePlayerRelation = new RolePlayerRelation();
    rolePlayerRelation.fromRolePlayerId = this.insuredLifeId;
    rolePlayerRelation.toRolePlayerId = notifierId;
    rolePlayerRelation.rolePlayerTypeId = rolePlayerTypeId;
    rolePlayerRelation.policyId = null;

    this.rolePlayerService.doesRelationExist(rolePlayerRelation).subscribe(result => {
      if (!result) {
        this.rolePlayerService.addRolePlayerRelation(rolePlayerRelation).subscribe(a => {
        });
      }
    });
  }

  getDateNotified(value: Date) {
    this.notifiedDate = new Date(value);
    if (this.deathDate && this.deathDate > this.notifiedDate) {
      this.validateDate = 1;
    } else {
      this.validateDate = 0;
      this.validFields = 0;
    }
  }

  getDateOfDeath(value: Date) {
    this.deathDate = new Date(value);
    if (this.notifiedDate && this.deathDate > this.notifiedDate) {
      this.validateDate = 1;
    } else {
      this.validateDate = 0;
      this.validFields = 0;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  nextStep() {
    this.selectedIndex += 1;
    this.isNextClicked = true;
  }

  previousStep() { this.selectedIndex -= 1; }

  typeOfDeathChanged($event: any) { this.typeOfDeath = $event.value as number; }

  communicationTypeChanged($event: any) {
    this.communicationType = $event.value as number;
    this.setCommunicationValidators($event);
  }

  numberOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  openDuplicateDialog(claimreferencenumber: string): void {
    this.confirmservice.confirmWithoutContainer('Duplicate Event', ' Possible duplicate event captured for  : ' + claimreferencenumber + ', would you like to continue?',
      'Center', 'Center', 'Yes', 'No').subscribe(result => {
        if (result === true) {
          this.continueWithDuplicate(this.continueRolePlayerSearchResult);
        }
      });
  }


  deceasedChangeHandler(rolePlayerSearchResult: RolePlayerSearchResult): void {
    this.continueRolePlayerSearchResult = rolePlayerSearchResult;
    this.insuredLifeId = 0;
    this.insuredLifeId = rolePlayerSearchResult.rolePlayerId;
    this.claimService.getDuplicatePersonEventCheckByInsuredLifeId(this.insuredLifeId).subscribe(duplicateResults => {

      if (duplicateResults == null) {
        this.claimService.getRolePlayerPolicies(rolePlayerSearchResult.rolePlayerId).subscribe(results => {
          this.brokerage = new Brokerage();
          this.policies = new Array();

          results.forEach(element => {
            this.getBrokerage(element.brokerageId);
            if (element.brokerageId > 0) {
              this.claimreferencenumber = rolePlayerSearchResult.claimReferenceNumber;
            }

            const item = new PolicyList();
            item.policy = 'Policy - ' + results.indexOf(element) + 1;
            item.policynumber = element.policyNumber;
            this.policies.push(item);
          });

          this.getInsuredLifeDetails(rolePlayerSearchResult.rolePlayerId);

        });
      } else {
        this.claimreferencenumber = duplicateResults.personEventReferenceNumber;
        this.openDuplicateDialog(this.claimreferencenumber);
      }
    });
  }

  getBrokerage(brokerId: number) {
    if (brokerId > 0) {
      this.brokerageService.getBrokerage(brokerId).subscribe(brokerage => {
        this.brokerage = brokerage;
        this.isLoadingBrokerage = 1;
        this.hideBrokerage = false;
      });
    } else {
      this.hideBrokerage = true;
    }
  }

  emailBroker($event: any) {
    this.isEmailBrokerChecked = $event.checked;
  }

  continueWithDuplicate(rolePlayerSearchResult: RolePlayerSearchResult) {
    this.insuredLifeId = rolePlayerSearchResult.rolePlayerId;
    this.claimService.getRolePlayerPolicies(rolePlayerSearchResult.rolePlayerId).subscribe(results => {

      this.brokerage = new Brokerage();
      this.policies = new Array();
      results.forEach(element => {
        this.getBrokerage(element.brokerageId);
        const item = new PolicyList();
        item.policy = 'Policy - ' + results.indexOf(element) + 1;
        item.policynumber = element.policyNumber;
        this.policies.push(item);
      });

    this.getInsuredLifeDetails(rolePlayerSearchResult.rolePlayerId);
    });

  }
  getInsuredLifeDetails(rolePlayerId: number){
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(rolePlayer =>{
      const insured = new InsuredLife();
      insured.name = rolePlayer.person.firstName;
      insured.surname = rolePlayer.person.surname;
      insured.dateOfBirth = rolePlayer.person.dateOfBirth == null ? '' : formatDate(rolePlayer.person.dateOfBirth, 'yyyy/MM/dd', 'en-US');
      insured.idNumber = rolePlayer.person.idNumber;
      this.insuredLives = new InsuredLife();
      this.insuredLives = insured;
      this.insuredLive = 1;
      
      this.isInValidIDNumber = 0;
      switch(rolePlayer.person.idType) { 
        case IdTypeEnum.SA_ID_Document: { 
           this.idType = 'ID Number';
           break; 
        } 
        case IdTypeEnum.Passport_Document: { 
          this.idType = 'Passport Number';
           break; 
        } 
        case IdTypeEnum.Registration_Number: { 
          this.idType = 'Registration Number';
          break; 
       } 
       case IdTypeEnum.Group_Number: { 
        this.idType = 'Group Number';
        break; 
     } 
        default: { 
          this.idType = 'Other';
           break; 
        } 
     } 

     const validIdRegX= /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g;

    if (validIdRegX.test(insured.idNumber)) {      
          this.isInValidIDNumber = 1;
          this.errorMessageIDNumber = `Invalid character's fond in ${this.idType} ${insured.idNumber}, please request for a valid ${this.idType} to be updated.`;
    }else{

      if(rolePlayer.person.idType === IdTypeEnum.SA_ID_Document){
         if(Number.isFinite(Number(insured.idNumber)))
          {
            if(insured.idNumber.length != 13){
              this.isInValidIDNumber = 1;
              this.errorMessageIDNumber = `${this.idType} ${insured.idNumber} is invalid, please request for the ${this.idType} to be updated.`;
            }
          }else
          {
            this.isInValidIDNumber = 1;
            this.errorMessageIDNumber = `${this.idType} ${insured.idNumber} must be numeric, please request for the ${this.idType} to be updated.`;
          }

      }else if (rolePlayer.person.idType === IdTypeEnum.Passport_Document) {
        this.isInValidIDNumber = 0;
      }else if (rolePlayer.person.idType === IdTypeEnum.Other && insured.idNumber.length == 13){
        this.isInValidIDNumber = 1;
        this.errorMessageIDNumber = `${this.idType} ${insured.idNumber} is an invalid ID Number/Passport type, please request for the ID Number/Passport type to be updated.`;
      }  
    }
      
      this.deceasedForm.patchValue({
        firstName: rolePlayer.person.firstName,
        lastName: rolePlayer.person.surname
      });

      this.deceasedForm.controls.firstName.disable();
      this.deceasedForm.controls.lastName.disable();
      });
  };

  addDeceasedInfo() {
    this.setCommunicationValidators(this.claimantForm.get('communicationType').value);
    this.validateAllFormFields(this.claimantForm);
    if (!this.claimantForm.valid) { return; }

    this.claimantForm.disable();
    this.currentAction = 'Adding deceased info...';
    const event = this.readForm();

    const rolePlayerRelation = new RolePlayerRelation();
    rolePlayerRelation.fromRolePlayerId = this.insuredLifeId;
    rolePlayerRelation.toRolePlayerId = this.claimantId;
    rolePlayerRelation.rolePlayerTypeId = this.selectedClaimantRelation.rolePlayerTypeId;

    this.rolePlayerService.doesRelationExist(rolePlayerRelation).subscribe(result => {
      if (!result) {
        this.rolePlayerService.addRolePlayerRelation(rolePlayerRelation).subscribe(a => {
        });
      }
    });

    if (this.addClaimant === 0) {
      this.updateClaimantDetails(this.claimantRolePlayer);
    }
    this.currentAction = 'Registering Event...';
    this.isLoading = true;
    this.claimService.addEventDetails(event).subscribe(id => {
      this.getEventAndCreateWizard(id);
    });
  }

  addDeceasedInfoForClaimant() {
    this.claimantForm.disable();
    this.currentAction = 'Adding deceased info...';
    const event = this.readForm();

    if (this.addClaimant === 0) {
      this.updateClaimantDetails(this.claimantRolePlayer);
    }

    this.claimService.addEventDetails(event).subscribe(id => {
      this.getEventAndCreateWizard(id);
    });
  }

  getEventAndCreateWizard(id: number) {
    this.currentAction = 'Adding claimant details...';
    this.claimService.getEvent(id).subscribe(event => {
      this.startWizard(event);
    });
  }

  startWizard(event: EventModel) {
    this.currentAction = 'Initiating claim registration...';
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'register-funeral-claim';
    startWizardRequest.linkedItemId = event.eventId;
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      event.wizardId = wizard.id;
      this.updateClaimWizard(event);
    });
  }

  updateClaimWizard(event: EventModel) {
    this.currentAction = 'Updating claim wizard...';
    this.claimService.updateEventWizard(event).subscribe(() => {
      this.isSaving = false;
      const message = event.personEvents[0].personEventId.toString();
      this.confirmSavedDetails(message);
      this.alertService.success(`'New claim registered '${message}`);
      this.isLoading = false;
      this.selectedIndex += 1;
      this.isConfirmedTab = true;
    });
  }

  updateClaimantDetails(rolePlayer: RolePlayer) {
    this.currentAction = 'Updating claimant details...';
    this.rolePlayerService.updateRolePlayer(rolePlayer).subscribe(() => { });
  }

  confirmSavedDetails(message: string) {
    this.deathDetails = new Array();
    const deathDeath = new DeathDetail();
    deathDeath.nameSurname = this.insuredLives.name + ' ' + this.insuredLives.surname;
    deathDeath.policyNumber = this.policies[0].policynumber;
    deathDeath.role = 'Life Insured';
    deathDeath.claimNumber = message;
    deathDeath.dateCreated = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    deathDeath.idNumber = this.insuredLives.idNumber;
    this.deathDetails.push(deathDeath);

    if (this.deathDetails.length > 0) {
      this.isConfirmed = true;
    }
  }

  getObjectType(object: any): any {
    if (typeof object === null) { return; }
    return typeof object;
  }

  formatCamelCase(property: string): string { return property.replace(/([a-z0-9])([A-Z])/g, '$1 $2'); }

  asIsOrder(a: any, b: any) { return 1; }

  addNewClaimant() { this.addClaimant = 1; }

  readForm(): EventModel {
    const deceasedFormModel = this.deceasedForm.getRawValue();
    const claimantFormModel = this.claimantForm.getRawValue();

    if (this.addClaimant === 0) {
      this.claimantRolePlayer.emailAddress = claimantFormModel.claimantEmail;
      this.claimantRolePlayer.cellNumber = claimantFormModel.claimantMobileNumber;
      this.claimantRolePlayer.preferredCommunicationTypeId = claimantFormModel.communicationType;
    }

    const deathDate = new Date(deceasedFormModel.dateOfDeath + 'Z');
    const notifyDate = new Date(deceasedFormModel.dateNotified + 'Z');
    const event = new EventModel();
    event.description = 'Funeral/Death claim';
    event.eventType = EventTypeEnum.Accident;
    event.eventStatus = EventStatusEnum.Notified;
    event.adviseMethod = 4;
    event.dateAdvised = notifyDate;
    event.eventDate = deathDate;

    const personEvent = new PersonEventModel();
    personEvent.documentSetEnum = DocumentSetEnum.FuneralNaturalIndividual;
    personEvent.insuredLifeId = this.insuredLifeId;
    personEvent.claimantId = this.claimantId;
    personEvent.personEventStatus = PersonEventStatusEnum.Unknown;
    personEvent.personEventBucketClassId = 1;
    personEvent.dateReceived = new Date();
    personEvent.dateCaptured = new Date();
    personEvent.capturedByUserId = this.authService.getCurrentUser().id;
    personEvent.personEventAccidentDetail = null;
    personEvent.personEventDiseaseDetail = null;
    personEvent.personEventNoiseDetail = null;
    personEvent.sendBrokerEmail = this.isEmailBrokerChecked;
    const personEventDeathDetail = new PersonEventDeathDetailModel();
    personEventDeathDetail.deathTypeId = this.typeOfDeath;
    personEventDeathDetail.deathDate = deathDate;
    personEvent.personEventDeathDetail = personEventDeathDetail;
    personEvent.companyRolePlayerId = null;

    if (!event.personEvents) {
      event.personEvents = new Array();
    }

    event.personEvents.push(personEvent);
    return event;
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
  setForm() { }

  cancel() { this.router.navigateByUrl('claimcare/claim-manager/search'); }

  addMember() { this.router.navigateByUrl('clientcare/policy-manager/new-business'); }

  addStillBorn() { this.router.navigateByUrl('claimcare/claim-manager/add-stillBorn'); }

  confirm() { this.router.navigateByUrl('claimcare/claim-manager/search'); }

  redirectToWizard() { }

  save() { }
}
