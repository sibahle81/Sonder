import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { CauseOfDeathModel } from '../../../shared/entities/funeral/cause-of-death.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { DeathTypeEnum } from '../../../shared/enums/deathType.enum';
import { BehaviorSubject } from 'rxjs';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { EligiblePolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/eligible-policy';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { ProductPolicy } from '../../../shared/entities/product-policy';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { PersonEventDeathDetailModel } from '../../../shared/entities/personEvent/personEventDeathDetail.model';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
@Component({
  selector: 'additional-registry-details',
  templateUrl: './additional-registry-details.component.html',
  styleUrls: ['./additional-registry-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class AdditionalRegistryDetailsComponent extends WizardDetailBaseComponent<PersonEventModel> {

  DOB: Date;
  minDate: Date;
  isLoading: boolean;
  isStillBorn: boolean;
  isVopdChecked: boolean;
  isVopdVerified = false;
  isSouthAfricanCitizen: boolean;
  isMedicalPractitionerOpinionChecked: boolean;
  isInterviewWithFamilyMemberChecked: boolean;
  showSetting: boolean = false;
  canEditForm: boolean = false;
  gen: string;
  firstName: string;
  isVopdVerifiedLabel: string;
  
  genderValue: number;
  policyLength: number;
  gestationValue: number;
  policyIds: number[] = [];
  eligibleProductIds: number[] = [];

  deceased: RolePlayer;
  eligiblePolicies: Policy[];
  policies: Policy[];
  personEvent: PersonEventModel;
  causeOfDeathTypes: CauseOfDeathModel[];
  provinces: Lookup[];

  year = (new Date().getFullYear() - 1).toString();
  day = new Date().getDay().toString();

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  redPolicyStatus = ['Cancelled', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up'];
  amberPolicyStatus = ['Paused', 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Reinstatement', 'Pre Legal'];
  greenPolicyStatus = ['Active', 'Free Cover'];
  bluePolicyStatus = ['Transferred', 'Reinstated', 'Premium Waivered', 'Premium Waived'];

  constructor(
    authService: AuthService,
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly claimCareService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly policyService: PolicyService) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any) {
    this.minDate = new Date(`${this.year}-01-${this.day}`);
    this.form = this.formBuilder.group({
      typeOfDeath: '',
      causeOfDeath: '',
      dateOfDeath: '',
      dateNotified: '',
      gestation: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      passport: '',
      dateOfBirth: '',
      nationalityOfDeceased: '',
      homeAffairsRegion: '',
      dhaReferenceNumber: '',
      deathCertificateReferenceNumber: '',
      placeEventOccured: '',
      placeOfDeath: new UntypedFormControl('', [Validators.required]),
      interviewWithFamilyMember: '',
      medicalPractitionerOpinion: '',
      gender: '',
      OverrideVopd: '',
    });
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.dateReceived = formModel.dateNotified;
    this.model.personEventDeathDetail.deathTypeId = formModel.deathTypeId;
    this.model.personEventDeathDetail.causeOfDeath = formModel.causeOfDeath;
    this.model.personEventDeathDetail.deathDate = formModel.dateOfDeath;
    this.model.personEventDeathDetail.gestation = formModel.gestation;
    this.model.personEventDeathDetail.homeAffairsRegion = formModel.homeAffairsRegion;
    this.model.personEventDeathDetail.dhaReferenceNo = formModel.dhaReferenceNumber;
    this.model.personEventDeathDetail.deathCertificateNo = formModel.deathCertificateReferenceNumber;
    this.model.personEventDeathDetail.placeOfDeath = formModel.placeEventOccured; // think these are the same
    this.model.personEventDeathDetail.placeOfDeath = formModel.placeOfDeath;
    this.model.personEventDeathDetail.interviewWithFamilyMember = formModel.interviewWithFamilyMember;
    this.model.personEventDeathDetail.opinionOfMedicalPractitioner = formModel.medicalPractitionerOpinion;
    this.deceased.person.passportNumber = formModel.passport;
    this.deceased.person.dateOfBirth = formModel.dateOfBirth;
    this.model.isVopdOverridden = formModel.OverrideVopd;
  }

  populateForm(): void {
    this.getProvinces();
    this.initializeFormPatch(true);
  }

  initializeFormPatch(isInitialMode: boolean){
    this.deceased = this.model.rolePlayers.find(a => a.keyRoleType === KeyRoleEnum[KeyRoleEnum[KeyRoleEnum[KeyRoleEnum.InsuredLife]]]);
    this.claimCareService.getEvent(this.model.eventId).subscribe(result => {
     
      this.form.patchValue({
        typeOfDeath: this.model.personEventDeathDetail.deathType,
        causeOfDeath: this.model.personEventDeathDetail.causeOfDeath,
        dateOfDeath: this.model.personEventDeathDetail.deathDate,
        dateNotified: result.dateAdvised,
        gestation: this.model.personEventDeathDetail.gestation,
        passport: this.deceased.person.passportNumber,
        dateOfBirth: this.deceased.person.dateOfBirth,
        nationalityOfDeceased: this.model.personEventDeathDetail,
        homeAffairsRegion: this.model.personEventDeathDetail.homeAffairsRegion,
        dhaReferenceNumber: this.model.personEventDeathDetail.dhaReferenceNo,
        deathCertificateReferenceNumber: this.model.personEventDeathDetail.deathCertificateNo,
        placeEventOccured: this.model.personEventDeathDetail.placeOfDeath,
        placeOfDeath: this.model.personEventDeathDetail.placeOfDeath,
        interviewWithFamilyMember: this.model.personEventDeathDetail.interviewWithFamilyMember,
        medicalPractitionerOpinion: this.model.personEventDeathDetail.opinionOfMedicalPractitioner,
        isInterviewWithFamilyMemberChecked: this.model.personEventDeathDetail.interviewWithFamilyMember,
        OverrideVopd: this.model.isVopdOverridden,
      });

      if(isInitialMode)
      {
        this.readClaimStatus();
        if (this.model.personEventDeathDetail.deathType === DeathTypeEnum.Stillborn) {
          this.isStillBorn = true;
        } else {
          this.form.get('gestation').clearValidators();
          this.form.get('gestation').updateValueAndValidity();
        }

        this.getCauseOfDeath(this.model.personEventDeathDetail.deathType);
        if (this.policyIds.length <= 0) {
          this.getPolicyIds();
          this.SetGender();
        }

        this.checkVopdStatus();
      }

    });
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    const validationResult = new ValidationResult(this.displayName);
    const productOption = context.data[0].personEventDeathDetail as PersonEventDeathDetailModel;

    if (productOption.deathType !== DeathTypeEnum.Stillborn
      || (productOption.deathType === DeathTypeEnum.Stillborn
        && this.gestationValue)) {
      validationResult.errorMessages = null
      validationResult.errors = 0;
    }
    else {
      if (!this.gestationValue && !this.model.personEventDeathDetail.gestation) {
        validationResult.errorMessages = ['Gestation required'];
        validationResult.errors = 1;
      }
    }

    if (!this.model.personEventDeathDetail.placeOfDeath) {
      validationResult.errorMessages = ['Province required'];
      validationResult.errors = 1;
    } else {
      validationResult.errorMessages = null
      validationResult.errors = 0;
    }

    return validationResult;
  }


  onValidateModel(validationResult: ValidationResult): ValidationResult {

    return validationResult;
  }

  causeOfDeathChange($event) {
    if ($event.value !== undefined) {
      this.getCauseOfDeath($event.value as number);
    }
  }

  getCauseOfDeath(deathType: DeathTypeEnum) {
    this.isLoading = true;
    this.claimCareService.GetCauseOfDeath(deathType).subscribe(causeOfDeaths => {
      this.causeOfDeathTypes = causeOfDeaths;
      this.isLoading = false;
    });
  }

  getProvinces() {
    this.isLoading = true;
    this.lookupService.getStateProvinces().subscribe(provinces => {
      this.provinces = provinces;
      this.isLoading = false;
    });
  }

  setDOB(idNumber: string) {
    const birthDate = idNumber.substring(0, 6);
    const d = birthDate; // YYMMDD
    const yy = d.substr(0, 2);
    const mm = d.substr(2, 2);
    const dd = d.substr(4, 2);
    const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;
    this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
  }

  SetGender() {
    const idNumber = this.deceased.person.idNumber;
    if (idNumber) {
      const genderNumber = idNumber.substring(6);
      const gender = genderNumber.substring(0, 4);
      // tslint:disable-next-line: radix
      const sex = parseInt(gender);
      if (sex > 0 && sex < 4999) {
        this.gen = 'Female';
      } else if (sex > 5000 && sex < 9999) {
        this.gen = 'Male';
      }
    }
    if(this.gen==undefined || this.gen==null)
    {
      this.gen =  GenderEnum[this.deceased.person.gender]    
    }
  }

  interviewWithFamilyMember($event: any) {
    this.isInterviewWithFamilyMemberChecked = $event.checked;
    if (this.isInterviewWithFamilyMemberChecked) {
      this.form.patchValue({
        medicalPractitionerOpinion: false
      });
    }
    this.model.personEventDeathDetail.interviewWithFamilyMember = this.isInterviewWithFamilyMemberChecked;
  }

  getStatus(policyStatusId: number): string {
    const statusText = PolicyStatusEnum[policyStatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  isMedicalPractitionerOpinion($event: any) {
    this.isMedicalPractitionerOpinionChecked = $event.checked;
    if (this.isMedicalPractitionerOpinionChecked) {
      this.form.patchValue({
        interviewWithFamilyMember: false
      });
    }
    this.model.personEventDeathDetail.opinionOfMedicalPractitioner = this.isMedicalPractitionerOpinionChecked;
  }

  isVopdOverridden($event: any) {
    this.isVopdChecked = $event.checked;
    this.model.isVopdOverridden = this.isVopdChecked;
  }

  gestationChanged($event: any) {
    this.gestationValue = $event.value as number;
  }

  genderChanged($event: any) {
    this.genderValue = $event.value as number;
  }

  getPolicyIds() {
    this.policyService.getPolicyIdsByRolePlayerId(this.deceased.rolePlayerId).subscribe(ids => {
      this.getProductIds(ids);
      const productpolicy = new ProductPolicy();
      productpolicy.policyIds = ids;
      this.policyService.getPoliciesByPolicyIds(productpolicy).subscribe(result => {
        this.policies = result;
        this.policyLength = result.length;
        if (result.length > 0) {
          result.forEach(a => {
            this.policyIds.push(a.policyId);
            const statusName = PolicyStatusEnum[a.policyStatus];
            this.model.policyIds = this.policyIds;
            this.isLoading = false;
            this.model.anyEligiblePolicies = true;
          });
        } else {
          this.isLoading = false;
          this.model.anyEligiblePolicies = false;
        }
      });
    });
  }

  getProductIds(policyIds: number[]) {
    const productpolicy = new ProductPolicy();
    productpolicy.policyIds = policyIds;
    this.policyService.getProductIdsByPolicyIds(productpolicy).subscribe(result => {
      result.forEach(a => {
        this.eligibleProductIds.push(a);
        this.getData();
      });
    });
  }

  checkVopdStatus() {
    this.isLoading = true;
    this.rolePlayerService.checkVopdStatus(this.deceased.rolePlayerId).subscribe(isVerified => {
      this.isVopdVerified = isVerified;
      if (isVerified) {
        this.isVopdVerifiedLabel = 'VOPD has been verified';
      } else {
        this.isVopdVerifiedLabel = 'VOPD has not yet been verified';
      }
      this.isLoading = false;
    });
  }

  getData(): void {
    this.isLoading = true;
    const eligiblePolicy = new EligiblePolicy();
    eligiblePolicy.rolePlayerId = this.deceased.rolePlayerId;
    eligiblePolicy.claimDate = this.model.personEventDeathDetail.deathDate as string;
    eligiblePolicy.eligibleProductIds = this.eligibleProductIds;

    this.claimCareService.GetEligiblePolicies(eligiblePolicy).subscribe(result => {
      this.policies = result;
      this.policyLength = result.length;
      if (result.length > 0) {
        result.forEach(a => {
          this.policyIds.push(a.policyId);
          const statusName = PolicyStatusEnum[a.policyStatus];
          this.model.policyIds = this.policyIds;
          this.isLoading = false;
          this.model.anyEligiblePolicies = true;
        });
      } else {
        this.isLoading = false;
        this.model.anyEligiblePolicies = false;
      }
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
    this.initializeFormPatch(false);  
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
