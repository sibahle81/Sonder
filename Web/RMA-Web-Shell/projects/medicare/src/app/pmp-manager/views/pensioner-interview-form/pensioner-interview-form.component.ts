import { Component, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { ModuleTypeEnum } from "projects/shared-models-lib/src/lib/enums/module-type-enum";
import { NoteItemTypeEnum } from "projects/shared-models-lib/src/lib/enums/note-item-type-enum";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { UserService } from "projects/shared-services-lib/src/lib/services/security/user/user.service";
import { isNullOrUndefined } from "util";
import { PensionerInterviewFormDetail } from "../../models/pensioner-briefing-interview-form-detail";
import { PensionerInterviewForm } from "../../models/pensioner-interview-form-detail";
import { PensionerMedicalPlanService } from "../../services/pensioner-medical-plan-service";
import { PensionClaim } from "projects/shared-components-lib/src/lib/models/pension-case.model";
import { PMPService } from "../../services/pmp-service";
import { CrudActionType } from "../../../shared/enums/crud-action-type";
import { LevelOfAmputationTypes } from "../../enums/level-of-amputation-types";
import { ReferralItemTypeEnum } from "projects/shared-models-lib/src/lib/referrals/referral-item-type-enum";
import { UserReminderService } from "projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service";
import { UserReminder } from "projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder";
import { UserReminderTypeEnum } from "projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum";
import { UserReminderItemTypeEnum } from "projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum";
import { ClaimCareService } from "projects/claimcare/src/app/claim-manager/Services/claimcare.service";
import { PersonEventModel } from "projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model";
import { Location } from '@angular/common';

@Component({
  selector: 'app-pensioner-interview-form',
  templateUrl: './pensioner-interview-form.component.html',
  styleUrls: ['./pensioner-interview-form.component.css']
})
export class PensionerInterviewFormComponent {
  
  title = 'Pensioner Interview Form';
  isLinear = false;
  isLoading = false;
  pensionerDetailsFormGroup: FormGroup;
  branchMCADetailsFormGroup: FormGroup;
  disabilityDetailsFormGroup: FormGroup;
  pensionerInterviewFormDetailsFormGroup: FormGroup;

  levelOfAmputationTypes: LevelOfAmputationTypes[];
  
  yesNoInputType = [
    { text: "Yes", value: true },
    { text: "No", value: false }
  ];
  //notes
  moduleType = [ModuleTypeEnum.MediCare, ModuleTypeEnum.ClaimCare, ModuleTypeEnum.PensCare];
  noteItemType = NoteItemTypeEnum.PensionCaseMedicare;
  
  //referrals
  targetModuleType = ModuleTypeEnum.MediCare;
  referralItemType = ReferralItemTypeEnum.PersonEvent;
  referralItemTypeReference: string;

  rolePlayer: RolePlayer = new RolePlayer();//this will change once we have met with business to confirm all the data and details
  isReadOnly = false;
  pensionCaseId: number;
  claimId: number;
  pensionerInterviewFormDetail: PensionerInterviewForm;
  pensionCaseNumber: string;
  selectedPensionCase: PensionClaim;
  crudActionType: CrudActionType
  pensionerInterviewFormId: number;
  crudActionTypeEnum = CrudActionType;
  userReminders: UserReminder[] = [];
  selectedPersonEvent: PersonEventModel;

  constructor(private formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly toasterService: ToastrManager,
    private readonly userReminderService: UserReminderService,
    private readonly claimService: ClaimCareService,
    private pensionerMedicalPlanService: PensionerMedicalPlanService,
    private readonly authService: AuthService, public userService: UserService,
    private readonly router: Router,
    private readonly pmpService: PMPService,
    private location: Location) {
    this.getLookups();
    this.getRouteData();
    if (isNullOrUndefined(this.pensionerInterviewFormDetail) && this.pensionerInterviewFormId < 1)
      this.pensionerInterviewFormDetail = new PensionerInterviewForm();
  }

  getLookups() {
    this.levelOfAmputationTypes = this.ToArray(LevelOfAmputationTypes);
    this.createForm();
  }

  createForm(){

    this.pensionerDetailsFormGroup = this.formBuilder.group({
      surname: [{ value: '', disabled: false }],
    });

    this.branchMCADetailsFormGroup = this.formBuilder.group({
      MCAName: [{ value: '', disabled: false }],
    });

    this.disabilityDetailsFormGroup = this.formBuilder.group({
      isInjury: [{ value: '', disabled: false }],
      isDisease: [{ value: '', disabled: false }],
      occupationalDiseaseName: [{ value: '', disabled: false }],
      occupationalInjuryName: [{ value: '', disabled: false }],
      isAmputee: [{ value: '', disabled: false }],
      isWheelchairIssued: [{ value: '', disabled: false }],
      wheelchairIssuedDate: [{ value: '', disabled: false }],
      makeModel: [{ value: '', disabled: false }],
      applianceReviewDate: [{ value: '', disabled: false }],
      limbAmputated: [{ value: '', disabled: false }],
      levelOfAmputation: [{ value: '', disabled: false }],
      prostheticIssued: [{ value: '', disabled: false }],
      prostheticReviewDate: [{ value: '', disabled: false }],
      isCAA: [{ value: '', disabled: false }],
      isInstitutionalised: [{ value: '', disabled: false }],
      nameOfInstitution: [{ value: '', disabled: false }],
      landlineNumberInst: [{ value: '', disabled: false }],

    });

    this.pensionerInterviewFormDetailsFormGroup = this.formBuilder.group({
      chronicMedicinesAndSundries: [{ value: '', disabled: false }],
      certificationOfLifeYearlyAndSuspension: [{ value: '', disabled: false }],
      informationBrochure: [{ value: '', disabled: false }],
      dateOfinterview: [{ value: '', disabled: false }],
      explainedCalculation: [{ value: '', disabled: false }],
      explainedPayDates: [{ value: '', disabled: false }],
      explainedProofOfLife: [{ value: '', disabled: false }],
      explainedIncreases: [{ value: '', disabled: false }],
      explainedMedicalTreatment: [{ value: '', disabled: false }],
      explainedPreAuthorisation: [{ value: '', disabled: false }],
      explainedMaintenance: [{ value: '', disabled: false }],
      suppliedBooklet: [{ value: '', disabled: false }],
      suppliedContactDetails: [{ value: '', disabled: false }],
      explainedChronicMedication: [{ value: '', disabled: false }],
      explainedTransportation: [{ value: '', disabled: false }],
    });

  }

  getRouteData(){

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.pensionCaseId) {
        this.pensionCaseId = +params.pensionCaseId;
      }
      if (params.pensionCaseNumber) {
        this.pensionCaseNumber = params.pensionCaseNumber;
        this.getPensionCaseData();
      }
      if (params.claimId) {
        this.claimId = params.claimId;
        this.getPersonEvent(this.claimId)
      }
      if (params.pensionerInterviewFormId) {
        this.pensionerInterviewFormId = +params.pensionerInterviewFormId;
      }
      if (params.crudActionType) {
        this.crudActionType = +params.crudActionType;

        switch (this.crudActionType) {
          case CrudActionType.create:
            this.disableForm(false);
            break;
          case CrudActionType.edit:
            this.disableForm(false);
            this.listInterviewForm();
            break;
          case CrudActionType.read:
            this.disableForm(true);
            this.listInterviewForm();
            break;
          default:
            break;
        }
      }

    });
  }

  getPersonEvent(claimId: number) {
    this.claimService.getPersonEventByClaimId(claimId).subscribe(result => {
      this.selectedPersonEvent = result;
    })
  }

  submitInterviewForm() {
    this.isLoading = true;
    this.createPensionerInterviewDetails()

    if (this.crudActionType == CrudActionType.create) {
      this.pensionerMedicalPlanService.createPensionerInterviewFormDetail(this.pensionerInterviewFormDetail).subscribe(
        data => {
          this.isLoading = false;
          if (data > 0) {
            this.pensionerInterviewFormId = data;
            this.toasterService.successToastr('Pensioner Interview: created');
            this.sendNotifications()
          }
        }
      );
    }
    else if (this.crudActionType == CrudActionType.edit) {
      this.pensionerMedicalPlanService.updatePensionerInterviewForm(this.pensionerInterviewFormDetail).subscribe(
        data => {
          this.isLoading = false;
          if (data) {
            this.toasterService.successToastr('Pensioner Interview: updated');
            this.onNavigateBack()
          }
        }
      );
    }

  }

  sendNotifications() {
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.text = `New Pensioner Interview form submitted by: ${this.authService.getUserEmail()}`;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    userReminder.userReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications;
    userReminder.itemId = this.pensionCaseId;
    userReminder.linkUrl = `/medicare/pmp-manager/pensioner-interview-form/${this.pensionCaseId}/${this.pensionCaseNumber}/${this.claimId}/${this.pensionerInterviewFormId}/${CrudActionType.read}`;
    userReminder.assignedByUserId = this.authService.getCurrentUser().id;

    userReminder.assignedToUserId = this.authService.getCurrentUser().id;
    this.userReminders.push(userReminder);
    this.userReminderService.createUserReminders(this.userReminders).subscribe(result => {
      this.toasterService.successToastr('Pensioner Interview notifications: sent..');
      this.onNavigateBack();
    });
  }

  onNavigateBack() {
    this.location.back();
  }

  createPensionerInterviewDetails(): void {
    this.pensionerInterviewFormDetail.chronicMedicine = this.pensionerInterviewFormDetailsFormGroup.controls.chronicMedicinesAndSundries.value;
    this.pensionerInterviewFormDetail.interviewDate = this.pensionerInterviewFormDetailsFormGroup.controls.dateOfinterview.value;
    this.pensionerInterviewFormDetail.infoBrochure = this.pensionerInterviewFormDetailsFormGroup.controls.informationBrochure.value;
    this.pensionerInterviewFormDetail.col = this.pensionerInterviewFormDetailsFormGroup.controls.certificationOfLifeYearlyAndSuspension.value;
    this.pensionerInterviewFormDetail.pensionerId = this.pensionCaseId;

    this.pensionerInterviewFormDetail.isInjury=this.disabilityDetailsFormGroup.controls.isInjury.value;
    this.pensionerInterviewFormDetail.isDisease=this.disabilityDetailsFormGroup.controls.isDisease.value;
    this.pensionerInterviewFormDetail.occupationalDiseaseName=this.disabilityDetailsFormGroup.controls.occupationalDiseaseName.value;
    this.pensionerInterviewFormDetail.occupationaInjuryName=this.disabilityDetailsFormGroup.controls.occupationalInjuryName.value
    this.pensionerInterviewFormDetail.isAmputee=this.disabilityDetailsFormGroup.controls.isAmputee.value
    this.pensionerInterviewFormDetail.isWheelchairIssued=this.disabilityDetailsFormGroup.controls.isWheelchairIssued.value
    this.pensionerInterviewFormDetail.wheelchairIssued=this.disabilityDetailsFormGroup.controls.wheelchairIssuedDate.value
    this.pensionerInterviewFormDetail.makeModel=this.disabilityDetailsFormGroup.controls.makeModel.value
    this.pensionerInterviewFormDetail.applianceReviewDate=this.disabilityDetailsFormGroup.controls.applianceReviewDate.value
    this.pensionerInterviewFormDetail.limbAmputated=this.disabilityDetailsFormGroup.controls.limbAmputated.value
    this.pensionerInterviewFormDetail.levelOfAmputation = !(this.disabilityDetailsFormGroup.controls.levelOfAmputation.value) ? LevelOfAmputationTypes[LevelOfAmputationTypes.Other] : this.disabilityDetailsFormGroup.controls.levelOfAmputation.value;

    this.pensionerInterviewFormDetail.isCaa=this.disabilityDetailsFormGroup.controls.isCAA.value;
    this.pensionerInterviewFormDetail.isInstitutionalised=this.disabilityDetailsFormGroup.controls.isInstitutionalised.value;
    this.pensionerInterviewFormDetail.nameOfInstitution=this.disabilityDetailsFormGroup.controls.nameOfInstitution.value;
    this.pensionerInterviewFormDetail.contactNoOfInstitution=this.disabilityDetailsFormGroup.controls.landlineNumberInst.value;

    this.createPensionerBriefingInterviewFormDetails()
  }

  createPensionerBriefingInterviewFormDetails() {

    if (isNullOrUndefined(this.pensionerInterviewFormDetail.pensionerInterviewFormDetails) || this.pensionerInterviewFormDetail.pensionerInterviewFormDetails.length < 1) {
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails = [new PensionerInterviewFormDetail()];
    }

    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedCalculation = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedCalculation.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedPayDates = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedPayDates.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedProofOfLife = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedProofOfLife.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedIncreases = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedIncreases.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedMedicalTreatment = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedMedicalTreatment.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedPreAuthorisation = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedPreAuthorisation.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedMaintenance = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedMaintenance.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].suppliedBooklet = !(this.pensionerInterviewFormDetailsFormGroup.controls.suppliedBooklet.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].suppliedContactDetails = !(this.pensionerInterviewFormDetailsFormGroup.controls.suppliedContactDetails.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedChronicMedication = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedChronicMedication.value) ? false : true;
    this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].explainedTransportation = !(this.pensionerInterviewFormDetailsFormGroup.controls.explainedTransportation.value) ? false : true;

    if (this.crudActionType == CrudActionType.create) {
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].createdDate = new Date().toDateString();
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].modifiedDate = new Date().toDateString();
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].createdBy = this.authService.getUserEmail();
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].modifiedBy = this.authService.getUserEmail();
    }
    else {
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].modifiedBy = this.authService.getUserEmail();
      this.pensionerInterviewFormDetail.pensionerInterviewFormDetails[0].modifiedDate = new Date().toDateString();
    }

  }

  getPensionCaseData() {
    this.isLoading = true;
    this.pmpService.searchPensionCase(this.pensionCaseNumber, 0).subscribe(res => {
      this.isLoading = false;
      this.selectedPensionCase = res;
    });
  }

  listInterviewForm() {
    this.isLoading = true
    this.pensionerMedicalPlanService.getPensionerInterviewFormByPensionerId(this.pensionCaseId).subscribe(
      data => {
        this.isLoading = false
        this.pensionerInterviewFormDetail = data.find(d => d.pensionerInterviewFormId == this.pensionerInterviewFormId);
        this.prepopulateForm()
      }
    );
  }

  disableForm(disableVal: boolean) {
    if (disableVal) {
      this.disabilityDetailsFormGroup.disable();
      this.pensionerInterviewFormDetailsFormGroup.disable();
    }
    else {
      this.disabilityDetailsFormGroup.enable();
      this.pensionerInterviewFormDetailsFormGroup.enable();
    }
  }

  prepopulateForm() {
    this.isLoading = false

    const selectedpensionerInterviewForm =  this.pensionerInterviewFormDetail;

    if (!isNullOrUndefined(selectedpensionerInterviewForm)) {
      this.disabilityDetailsFormGroup.patchValue({
        isInjury: selectedpensionerInterviewForm.isInjury,
        isDisease: selectedpensionerInterviewForm.isDisease,
        occupationalDiseaseName: selectedpensionerInterviewForm.occupationalDiseaseName,
        occupationalInjuryName: selectedpensionerInterviewForm.occupationaInjuryName,
        isAmputee: selectedpensionerInterviewForm.isAmputee,
        isWheelchairIssued: selectedpensionerInterviewForm.isWheelchairIssued,
        wheelchairIssuedDate: selectedpensionerInterviewForm.wheelchairIssued,
        makeModel: selectedpensionerInterviewForm.makeModel,
        applianceReviewDate: selectedpensionerInterviewForm.applianceReviewDate,
        limbAmputated: selectedpensionerInterviewForm.limbAmputated,
        levelOfAmputation: selectedpensionerInterviewForm.levelOfAmputation,
        prostheticIssued: selectedpensionerInterviewForm.isActive,
        prostheticReviewDate: selectedpensionerInterviewForm.isActive,
        isCAA: selectedpensionerInterviewForm.isCaa,
        isInstitutionalised: selectedpensionerInterviewForm.isInstitutionalised,
        nameOfInstitution: selectedpensionerInterviewForm.nameOfInstitution,
        landlineNumberInst: selectedpensionerInterviewForm.contactNoOfInstitution,

      });

      this.pensionerInterviewFormDetailsFormGroup.patchValue({
        chronicMedicinesAndSundries: selectedpensionerInterviewForm.chronicMedicine,
        certificationOfLifeYearlyAndSuspension: selectedpensionerInterviewForm.col,
        informationBrochure: selectedpensionerInterviewForm.infoBrochure,
        dateOfinterview: selectedpensionerInterviewForm.interviewDate,
        explainedCalculation: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedCalculation,
        explainedPayDates: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedPayDates,
        explainedProofOfLife: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedProofOfLife,
        explainedIncreases: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedIncreases,
        explainedMedicalTreatment: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedMedicalTreatment,
        explainedPreAuthorisation: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedPreAuthorisation,
        explainedMaintenance: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedMaintenance,
        suppliedBooklet: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].suppliedBooklet,
        suppliedContactDetails: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].suppliedContactDetails,
        explainedChronicMedication: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedChronicMedication,
        explainedTransportation: selectedpensionerInterviewForm.pensionerInterviewFormDetails[0].explainedTransportation,
      });
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
  
}
