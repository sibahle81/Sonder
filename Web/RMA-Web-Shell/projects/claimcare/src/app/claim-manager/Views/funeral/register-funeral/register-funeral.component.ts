import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { RegisterFuneralModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/register-funeral.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Permission } from 'projects/shared-models-lib/src/lib/security/permission';
import { FuneralService } from 'projects/claimcare/src/app/claim-manager/Services/funeral.service';
import { FuneralRuleResult } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/funeral-rule-result';
import { ClaimantModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claimant.model';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-register-funeral',
  templateUrl: './register-funeral.component.html',
  styleUrls: ['./register-funeral.component.css']
})
export class RegisterFuneralComponent extends DetailsComponent implements OnInit {

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly policyService: PolicyService,
    private readonly claimService: ClaimCareService,
    private readonly insuredLifeService: InsuredLifeService,
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly wizardService: WizardService,
    public dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly funeralService: FuneralService) {
    super(appEventsManager, alertService, router, 'Funeral claim', 'claimcare/claim-manager/search', 1);
  }

  form: UntypedFormGroup;
  isStillborn = false;
  firstName = '';
  lastName = '';
  deceased = '';
  dateOfDeath = '';
  policyId: number;
  policy: Policy;
  insuredLives: InsuredLife[];
  insuredLife: InsuredLife;
  selectedTypeOfDeath: string;
  selectedInsuredLifeId: number;
  insuredLifeSelected: boolean;
  isInsuredLivesLoading: boolean;
  isPolicyLoading: boolean;
  isSaving: boolean;
  funeralId: number;
  currentAction: string;
  isDuplicate: boolean;
  uniqueClaimReferenceNumber: string;
  showWizardButton: boolean;
  wizardId: number;
  insuredLifeId: number;
  readOnly: boolean;
  isLoading: boolean;
  permissions: Permission[];
  canAdd: boolean;
  enableRegister = false;
  isStillbornSetFromSearch: boolean;
  ruleResult: FuneralRuleResult;

  duplicateMessages: { [key: number]: string; } = {};

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {

        this.permissions = this.authService.getCurrentUserPermissions();
        this.showWizardButton = false;
        this.policyId = params.id;
        if (params.wizardId) {
          this.wizardId = params.wizardId;
        }
        this.insuredLifeId = params.insuredLifeId;
        this.isStillbornSetFromSearch = params.deathTypeId === 3; // Do not change == to === for this line

        this.createForm(this.policyId);
        this.checkPermissions();

        if (this.canAdd) {
          this.getPolicy(this.policyId);
          this.insuredLifeSelected = false;

          if (params.isreadonly as boolean) {
            this.form.disable();
            this.isLoading = true;
            this.readOnly = true;
            this.insuredLifeSelected = true;
            this.showWizardButton = true;
            this.getDeceased(params.insuredLifeId);
          } else {
            this.getDeceased(params.insuredLifeId);
          }
        }
        this.form.get('firstName').disable();
        this.form.get('lastName').disable();
        this.form.get('dateOfDeath').disable();
      } else {
        this.router.navigateByUrl('claimcare/claim-manager/funeral/work-pool-list');
      }
    });
  }

  checkPermissions() {
    this.canAdd = userUtility.hasPermission('Register Funeral Claim');
  }

  getDeceasedInfo(policyId: number, insuredLifeId: number, wizardId: number) {
    this.claimService.GetDeceasedInfo(policyId, insuredLifeId, wizardId).subscribe(registerFuneral => {
      this.setFormReadOnly(registerFuneral);
    });
  }

  getPolicy(policyId: number) {
    this.isPolicyLoading = true;
    this.isInsuredLivesLoading = true;

    this.policyService.getPolicy(policyId).subscribe(policy => {
      this.policy = policy;
      this.insuredLifeService.getInsuredLivesByPolicy(policyId).subscribe(insuredLives => {
        this.insuredLives = insuredLives;
        this.isInsuredLivesLoading = false;
        this.isPolicyLoading = false;
        this.setForm();
        if (this.readOnly) {
          this.getDeceasedInfo(this.policyId, this.insuredLifeId, this.wizardId);
        }
      });
    });
  }

  setForm() {
    this.form.patchValue({
      policyNumber: this.policy.policyNumber,
      deceased: this.insuredLives
    });

    this.form.patchValue({
      deceased: this.insuredLife.id
    });

    if (this.isStillbornSetFromSearch) {
      this.form.patchValue({
        typeOfDeath: 3,
      });
      this.setupTypeOfDeath(3);
      this.form.get('typeOfDeath').disable();
    }
  }

  setFormReadOnly(registerFuneral: RegisterFuneralModel) {
    this.isStillborn = registerFuneral.deathType === 3;

    this.form.patchValue({
      typeOfDeath: registerFuneral.deathType,
      deceased: registerFuneral.insuredLifeId,
      policyNumber: this.policy.policyNumber,
      dateOfDeath: registerFuneral.dateOfDeath,
      firstName: registerFuneral.firstName,
      lastName: registerFuneral.lastName
    });

    this.isLoading = false;
  }

  createForm(id: any) {
    this.form = this.formBuilder.group({
      id: id as number,
      typeOfDeath: new UntypedFormControl('', [Validators.required]),
      deceased: new UntypedFormControl('', [Validators.required]),
      policyNumber: new UntypedFormControl({ value: '', disabled: true }, [Validators.required]),
      dateOfDeath: new UntypedFormControl(''),
      email: new UntypedFormControl('', [Validators.required, Validators.email]),
      mobileNumber: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl(''),
      lastName: new UntypedFormControl(''),
      claimantFirstName: new UntypedFormControl(''),
      claimantLastName: new UntypedFormControl(''),
      claimantIdentityNumber: new UntypedFormControl(''),
      claimantPassport: new UntypedFormControl(''),

    });
  }

  readForm() {
    const formModel = this.form.value;
    const registerFuneralModel = new RegisterFuneralModel();
    const castDateOfDeathToDate = new Date(formModel.dateOfDeath);
    const claimant = new ClaimantModel();
    registerFuneralModel.deathType = +this.selectedTypeOfDeath;
    registerFuneralModel.policyId = this.policyId;
    registerFuneralModel.dateOfDeath = new Date(castDateOfDeathToDate.setDate(castDateOfDeathToDate.getDate() + 1));
    registerFuneralModel.insuredLifeId = this.selectedInsuredLifeId;
    registerFuneralModel.isStillborn = this.isStillborn;
    registerFuneralModel.firstName = formModel.firstName as string;
    registerFuneralModel.lastName = formModel.lastName as string;
    claimant.email = formModel.email as string;
    claimant.mobile = formModel.mobileNumber as string;
    claimant.firstName = formModel.claimantFirstName as string;
    claimant.lastName = formModel.claimantLastName as string;
    claimant.identityNumber = formModel.claimantIdentityNumber as string;
    claimant.passportNumber = formModel.claimantPassport as string;
    registerFuneralModel.claimant = claimant;
    if (!this.isStillborn) {
      registerFuneralModel.idNumber = this.insuredLife.idNumber as string;
      registerFuneralModel.passportNumber = this.insuredLife.passportNumber as string;
    }

    return registerFuneralModel;
  }

  validateForm() {
    this.currentAction = 'Validating input...';
    const request = this.readForm();

    const today = new Date();
    const castDateOfDeathToDate = new Date(request.dateOfDeath);
    const deathDate = new Date(castDateOfDeathToDate.setDate(castDateOfDeathToDate.getDate() - 1));

    if (today < deathDate) {
      this.form.get('dateOfDeath').setErrors({ min: true });
      return false;
    } else {
      this.form.get('dateOfDeath').setErrors(null);
      this.form.get('dateOfDeath').updateValueAndValidity();
    }

    if (this.form.get('email').hasError('required') || this.form.get('email').hasError('email')) {
      return false;
    } else {
      this.form.get('email').setErrors(null);
      this.form.get('email').updateValueAndValidity();
    }

    if (!this.insuredLifeSelected && !this.isStillborn) {
      return false;
    }

    return true;
  }

  save() {
    this.isSaving = true;
    this.currentAction = 'Registering new case...';

    const isValid = this.validateForm();
    if (!isValid) {
      this.isSaving = false;
      return;
    }

    this.form.disable();
    const registerFuneralModel = this.readForm();

    this.currentAction = 'Checking for duplicates...';
    this.claimService.duplicateClaimCheck(registerFuneralModel).subscribe(result => {
      this.isDuplicate = !result.ruleResult.passed;
      this.duplicateMessages = result.ruleResult.messageList;
      if (!this.isDuplicate) {
        this.executeFuneralRegistrationRules(registerFuneralModel);
      } else {
        this.openDuplicateDialog();
      }
    });
  }

  openDuplicateDialog(): void {
    const question = 'Possible duplicate detected, Would you like to continue?';
    const messageList: string[] = [];

    for (let key in this.duplicateMessages) {
      messageList.push( this.duplicateMessages[key]);
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: { question, messageList }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response == null) {
        this.router.navigateByUrl('claimcare/claim-manager/search');
      } else {
        const registerFuneralModel = this.readForm();
        this.addDeceasedInfo(registerFuneralModel);
      }
    });
  }

  openCompletedDialog(): void {
    const question = `New claim registered successfully with claim reference number: ${this.uniqueClaimReferenceNumber}`;
    const isNotification = true;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: { question, isNotification }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response == null) {
        this.router.navigateByUrl('claimcare/claim-manager/funeral/work-pool-list');
      }
    });
  }

  openRuleDialog(): void {
    const question = 'Business rules failed! Would you like to override?';
    const messageList: string[] = [];

    for (let key in this.ruleResult.messageList) {
      messageList.push(this.ruleResult.messageList[key]);
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, messageList }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response == null) {
        this.router.navigateByUrl('claimcare/claim-manager/search');
      } else {
        const registerFuneralModel = this.readForm();
        registerFuneralModel.ruleResult = this.ruleResult;
        this.addDeceasedInfo(registerFuneralModel);
      }
    });
  }

  executeFuneralRegistrationRules(registerFuneralModel: RegisterFuneralModel) {
    this.currentAction = 'Executing funeral claim registration rules...';
    this.funeralService.executeFuneralClaimRegistrationRules(registerFuneralModel).subscribe(result => {
      this.ruleResult = result.ruleResult;
      registerFuneralModel.ruleResult = this.ruleResult;

      if (this.ruleResult.passed) {
        this.addDeceasedInfo(registerFuneralModel);
      } else {
        this.openRuleDialog();
      }
    });
  }

  addDeceasedInfo(registerFuneralModel: RegisterFuneralModel) {
    this.form.get('email').disable();
    this.currentAction = 'Adding deceased info...';
    this.claimService.addDeceasedInfo(registerFuneralModel).subscribe(response => {
      const registerFuneralResponse = new RegisterFuneralModel();
      registerFuneralResponse.id = response.id;
      registerFuneralResponse.claimId = response.claimId;
      registerFuneralResponse.funeralId = response.funeralId;

      this.funeralId = response.funeralId;
      this.uniqueClaimReferenceNumber = response.uniqueClaimReferenceNumber;
      this.startWizard(registerFuneralResponse);
    });
  }

  startWizard(registerFuneralResponse: RegisterFuneralModel) {
    this.currentAction = 'Creating wizard...';
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'register-funeral-claim';
    startWizardRequest.linkedItemId = registerFuneralResponse.claimId;

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      registerFuneralResponse.wizardId = wizard.id;
      this.updateClaimWizard(registerFuneralResponse);
    });
  }

  updateClaimWizard(registerFuneralResponseModel: RegisterFuneralModel) {
    this.currentAction = 'Updating claim wizard...';

    this.claimService.updateClaimWizard(registerFuneralResponseModel).subscribe(() => {
      this.isSaving = false;
      const message = this.uniqueClaimReferenceNumber;
      this.done(`'New claim registered '${message}`);
      this.openCompletedDialog();
    });
  }

  cancel() {
    this.router.navigateByUrl('claimcare/claim-manager/search');
  }

  redirectToWizard() {
    this.router.navigateByUrl('claimcare/claim-manager/register-funeral/start/register-funeral-claim/' + this.wizardId);
  }

  typeOfDeathChanged($event: any) {
    this.setupTypeOfDeath($event.value as number);
    this.form.get('dateOfDeath').enable();
    this.enableRegister = false;
  }

  EnableRegister() {
  this.enableRegister = true;
  }

  setupTypeOfDeath(deathTypeId: number) {
    this.selectedTypeOfDeath = deathTypeId as unknown as string;

    if (deathTypeId !== 3) {
      this.isStillborn = false;
      this.form.get('firstName').disable();
      this.form.get('lastName').disable();
    } else {
      this.isStillborn = true;
      this.insuredLifeSelected = true;
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
      this.form.patchValue({
        firstName: '',
        lastName: ''
      });
    }
  }

  deceasedChanged($event: any) {
    this.insuredLifeSelected = false;
    const deceasedId = $event.value as number;
    this.getDeceased(deceasedId);

  }

  getDeceased(insuredLifeId: number) {
    this.selectedInsuredLifeId = insuredLifeId;
    this.insuredLifeService.getInsuredLife(this.selectedInsuredLifeId).subscribe(insuredLife => {
      this.insuredLife = insuredLife;
      this.form.patchValue({
        firstName: this.insuredLife.name,
        lastName: this.insuredLife.surname
      });
      this.insuredLifeSelected = true;
      if (this.readOnly) {
        this.claimService.GetDeceasedInfo(this.policyId, insuredLifeId, this.wizardId).subscribe(info => {
          this.getNotes(info.claimId, ServiceTypeEnum.ClaimManager, 'Claim');
        });
      }
    });
  }
}
