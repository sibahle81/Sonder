import { RolePlayerRelation } from './../../../../../../../clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
import { Component, OnInit } from '@angular/core';
import { RolePlayerSearchResult } from '../../../shared/entities/funeral/roleplayer-search-result';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { PolicyList } from '../../../shared/entities/funeral/policy-list';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { formatDate } from '@angular/common';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { DeathDetail } from '../../../shared/entities/funeral/death-details';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { MemberApproval } from '../../../shared/entities/funeral/member-approval';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { DeathTypeEnum } from '../../../shared/enums/deathType.enum';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PolicyInsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy-insured-life.service';
import { PolicyInsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-insured-life';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { EventStatusEnum } from '../../../shared/enums/event-status-enum';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { PersonEventDeathDetailModel } from '../../../shared/entities/personEvent/personEventDeathDetail.model';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { StillbornBenefit } from '../../../shared/entities/funeral/claim-payment.model';

@Component({
  selector: 'app-add-member-stillborn',
  templateUrl: './add-member-stillborn.component.html',
  styleUrls: ['./add-member-stillborn.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class AddMemberStillbornComponent extends DetailsComponent implements OnInit {

  stillBornForm: UntypedFormGroup;

  policyId = 0;
  claimantId = 0;
  typeOfDeath = 0;
  insuredLifeId = 0;
  relationTypeId = 0;
  communicationType = 0;
  claimants: number;
  insuredLive: number;
  selectedIndex: number;
  isValidClaimant: number;
  mainMemberId: number;
  stillbornBenefitId: number;
  readOnly: boolean;
  isSaving: boolean;
  canCapture = false;
  validateDate: boolean;
  overrideDuplicate = false;
  overrideMissingBenefit = false;
  canContinue: boolean;

  minDate: Date;
  deathDate: Date;
  notifiedDate: Date;

  actionType: string;
  currentAction: string;
  isDisabled = false;

  stringReg = '[a-zA-Z ]*';
  errorMessage = 'The death date cannot be after the date notified';
  brokerage: Brokerage;
  policies: PolicyList[];
  insuredLives: InsuredLife;
  rolePlayerType: RolePlayerType;
  deathDetail: DeathDetail;
  deathDetails: DeathDetail[];
  claimantRolePlayer: RolePlayer;
  policyIds: number[] = [];


  constructor(
    appEventsManager: AppEventsManager,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService,
    private readonly policyInsuredLifeService: PolicyInsuredLifeService,
    private readonly claimService: ClaimCareService,
    private readonly rolePlayerService: RolePlayerService,
    public dialog: MatDialog,
    private readonly confirmservice: ConfirmationDialogsService) {
    super(appEventsManager, alertService, router, 'Funeral claim', 'claimcare/claim-manager', 1);
  }

  ngOnInit() {
    this.createForm('');

    if (this.router.url.includes('stillBorn')) {
      this.actionType = 'StillBorn';
      this.stillBornForm.controls.typeOfDeath.setValue(3);
      this.stillBornForm.controls.typeOfDeath.disable();
      this.typeOfDeath = DeathTypeEnum.Stillborn;
    }
  }

  createForm(id: any) {
    this.insuredLive = 0;
    this.claimants = 0;
    this.selectedIndex = 0;
    this.isValidClaimant = 0;
    this.currentAction = '';
    this.minDate = new Date();
    this.deathDetails = new Array();
    this.deathDetail = new DeathDetail();

    this.stillBornForm = this.formBuilder.group({
      id: id as number,
      claimantFirstName: new UntypedFormControl('', [Validators.required]),
      claimantLastName: new UntypedFormControl('', [Validators.required]),
      claimantIdNumber: new UntypedFormControl('', [Validators.required]),
      claimantDateOfBirth: new UntypedFormControl('', [Validators.required]),
      claimantCellnumber: new UntypedFormControl('', [Validators.required]),
      claimantEmailAddress: new UntypedFormControl(''),
      communicationType: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      lastName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      dateOfDeath: new UntypedFormControl('', [Validators.required]),
      typeOfDeath: new UntypedFormControl('', [Validators.required]),
      dateNotified: new UntypedFormControl('', [Validators.required])
    });
  }

  getDateNotified(value: Date) {
    this.notifiedDate = new Date(value);
    if (this.deathDate !== undefined || this.deathDate != null) {
      if (this.deathDate > this.notifiedDate) {
        this.validateDate = true;
      } else {
        this.validateDate = false;
      }
    }
  }

  setDateOfDeath(value: Date) {
    this.deathDate = new Date(value);
    this.validateDate = this.deathDate <= this.notifiedDate;
    if (this.actionType === 'StillBorn') {
      this.duplicateCheck();
    }
  }

  typeOfDeathChanged($event: any) {
    this.typeOfDeath = $event.value as number;
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  enableDateOfDeath() {
    if (this.stillBornForm.controls.firstName.value.length > 0 && this.stillBornForm.controls.lastName.value.length > 0) {
      this.stillBornForm.controls.dateOfDeath.enable();
    } else { this.stillBornForm.controls.dateOfDeath.disable(); }
  }

  claimantChangeHandler(rolePlayerSearchResult: RolePlayerSearchResult): void {
    this.stillBornForm.controls.dateOfDeath.disable();
    this.claimantId = rolePlayerSearchResult.rolePlayerId;
    this.claimService.getRolePlayerPolicies(rolePlayerSearchResult.rolePlayerId).subscribe(results => {
      this.brokerage = new Brokerage();
      this.policies = new Array();
      this.policyId = results[0].policyId;
      results.forEach(element => {
        const id = element.brokerageId;
        const item = new PolicyList();
        item.policy = 'Policy - ' + results.indexOf(element) + 1;
        item.policynumber = element.policyNumber;

        this.policies.push(item);
        this.policyIds.push(element.policyId);
      });
      this.stillBornForm.patchValue({
        claimantFirstName: rolePlayerSearchResult.firstName,
        claimantLastName: rolePlayerSearchResult.surname,
        claimantIdNumber: rolePlayerSearchResult.idNumber,
        claimantDateOfBirth: rolePlayerSearchResult.dateOfBirth,
        claimantCellnumber: rolePlayerSearchResult.cellNumber,
        claimantEmailAddress: rolePlayerSearchResult.emailAddress,
        communicationType: rolePlayerSearchResult.communicationTypeId,
      });

      if (rolePlayerSearchResult.communicationTypeId === CommunicationTypeEnum.Email) {
        const validators = [Validators.email, Validators.required];
        this.applyValidationToFormControl(validators, 'claimantEmailAddress');
      }

      const insured = new InsuredLife();
      insured.name = rolePlayerSearchResult.firstName;
      insured.surname = rolePlayerSearchResult.surname;
      insured.dateOfBirth = rolePlayerSearchResult.dateOfBirth == null ? '' : formatDate(rolePlayerSearchResult.dateOfBirth, 'yyyy/MM/dd', 'en-US');
      insured.idNumber = rolePlayerSearchResult.idNumber;
      this.insuredLives = new InsuredLife();
      this.insuredLives = insured;
      this.insuredLive = 1;
    });

    this.claimantRolePlayer = new RolePlayer();
    this.rolePlayerService.getRolePlayer(rolePlayerSearchResult.rolePlayerId).subscribe(player => {
      this.claimantRolePlayer = player;
    });
    this.claimService.stillBornCheck(rolePlayerSearchResult.rolePlayerId).subscribe(result => {
      this.canCapture = result;
    });
  }

  formatCamelCase(property): string {
    return property.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }

  addDeceasedInfo() {
    if (this.actionType === 'StillBorn') {
      if (this.canCapture === false) {
        this.alertService.loading('Cannot capture more than two stillborns for policy', 'Stillborn exceeded', true);
      } else {
        this.isDisabled = true;
        this.currentAction = 'Adding deceased info...';
        this.insuredLifeId = 0;

        this.readForm();

        //JPK before adding a new roleplayer (stillborn), person insured life record and roleplayerRelation record, first check if
        //there is a stillborn benefit configured for this policy's product option.
        this.canContinue = false;
        this.claimService.getStillbornBenefit(new StillbornBenefit(-1, 0, this.policyIds)).subscribe(sbBenefit => {
          this.stillbornBenefitId = sbBenefit.id;
          if (sbBenefit.id === -1) {
            this.confirmservice.messageBoxWithoutContainer('Stillborn Benefit', 'There is currently no stillborn benefit configured for this policy.',
              'Center', 'Center', 'Ok').subscribe(result => {
                if (result === true) {
                  this.router.navigateByUrl('claimcare/claim-manager');
                }
              });
          }
          else {
            this.updateClaimantDetails(this.claimantRolePlayer);
            this.rolePlayerService.addRolePlayer(this.addRolePlayerDetails()).subscribe(id => {
              this.insuredLifeId = id;
              this.rolePlayerService.GetMainMemberByPolicyId(sbBenefit.policyId).subscribe(main => {
                this.mainMemberId = main.toRolePlayerId;
                this.addRelationshipDetails();
              });
            });
          }
        });
      }
    }
  }

  updateClaimantDetails(rolePlayer: RolePlayer) {
    this.currentAction = 'Updating claimant details...';
    this.rolePlayerService.updateRolePlayer(rolePlayer).subscribe(result => {
    });
  }

  addRelationshipDetails() {
    const rolePlayerRelation = new RolePlayerRelation();
    rolePlayerRelation.fromRolePlayerId = this.insuredLifeId;
    rolePlayerRelation.toRolePlayerId = this.mainMemberId;
    rolePlayerRelation.policyId = this.policyId;
    rolePlayerRelation.rolePlayerTypeId = this.relationTypeId;
    this.rolePlayerService.addRolePlayerRelation(rolePlayerRelation).subscribe(ids => {
    });

    const policyInsuredLife = new PolicyInsuredLife();
    policyInsuredLife.policyId = this.policyId;
    policyInsuredLife.rolePlayerId = this.insuredLifeId;
    policyInsuredLife.rolePlayerTypeId = this.relationTypeId;
    policyInsuredLife.startDate = this.deathDate;
    policyInsuredLife.insuredLifeStatus = 1;
    policyInsuredLife.statedBenefitId = this.stillbornBenefitId;
    this.policyInsuredLifeService.addPolicyInsuredLife(policyInsuredLife).subscribe(result => {
      if (result) {
        this.alertService.success('Stillborn added');
      }
    });

    let event = new EventModel();
    event = this.readForm();
    event.personEvents[0].insuredLifeId = this.insuredLifeId;
    this.claimService.addEventDetails(event).subscribe(eventId => {
      this.getEventAndCreateWizard(eventId);
    });
  }

  submitDetailsForApproval(rolePlayerId: number) {
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(rolePlayer => {
    });
  }

  startRolePlayerWizard() {
    this.currentAction = 'Submitting details for approval...';
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'role-player';
    startWizardRequest.linkedItemId = 0;
    const memberApproval = new MemberApproval();
    memberApproval.rolePlayer = this.addRolePlayerDetails();

    const rolePlayerPolicy = new RolePlayerPolicy();
    rolePlayerPolicy.policyId = this.policyId;
    memberApproval.rolePlayer.policy = rolePlayerPolicy;

    const rolePlayerRelation = new RolePlayerRelation();
    rolePlayerRelation.fromRolePlayerId = this.insuredLifeId;
    rolePlayerRelation.toRolePlayerId = this.mainMemberId;
    rolePlayerRelation.policyId = this.policyId;
    rolePlayerRelation.rolePlayerTypeId = this.relationTypeId;

    memberApproval.rolePlayer.toRolePlayers[0] = rolePlayerRelation;

    memberApproval.event = this.readForm();
    startWizardRequest.data = JSON.stringify(memberApproval);

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      if (wizard.id > 0) {
        this.confirmSavedDetails('Waiting Approval');
        this.alertService.success('Member details awaiting approval');
      }
    });
  }

  getEventAndCreateWizard(id: number) {
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
    });
  }

  confirmSavedDetails(message: string) {
    const stillBornFormModel = this.stillBornForm.getRawValue();
    this.deathDetail.nameSurname = this.insuredLives.name + ' ' + this.insuredLives.surname;
    this.deathDetail.policyNumber = this.policies[0].policynumber;
    this.deathDetail.role = 'Life Insured';
    this.deathDetail.claimNumber = message;
    this.deathDetail.dateCreated = formatDate((new Date()), 'dd/MM/yyyy', 'en-US');
    this.deathDetail.idNumber = this.insuredLives.idNumber;

    if (this.actionType === 'StillBorn') {
      this.deathDetail.nameSurname = stillBornFormModel.firstName + ' ' + stillBornFormModel.lastName;
      this.deathDetail.idNumber = '0000000000000';
    }
    this.deathDetails.push(this.deathDetail);
    this.selectedIndex += 1;
  }

  confirm() {
    this.router.navigateByUrl('claimcare/claim-manager/search');
  }

  addRolePlayerDetails(): RolePlayer {
    const stillBornFormModel = this.stillBornForm.getRawValue();
    const rolePlayer = new RolePlayer();

    if (this.actionType === 'StillBorn') {
      rolePlayer.displayName = stillBornFormModel.firstName + ' ' + stillBornFormModel.lastName;
      rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
      rolePlayer.person = new Person();
      rolePlayer.person.firstName = stillBornFormModel.firstName;
      rolePlayer.person.surname = stillBornFormModel.lastName;
      rolePlayer.person.idType = 1;
      rolePlayer.person.idNumber = '0000000000000';
      rolePlayer.person.dateOfBirth = new Date();
      rolePlayer.person.isAlive = false;
      rolePlayer.person.dateOfDeath = new Date(stillBornFormModel.dateOfDeath + 'Z');
      rolePlayer.person.isVopdVerified = false;
      rolePlayer.person.isStudying = false;
      rolePlayer.person.isDisabled = false;
      this.relationTypeId = 32;
    }
    return rolePlayer;
  }

  readForm(): EventModel {
    const event = new EventModel();
    const stillBornFormModel = this.stillBornForm.getRawValue();

    this.claimantRolePlayer.emailAddress = stillBornFormModel.claimantEmailAddress;
    this.claimantRolePlayer.cellNumber = stillBornFormModel.claimantCellnumber;
    this.claimantRolePlayer.preferredCommunicationTypeId = stillBornFormModel.communicationType;

    event.description = 'Funeral/Death claim';
    event.eventType = EventTypeEnum.Accident;
    event.eventStatus = EventStatusEnum.Notified;
    event.adviseMethodId = 4;
    event.adviseMethod = event.adviseMethodId;

    if (this.actionType === 'StillBorn') {
      event.dateAdvised = new Date();
      event.eventDate = new Date(stillBornFormModel.dateOfDeath + 'Z');
    }

    const personEvent = new PersonEventModel();
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
    const personEventDeathDetail = new PersonEventDeathDetailModel();
    personEventDeathDetail.deathTypeId = this.typeOfDeath;
    if (this.actionType === 'StillBorn') {
      event.dateAdvised = new Date();
      event.eventDate = new Date(stillBornFormModel.dateOfDeath + 'Z');
      personEventDeathDetail.deathDate = new Date(stillBornFormModel.dateOfDeath + 'Z');
    }
    personEvent.personEventDeathDetail = personEventDeathDetail;
    if (event.personEvents == null) {
      event.personEvents = new Array();
    }
    event.personEvents.push(personEvent);
    return event;
  }

  communicationTypeChanged($event: any) {
    this.communicationType = $event.value as number;
    if (this.communicationType === CommunicationTypeEnum.Email) {
      const validators = [Validators.email, Validators.required];
      this.applyValidationToFormControl(validators, 'claimantEmailAddress');
    } else {
      this.clearValidationToFormControl('claimantEmailAddress');
    }
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.stillBornForm.get(controlName).setValidators(validationToApply);
    this.stillBornForm.get(controlName).markAsTouched();
    this.stillBornForm.get(controlName).updateValueAndValidity();
  }

  clearValidationToFormControl(controlName: string) {
    this.stillBornForm.get(controlName).clearValidators();
    this.stillBornForm.get(controlName).markAsTouched();
    this.stillBornForm.get(controlName).updateValueAndValidity();
  }

  duplicateCheck() {
    this.currentAction = 'Checking for duplicates';

    const stillBornFormModel = this.stillBornForm.getRawValue();

    const person = new Person();
    person.firstName = stillBornFormModel.firstName;
    person.surname = stillBornFormModel.lastName;
    person.dateOfDeath = new Date(stillBornFormModel.dateOfDeath + 'Z');

    if (person.firstName.length === 0 && person.surname.length === 0) {
      this.currentAction = '';
      this.stillBornForm.patchValue({ dateOfDeath: null });
      this.alertService.loading('Please enter First Name or Last Name', 'Missing Fields', true);
      return;
    }

    this.claimService.stillBornDuplicateCheck(person).subscribe(dupicatedPEVId => {
      if (dupicatedPEVId !== 0) {
        this.confirmservice.confirmWithoutContainer('Stillborn Duplicate', `This is a Duplicate still born case, Registered claim number: ${dupicatedPEVId}`,
          'Center', 'Center', 'Yes', 'No').subscribe(response => {
            this.overrideDuplicate = response;
            return;
          });
      }
    });
    this.overrideDuplicate = true;
    this.currentAction = '';
  }

  setForm() { }

  cancel() {
    this.router.navigateByUrl('claimcare/claim-manager');
  }

  save() { }
}
