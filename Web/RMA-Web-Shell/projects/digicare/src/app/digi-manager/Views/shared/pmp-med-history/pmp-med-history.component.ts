import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-pmp-med-history',
  templateUrl: './pmp-med-history.component.html',
  styleUrls: ['./pmp-med-history.component.css']
})

export class PmpMedHistoryComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm>  implements OnInit {
  form: UntypedFormGroup;
  isLoadingCategories = false;
  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,) {
      super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.createForm();
  }
  onLoadLookups(): void {

  }
  populateForm(): void {
    if (this.model.medicalReportForm == undefined) { return; }
    const form = this.form.controls;
    // need to config Model data
    form.levelofInjury.setValue('')
    form.severity.setValue('')
    form.bladderemptyingtype.setValue('')
    form.txtsBladderEmptyingProblems.setValue('')
    form.frequencybowelmovement.setValue('')
    form.bowelRegime.setValue('')
    form.constipation.setValue('')
    form.colostomy.setValue('')
    form.muscleSpasm.setValue('')
    form.muscleSpasmFrequency.setValue('')
    form.muscleSpasmType.setValue('')
    form.muscleSpasmDuration.setValue('')
    form.muscleSpasmMedication.setValue('')
    form.howmanymealsperday.setValue('')
    form.typeofFood.setValue('')
    form.howmuchfluidintakeperday.setValue('')
    form.balancesDiet.setValue('')
    form.allergies.setValue('')
    form.diabetes.setValue('')
    form.hypertension.setValue('')
    form.previousBedsores.setValue('')
    form.othermorbidities.setValue('')
    form.wheelchairStatus.setValue('')
    form.wheelchairIssuedDate.setValue('')
    form.wheelchairSerialNumber.setValue('')
    form.wheelchairRepairNeeded.setValue('')
    form.problemswiththeWheelchair.setValue('')
    form.qlcoholUse.setValue('')
    form.quantityofAlcoholperweek.setValue('')
    form.smoker.setValue('')
    form.numberofcigarettesperday.setValue('')
    form.dagga.setValue('')
    form.amountofdaggaperday.setValue('')
    form.otherDrugs.setValue('')
    form.otherdrugsperday.setValue('')
    form.caregiver.setValue('')
    form.relationshipCaregiver.setValue('')
    form.ageCaregiver.setValue('')
    form.trainingCaregiver.setValue('')
    form.motorvehicleaccessed.setValue('')
    form.rampsbuilt.setValue('')
    form.doorsrequirewidening.setValue('')
    form.noofDoorsrequirewidening.setValue('')
    form.toiletAlterationsRequired.setValue('')
    form.toiletType.setValue('')
    form.toiletaccessedwheelchair.setValue('')
    form.cbobCommodeAndUrinal.setValue('')
    form.cbosWaterSource.setValue('')
    form.cbonDistanceOfWater.setValue('')
    form.cbobWaterAccessible.setValue('')
    form.txtsNoWaterAccessibleReason.setValue('')
    form.cbobHasElectricity.setValue('')
    form.cbosCookingMethod.setValue('')
    form.txtsMedication.setValue('')
    form.reviewedBy.setValue('')
  }

  populateModel(): void {}
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      levelofInjury:new UntypedFormControl({ value: ''}),
      severity:new UntypedFormControl({ value: ''}),
      bladderemptyingtype:new UntypedFormControl({ value: ''}),
      txtsBladderEmptyingProblems:new UntypedFormControl({ value: ''}),
      frequencybowelmovement:new UntypedFormControl({ value: ''}),
      bowelRegime:new UntypedFormControl({ value: ''}),
      constipation:new UntypedFormControl({ value: ''}),
      colostomy:new UntypedFormControl({ value: ''}),
      muscleSpasm:new UntypedFormControl({ value: ''}),
      muscleSpasmFrequency:new UntypedFormControl({ value: ''}),
      muscleSpasmType:new UntypedFormControl({ value: ''}),
      muscleSpasmDuration:new UntypedFormControl({ value: ''}),
      muscleSpasmMedication:new UntypedFormControl({ value: ''}),
      howmanymealsperday:new UntypedFormControl({ value: ''}),
      typeofFood:new UntypedFormControl({ value: ''}),
      howmuchfluidintakeperday:new UntypedFormControl({ value: ''}),
      balancesDiet:new UntypedFormControl({ value: ''}),
      allergies:new UntypedFormControl({ value: ''}),
      diabetes:new UntypedFormControl({ value: ''}),
      hypertension:new UntypedFormControl({ value: ''}),
      previousBedsores:new UntypedFormControl({ value: ''}),
      othermorbidities:new UntypedFormControl({ value: ''}),
      wheelchairStatus:new UntypedFormControl({ value: ''}),
      wheelchairIssuedDate:new UntypedFormControl({ value: ''}),
      wheelchairSerialNumber:new UntypedFormControl({ value: ''}),
      wheelchairRepairNeeded:new UntypedFormControl({ value: ''}),
      problemswiththeWheelchair:new UntypedFormControl({ value: ''}),
      alcoholUse:new UntypedFormControl({ value: ''}),
      quantityofAlcoholperweek:new UntypedFormControl({ value: ''}),
      smoker:new UntypedFormControl({ value: ''}),
      numberofcigarettesperday:new UntypedFormControl({ value: ''}),
      dagga:new UntypedFormControl({ value: ''}),
      amountofdaggaperday:new UntypedFormControl({ value: ''}),
      otherDrugs:new UntypedFormControl({ value: ''}),
      otherdrugsperday:new UntypedFormControl({ value: ''}),
      caregiver:new UntypedFormControl({ value: ''}),
      relationshipCaregiver:new UntypedFormControl({ value: ''}),
      ageCaregiver:new UntypedFormControl({ value: ''}),
      trainingCaregiver:new UntypedFormControl({ value: ''}),
      motorvehicleaccessed:new UntypedFormControl({ value: ''}),
      rampsbuilt:new UntypedFormControl({ value: ''}),
      doorsrequirewidening:new UntypedFormControl({ value: ''}),
      noofDoorsrequirewidening:new UntypedFormControl({ value: ''}),
      toiletAlterationsRequired:new UntypedFormControl({ value: ''}),
      toiletType:new UntypedFormControl({ value: ''}),
      toiletaccessedwheelchair:new UntypedFormControl({ value: ''}),
      cbobCommodeAndUrinal:new UntypedFormControl({ value: ''}),
      cbosWaterSource:new UntypedFormControl({ value: ''}),
      cbonDistanceOfWater:new UntypedFormControl({ value: ''}),
      cbobWaterAccessible:new UntypedFormControl({ value: ''}),
      txtsNoWaterAccessibleReason:new UntypedFormControl({ value: ''}),
      cbobHasElectricity:new UntypedFormControl({ value: ''}),
      cbosCookingMethod:new UntypedFormControl({ value: ''}),
      txtsMedication:new UntypedFormControl({ value: ''}),
      reviewedBy:new UntypedFormControl({ value: ''}),
      
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }

    if (!this.form.get('GlassesNecessary').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Glasses Necessary is required`);
    }
    return validationResult;
  }
 
}