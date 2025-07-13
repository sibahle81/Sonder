import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimDisabilityService } from 'projects/claimcare/src/app/claim-manager/Services/claim-disability.service';
import { ClaimDisabilityPension } from 'projects/claimcare/src/app/claim-manager/shared/entities/claim-disability-pension';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { LevelOfAmputationTypes } from 'projects/medicare/src/app/pmp-manager/enums/level-of-amputation-types';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pensioner-interview-details',
  templateUrl: './pensioner-interview-details.component.html',
  styleUrls: ['./pensioner-interview-details.component.css']
})
export class PensionerInterviewDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading pensioner details...please wait');

  form: UntypedFormGroup;

  ccaPermission = 'Cca Pool';

  disabilityPension: ClaimDisabilityPension;
  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;
  noteType = NoteTypeEnum.DisabilityPension;
  noteCategory = NoteCategoryEnum.Claim;

  selectedPersonEvent: PersonEventModel;
  mainInsuredRolePlayer: RolePlayer;
  beneficiary: RolePlayer;
  levelOfAmputationTypes: LevelOfAmputationTypes[];
  toggle = false;
  isReadOnly = false;
  isWizard = false;
  mode: ModeEnum;
  currentUser: User;
  claim: Claim;
  showRelation = false;
  selectedTabIndex = 0;
  toRolePlayerId: number;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly claimDisabilityService: ClaimDisabilityService,
    private readonly alertService: ToastrManager,
  ) { 
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges() {
    if (this.personEvent) {
      this.getLookups();
      this.createForm();
    }
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      interviewDate: [{ value: new Date(), disabled: true }],
      isInjury: [{ value: false, disabled: false }],
      isDisease: [{ value: false, disabled: false }],
      occupationalName: [{ value: null, disabled: false }, Validators.required],
      isAmputee: [{ value: false, disabled: false }, Validators.required],
      isParaplegic: [{ value: false, disabled: false }, Validators.required],
      isWheelchairIssued: [{ value: false, disabled: false }],
      wheelchairIssuedDate: [{ value: null, disabled: false }],
      makeModel: [{ value: null, disabled: false }],
      applianceReviewDate: [{ value: null, disabled: false }],
      limbAmputated: [{ value: null, disabled: false }, Validators.required],
      levelOfAmputation: [{ value: null, disabled: false }, Validators.required],
      prostheticIssued: [{ value: null, disabled: false }],
      prostheticReviewDate: [{ value: null, disabled: false }],
      isCAA: [{ value: false, disabled: false }],
      isFamilyAllowance: [{ value: false, disabled: false }],
      nameOfInstitution: [{ value: null, disabled: false }],
      landlineNumberInstitution: [{ value: null, disabled: false }, Validators.pattern(/^[0-9]{10}$/)],

      chronicMedicinesAndSundries: [{ value: null, disabled: false }],
      certificationOfLifeYearlyAndSuspension: [{ value: null, disabled: false }],
      informationBrochure: [{ value: null, disabled: false }],

      explainedCalculation: [{ value: false, disabled: false }],
      explainedPayDates: [{ value: false, disabled: false }],
      explainedProofOfLife: [{ value: false, disabled: false }],
      explainedIncreases: [{ value: false, disabled: false }],
      explainedMedicalTreatment: [{ value: false, disabled: false }],
      explainedPreAuthorisation: [{ value: false, disabled: false }],
      explainedMaintenance: [{ value: false, disabled: false }],
      suppliedBooklet: [{ value: false, disabled: false }],
      suppliedContactDetails: [{ value: false, disabled: false }],
      explainedChronicMedication: [{ value: false, disabled: false }],
      explainedTransportation: [{ value: false, disabled: false }],
    });

    if (this.disabilityPension) {
      this.setForm();
    }
    this.disableFormControls();
  }

  setForm() {

    this.form.patchValue({
      interviewDate: this.disabilityPension && this.disabilityPension.interviewDate ? this.disabilityPension.interviewDate : new Date(),
      isInjury: this.disabilityPension && this.disabilityPension.isInjury ? this.disabilityPension.isInjury : null,
      isDisease: this.disabilityPension && this.disabilityPension.isDisease ? this.disabilityPension.isInjury : null,
      occupationalName: this.disabilityPension && this.disabilityPension.occupationalName ? this.disabilityPension.occupationalName : null,
      isAmputee: this.disabilityPension && this.disabilityPension.isAmputee ? this.disabilityPension.isAmputee ? 'Yes' : null : 'No',
      isParaplegic: this.disabilityPension && this.disabilityPension.isParaplegic ? this.disabilityPension.isParaplegic ? 'Yes' : null : 'No',
      isWheelchairIssued: this.disabilityPension && this.disabilityPension.isWheelchairIssued ? this.disabilityPension.isWheelchairIssued : null,
      wheelchairIssuedDate: this.disabilityPension && this.disabilityPension.wheelchairIssuedDate ? this.disabilityPension.wheelchairIssuedDate : null,
      makeModel: this.disabilityPension && this.disabilityPension.makeModel ? this.disabilityPension.makeModel : null,
      applianceReviewDate: this.disabilityPension && this.disabilityPension.applianceReviewDate ? this.disabilityPension.applianceReviewDate : null,
      limbAmputated: this.disabilityPension && this.disabilityPension.limbAmputated ? this.disabilityPension.limbAmputated : null,
      levelOfAmputation: this.disabilityPension && this.disabilityPension.levelOfAmputation ? this.disabilityPension.levelOfAmputation : null,
      prostheticIssued: this.disabilityPension && this.disabilityPension.prostheticIssued ? this.disabilityPension.prostheticIssued : null,
      prostheticReviewDate: this.disabilityPension && this.disabilityPension.prostheticReviewDate ? this.disabilityPension.prostheticReviewDate : null,
      isCAA: this.disabilityPension && this.disabilityPension.isCaa ? this.disabilityPension.isCaa ? 'Yes' : null : 'No',
      isFamilyAllowance: this.disabilityPension && this.disabilityPension.isFamilyAllowance ? this.disabilityPension.isFamilyAllowance ? 'Yes' : null : 'No',
      nameOfInstitution: this.disabilityPension && this.disabilityPension.nameOfInstitution ? this.disabilityPension.nameOfInstitution : null,
      landlineNumberInstitution: this.disabilityPension && this.disabilityPension.landlineNumberInstitution ? this.disabilityPension.landlineNumberInstitution : null,

      chronicMedicinesAndSundries: this.disabilityPension && this.disabilityPension.chronicMedicinesAndSundries ? this.disabilityPension.chronicMedicinesAndSundries : null,
      certificationOfLifeYearlyAndSuspension: this.disabilityPension && this.disabilityPension.certificationOfLifeYearlyAndSuspension ? this.disabilityPension.certificationOfLifeYearlyAndSuspension : null,
      informationBrochure: this.disabilityPension && this.disabilityPension.informationBrochure ? this.disabilityPension.informationBrochure : null,
      explainedCalculation: this.disabilityPension && this.disabilityPension.explainedCalculation ? this.disabilityPension.explainedCalculation : null,
      explainedPayDates: this.disabilityPension && this.disabilityPension.explainedPayDates ? this.disabilityPension.explainedPayDates : null,
      explainedProofOfLife: this.disabilityPension && this.disabilityPension.explainedProofOfLife ? this.disabilityPension.explainedProofOfLife : null,
      explainedIncreases: this.disabilityPension && this.disabilityPension.explainedIncreases ? this.disabilityPension.explainedIncreases : null,
      explainedMedicalTreatment: this.disabilityPension && this.disabilityPension.explainedMedicalTreatment ? this.disabilityPension.explainedMedicalTreatment : null,
      explainedPreAuthorisation: this.disabilityPension && this.disabilityPension.explainedPreAuthorisation ? this.disabilityPension.explainedPreAuthorisation : null,
      explainedMaintenance: this.disabilityPension && this.disabilityPension.explainedMaintenance ? this.disabilityPension.explainedMaintenance : null,
      suppliedBooklet: this.disabilityPension && this.disabilityPension.suppliedBooklet ? this.disabilityPension.suppliedBooklet : null,
      suppliedContactDetails: this.disabilityPension && this.disabilityPension.suppliedContactDetails ? this.disabilityPension.suppliedContactDetails : null,
      explainedChronicMedication: this.disabilityPension && this.disabilityPension.explainedChronicMedication ? this.disabilityPension.explainedChronicMedication : null,
      explainedTransportation: this.disabilityPension && this.disabilityPension.explainedTransportation ? this.disabilityPension.explainedTransportation : null,
    });

  }

  readForm() {
    const formDetails = this.form.getRawValue();

    const disabilityPension = this.disabilityPension ? this.disabilityPension : new ClaimDisabilityPension();
    this.mode = disabilityPension.disabilityPensionId > 0 ? ModeEnum.Edit : ModeEnum.Default;

    disabilityPension.personEventId = this.selectedPersonEvent.personEventId;
    disabilityPension.interviewDate = formDetails.interviewDate ? formDetails.interviewDate : new Date();
    disabilityPension.isInjury = formDetails.isInjury ? formDetails.isInjury : false;
    disabilityPension.isDisease = formDetails.isDisease ? formDetails.isDisease : false;
    disabilityPension.occupationalName = formDetails.occupationalName;
    disabilityPension.isAmputee = formDetails.isAmputee === 'Yes' ? true : false;
    disabilityPension.isParaplegic = formDetails.isParaplegic === 'Yes' ? true : false;
    disabilityPension.isWheelchairIssued = formDetails.wheelchairIssuedDate ? true : false;
    disabilityPension.wheelchairIssuedDate = formDetails.wheelchairIssuedDate;
    disabilityPension.makeModel = formDetails.makeModel;
    disabilityPension.applianceReviewDate = formDetails.applianceReviewDate;
    disabilityPension.limbAmputated = formDetails.limbAmputated;
    disabilityPension.levelOfAmputation = formDetails.levelOfAmputation;
    disabilityPension.prostheticIssued = formDetails.prostheticIssued;
    disabilityPension.prostheticReviewDate = formDetails.prostheticReviewDate;
    disabilityPension.isCaa = formDetails.isCAA === 'Yes' ? true : false;
    disabilityPension.isFamilyAllowance = formDetails.isFamilyAllowance === 'Yes' ? true : false;
    disabilityPension.nameOfInstitution = formDetails.nameOfInstitution;
    disabilityPension.landlineNumberInstitution = formDetails.landlineNumberInstitution;
    disabilityPension.isDeleted = false;

    disabilityPension.createdBy = this.mode !== ModeEnum.Edit ? this.currentUser.email.toLowerCase() : disabilityPension.createdBy;
    disabilityPension.createdDate = this.mode !== ModeEnum.Edit ? new Date() : disabilityPension.createdDate;

    disabilityPension.modifiedBy = this.currentUser.email.toLowerCase();
    disabilityPension.modifiedDate = new Date();
    disabilityPension.chronicMedicinesAndSundries = formDetails.chronicMedicinesAndSundries;
    disabilityPension.certificationOfLifeYearlyAndSuspension = formDetails.certificationOfLifeYearlyAndSuspension;
    disabilityPension.informationBrochure = formDetails.informationBrochure;
    disabilityPension.explainedCalculation = formDetails.explainedCalculation ? formDetails.explainedCalculation : false;
    disabilityPension.explainedPayDates = formDetails.explainedPayDates ? formDetails.explainedPayDates : false;
    disabilityPension.explainedProofOfLife = formDetails.explainedProofOfLife ? formDetails.explainedProofOfLife : false;
    disabilityPension.explainedIncreases = formDetails.explainedIncreases ? formDetails.explainedIncreases : false;
    disabilityPension.explainedMedicalTreatment = formDetails.explainedMedicalTreatment ? formDetails.explainedMedicalTreatment : false;
    disabilityPension.explainedPreAuthorisation = formDetails.explainedPreAuthorisation ? formDetails.explainedPreAuthorisation : false;
    disabilityPension.explainedMaintenance = formDetails.explainedMaintenance ? formDetails.explainedMaintenance : false;
    disabilityPension.suppliedBooklet = formDetails.suppliedBooklet ? formDetails.suppliedBooklet : false;
    disabilityPension.suppliedContactDetails = formDetails.suppliedContactDetails ? formDetails.suppliedContactDetails : false;
    disabilityPension.explainedChronicMedication = formDetails.explainedChronicMedication ? formDetails.explainedChronicMedication : false;
    disabilityPension.explainedTransportation = formDetails.explainedTransportation ? formDetails.explainedTransportation : false;

    this.disabilityPension = disabilityPension;
  }

  disableFormControls() {
    this.form.controls['interviewDate'].disable();
    this.form.controls['chronicMedicinesAndSundries'].disable();
    this.form.controls['certificationOfLifeYearlyAndSuspension'].disable();
    this.form.controls['informationBrochure'].disable();

    this.form.controls['explainedPayDates'].disable();
    this.form.controls['explainedProofOfLife'].disable();
    this.form.controls['explainedMaintenance'].disable();
    this.form.controls['suppliedBooklet'].disable();
    this.form.controls['suppliedContactDetails'].disable();
    this.form.controls['explainedChronicMedication'].disable();
    this.form.controls['explainedTransportation'].disable();
  }

  enableFormControls() {
    this.form.controls['chronicMedicinesAndSundries'].enable();
    this.form.controls['certificationOfLifeYearlyAndSuspension'].enable();
    this.form.controls['informationBrochure'].disable();

    this.form.controls['explainedPayDates'].enable();
    this.form.controls['explainedProofOfLife'].enable();
    this.form.controls['explainedMaintenance'].enable();
    this.form.controls['suppliedBooklet'].enable();
    this.form.controls['suppliedContactDetails'].enable();
    this.form.controls['explainedChronicMedication'].enable();
    this.form.controls['explainedTransportation'].enable();
  }

  getLookups() {
    this.isLoading$.next(true);
    this.getData();
    this.setRolePlayers();
    this.getClaim();
    this.levelOfAmputationTypes = this.ToArray(LevelOfAmputationTypes);
  }

  getData() {
    this.getDisabilityPension();
  }

  getClaim() {
    this.personEvent.claims.forEach(result => {
      this.claim = result;
    });
  }

  setRolePlayers() {
    this.selectedPersonEvent = this.personEvent;
    this.mainInsuredRolePlayer = this.personEvent.rolePlayer;
    this.toRolePlayerId = this.personEvent?.insuredLifeId ? this.personEvent?.insuredLifeId : 0;
  }

  getDisabilityPension() {
    this.claimDisabilityService.getClaimDisabilityPensionByPersonEventId(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        this.disabilityPension = result;
        this.setForm();
        this.close();
      }
      this.isLoading$.next(false);
    });
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();
    this.mode === ModeEnum.Edit ? this.updateDisabilityPension() : this.addDisabilityPension();
  }

  addDisabilityPension() {
    this.claimDisabilityService.addClaimDisabilityPension(this.disabilityPension).subscribe(result => {
      if (result) {
        this.alertService.successToastr('Disability pension interview created successfully', 'success', true);
        this.getData();
      }
      this.isLoading$.next(false);
    });
  }

  updateDisabilityPension() {
    this.claimDisabilityService.updateClaimDisabilityPension(this.disabilityPension).subscribe(result => {
      if (result) {
        this.alertService.successToastr('Disability pension interview updated successfully', 'success', true);
        this.getData();
      }
      this.isLoading$.next(false);
    });
  }

  close() {
    this.form.disable();
    this.isReadOnly = true;
  }

  edit() {
    const isCcaPermission = this.userHasPermission(this.ccaPermission);
    this.form.enable();
    isCcaPermission ? this.disableFormControls() : this.enableFormControls();
    this.isReadOnly = false;
  }

  cancelBeneficiary() {
    this.showRelation = false;
    this.selectedPersonEvent.rolePlayer = this.mainInsuredRolePlayer;

    this.toggleBeneficiary();
  }

  addBeneficiary() {
    this.mode = ModeEnum.NewBeneficiary;
    this.isReadOnly = false;
    this.isWizard = false;

    this.toggleBeneficiary();
  }

  setBeneficiary($event: RolePlayer) {
    this.beneficiary = $event;

    this.showRelation = $event.rolePlayerId > 0 ? true : false;
    this.selectedTabIndex = 1;
  }

  setSelectedBeneficiary(event: {beneficiary: RolePlayer, mode: string, isReadOnly: boolean}) {
    this.beneficiary = event.beneficiary;
    this.selectedPersonEvent.rolePlayer = event.beneficiary;
    this.showRelation = event.beneficiary.rolePlayerId > 0 ? true : false;
    this.mode = event.mode == 'view' ? ModeEnum.View : ModeEnum.Edit;
    this.isReadOnly = event.isReadOnly;
    this.isWizard = false;

    this.toggleBeneficiary();
  }

  toggleBeneficiary() {
    this.toggle = !this.toggle;
  }

  formatLookup(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
