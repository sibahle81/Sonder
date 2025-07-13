import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { PMPMedHistoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/pmp-med-history';

@Component({
  selector: 'app-pmp-med-history-report',
  templateUrl: './pmp-med-history-report.component.html',
  styleUrls: ['./pmp-med-history-report.component.css']
})
export class PmpMedHistoryReportComponent implements OnInit {
  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();
  public form: UntypedFormGroup
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showSearchProgress = false;
  isLoadingCategories = false;
  
  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,) {
      
  }

  ngOnInit(): void {
    this.createForm();
  }

  onLoadLookups(): void {
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      levelofInjury: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      severity: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bladderemptyingtype: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      txtsBladderEmptyingProblems: [{ value: null, disabled: this.isReadOnly }],

      frequencybowelmovement:  [{ value: null, disabled: this.isReadOnly }],
      bowelRegime:  [{ value: null, disabled: this.isReadOnly }],
      constipation: [{ value: null, disabled: this.isReadOnly }],
      colostomy: [{ value: null, disabled: this.isReadOnly }], 

      muscleSpasm: [{ value: null, disabled: this.isReadOnly }], 
      muscleSpasmFrequency: [{ value: null, disabled: this.isReadOnly }],
      muscleSpasmType: [{ value: null, disabled: this.isReadOnly }],
      muscleSpasmDuration: [{ value: null, disabled: this.isReadOnly }], 

      muscleSpasmMedication: [{ value: null, disabled: this.isReadOnly }], 
      howmanymealsperday: [{ value: null, disabled: this.isReadOnly }],
      typeofFood: [{ value: null, disabled: this.isReadOnly }],
      howmuchfluidintakeperday: [{ value: null, disabled: this.isReadOnly }],     

      balancesDiet: [{ value: null, disabled: this.isReadOnly }], 
      allergies: [{ value: null, disabled: this.isReadOnly }],
      diabetes: [{ value: null, disabled: this.isReadOnly }],
      hypertension: [{ value: null, disabled: this.isReadOnly }], 

      previousBedsores: [{ value: null, disabled: this.isReadOnly }], 
      othermorbidities: [{ value: null, disabled: this.isReadOnly }],
      wheelchairStatus: [{ value: null, disabled: this.isReadOnly }],
      wheelchairIssuedDate: [{ value: null, disabled: this.isReadOnly }], 

      wheelchairSerialNumber: [{ value: null, disabled: this.isReadOnly }], 
      wheelchairRepairNeeded: [{ value: null, disabled: this.isReadOnly }],
      problemswiththeWheelchair: [{ value: null, disabled: this.isReadOnly }],
      alcoholUse: [{ value: null, disabled: this.isReadOnly }],     

      quantityofAlcoholperweek: [{ value: null, disabled: this.isReadOnly }], 
      smoker: [{ value: null, disabled: this.isReadOnly }],
      numberofcigarettesperday: [{ value: null, disabled: this.isReadOnly }],
      dagga: [{ value: null, disabled: this.isReadOnly }],     

      amountofdaggaperday: [{ value: null, disabled: this.isReadOnly }], 
      otherDrugs: [{ value: null, disabled: this.isReadOnly }],
      otherdrugsperday: [{ value: null, disabled: this.isReadOnly }],
      caregiver: [{ value: null, disabled: this.isReadOnly }],     

      relationshipCaregiver: [{ value: null, disabled: this.isReadOnly }], 
      ageCaregiver: [{ value: null, disabled: this.isReadOnly }],
      trainingCaregiver: [{ value: null, disabled: this.isReadOnly }],
      careGiverAltRecommendation: [{ value: null, disabled: this.isReadOnly }], 

      motorvehicleaccessed: [{ value: null, disabled: this.isReadOnly }], 
      rampsbuilt: [{ value: null, disabled: this.isReadOnly }],
      doorsrequirewidening: [{ value: null, disabled: this.isReadOnly }],
      noofDoorsrequirewidening: [{ value: null, disabled: this.isReadOnly }],

      toiletType: [{ value: null, disabled: this.isReadOnly }], 
      toiletaccessedwheelchair: [{ value: null, disabled: this.isReadOnly }],
      toiletAlterationsRequired: [{ value: null, disabled: this.isReadOnly }],
      cbobCommodeAndUrinal: [{ value: null, disabled: this.isReadOnly }, Validators.required], 

      cbosWaterSource: [{ value: null, disabled: this.isReadOnly }], 
      cbonDistanceOfWater: [{ value: null, disabled: this.isReadOnly }],
      cbobWaterAccessible: [{ value: null, disabled: this.isReadOnly }],
      txtsNoWaterAccessibleReason: [{ value: null, disabled: this.isReadOnly }],   

      cbobHasElectricity: [{ value: null, disabled: this.isReadOnly }],     
      cbosCookingMethod: [{ value: null, disabled: this.isReadOnly }], 
      txtsMedication: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      reviewedBy: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      levelofInjury: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.levelOfInjury? this.workItemMedicalReport.reportCategory.levelOfInjury : null,
      severity: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.severity? this.workItemMedicalReport.reportCategory.severity : null,
      bladderemptyingtype: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bladderEmptyingType? this.workItemMedicalReport.reportCategory.bladderEmptyingType : null,
      txtsBladderEmptyingProblems: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bladderEmptyingProblems? this.workItemMedicalReport.reportCategory.bladderEmptyingProblems : null,
      frequencybowelmovement: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bowelMovementFrequency? this.workItemMedicalReport.reportCategory.bowelMovementFrequency : null,
      bowelRegime: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bowelRegime? this.workItemMedicalReport.reportCategory.bowelRegime : null,

      constipation: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.constipation? "Yes" : "No", 
      colostomy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.colostomy? "Yes" : "No",
      muscleSpasm: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.muscleSpasm? "Yes" : "No",

      muscleSpasmFrequency: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.muscleSpasmFrequency? this.workItemMedicalReport.reportCategory.muscleSpasmFrequency : null,
      muscleSpasmType: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.muscleSpasmType? this.workItemMedicalReport.reportCategory.muscleSpasmType : null,
      muscleSpasmDuration: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.muscleSpasmDuration? this.workItemMedicalReport.reportCategory.muscleSpasmDuration : null,
      muscleSpasmMedication: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.muscleSpasmMedication? this.workItemMedicalReport.reportCategory.muscleSpasmMedication : null,
      howmanymealsperday: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.nutritionMeals? this.workItemMedicalReport.reportCategory.nutritionMeals : null,
      typeofFood: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.foodType? this.workItemMedicalReport.reportCategory.foodType : null,
      howmuchfluidintakeperday: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.nutritionFluid? this.workItemMedicalReport.reportCategory.nutritionFluid : null,

      balancesDiet: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.balancedDiet? "Yes" : "No",
      allergies: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.allergies? "Yes" : "No",      
      diabetes: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.diabetes? "Yes" : "No",
      hypertension: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.hypertension? "Yes" : "No",
      previousBedsores: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.previousBedsores? "Yes" : "No",

      othermorbidities: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherCoMorbidities? this.workItemMedicalReport.reportCategory.otherCoMorbidities : null,
      wheelchairStatus: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wheelchairStatus? this.workItemMedicalReport.reportCategory.wheelchairStatus : null,
      wheelchairIssuedDate: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wheelchairIssuedDate? this.workItemMedicalReport.reportCategory.wheelchairIssuedDate : null,
      wheelchairSerialNumber: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wheelchairSerialNumber? this.workItemMedicalReport.reportCategory.wheelchairSerialNumber : null,

      wheelchairRepairNeeded: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wheelchairRepairsNeeded? "Yes" : "No",
      problemswiththeWheelchair: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wheelchairProblems? this.workItemMedicalReport.reportCategory.wheelchairProblems : null,

      alcoholUse: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.alcoholUse? "Yes" : "No",
      quantityofAlcoholperweek: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.quantityAlcoholPerWeek? this.workItemMedicalReport.reportCategory.quantityAlcoholPerWeek : null,

      smoker: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.smoker? "Yes" : "No",
      numberofcigarettesperday: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.quantityCigarettes? this.workItemMedicalReport.reportCategory.quantityCigarettes : null,

      dagga: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.dagga? "Yes" : "No",
      amountofdaggaperday: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.quantityDagga? this.workItemMedicalReport.reportCategory.quantityDagga : null,
      otherDrugs: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherDrugs? "Yes" : "No",
      otherdrugsperday: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.quantityOtherDrugs? this.workItemMedicalReport.reportCategory.quantityOtherDrugs : null,

      caregiver: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.careGiver? this.workItemMedicalReport.reportCategory.careGiver : null,
      relationshipCaregiver: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.careGiverRelationship? this.workItemMedicalReport.reportCategory.careGiverRelationship : null,
      ageCaregiver: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.careGiverAge? this.workItemMedicalReport.reportCategory.careGiverAge : null,
      trainingCaregiver: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.careGiverAttendTraining? "Yes" : "No",
      careGiverAltRecommendation: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.careGiverAltRecommendation? this.workItemMedicalReport.reportCategory.careGiverAltRecommendation : null,

      motorvehicleaccessed: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.buildAccessByMotorVehicle? "Yes" : "No",
      rampsbuilt: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.needToBuildRamp? "Yes" : "No",
      doorsrequirewidening: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.doorsRequireWidening? "Yes" : "No",
      noofDoorsrequirewidening: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.noDoorsRequireWidening? this.workItemMedicalReport.reportCategory.noDoorsRequireWidening : null,
      
      toiletType: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.toiletType? this.workItemMedicalReport.reportCategory.toiletType : null,
      toiletaccessedwheelchair: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.accessToiletByWheelChair? "Yes" : "No",
      toiletAlterationsRequired: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.toiletAlterationsRequired? this.workItemMedicalReport.reportCategory.toiletAlterationsRequired : null,

      cbobCommodeAndUrinal: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.commodeAndUrinal? "Yes" : "No",
      cbosWaterSource: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.waterSource? this.workItemMedicalReport.reportCategory.waterSource : null,
      cbonDistanceOfWater: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.distanceOfWater? this.workItemMedicalReport.reportCategory.distanceOfWater : null,      
      cbobWaterAccessible: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.waterAccessible? "Yes" : "No",
      txtsNoWaterAccessibleReason: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.noWaterAccessibleReason? this.workItemMedicalReport.reportCategory.noWaterAccessibleReason : null, 

      cbobHasElectricity: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.waterAccessible? "Yes" : "No",
      cbosCookingMethod: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.cookingMethod? this.workItemMedicalReport.reportCategory.cookingMethod : null, 
      txtsMedication: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.medication? this.workItemMedicalReport.reportCategory.medication : null, 
      reviewedBy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.reviewedBy? this.workItemMedicalReport.reportCategory.reviewedBy : null
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new PMPMedHistoryDetail();
    }

    this.workItemMedicalReport.reportCategory.levelOfInjury = this.form.controls.levelofInjury.value;
    this.workItemMedicalReport.reportCategory.severity = this.form.controls.severity.value;
    this.workItemMedicalReport.reportCategory.bladderEmptyingType = this.form.controls.bladderemptyingtype.value;
    this.workItemMedicalReport.reportCategory.bladderEmptyingProblems = this.form.controls.txtsBladderEmptyingProblems.value;
    this.workItemMedicalReport.reportCategory.bowelMovementFrequency = this.form.controls.frequencybowelmovement.value;
    this.workItemMedicalReport.reportCategory.bowelRegime = this.form.controls.bowelRegime.value;

    this.workItemMedicalReport.reportCategory.constipation = this.form.controls.constipation.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.colostomy = this.form.controls.colostomy.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.muscleSpasm = this.form.controls.muscleSpasm.value === "Yes" ? true : false; 

    this.workItemMedicalReport.reportCategory.muscleSpasmFrequency = this.form.controls.muscleSpasmFrequency.value;
    this.workItemMedicalReport.reportCategory.muscleSpasmType = this.form.controls.muscleSpasmType.value;
    this.workItemMedicalReport.reportCategory.muscleSpasmDuration = this.form.controls.muscleSpasmDuration.value;
    this.workItemMedicalReport.reportCategory.muscleSpasmMedication = this.form.controls.muscleSpasmMedication.value;
    this.workItemMedicalReport.reportCategory.nutritionMeals = this.form.controls.howmanymealsperday.value;
    this.workItemMedicalReport.reportCategory.foodType = this.form.controls.typeofFood.value;
    this.workItemMedicalReport.reportCategory.nutritionFluid = this.form.controls.howmuchfluidintakeperday.value;
    
    this.workItemMedicalReport.reportCategory.balancedDiet = this.form.controls.balancesDiet.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.allergies = this.form.controls.allergies.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.diabetes = this.form.controls.diabetes.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.hypertension = this.form.controls.hypertension.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.previousBedsores = this.form.controls.previousBedsores.value === "Yes" ? true : false;

    this.workItemMedicalReport.reportCategory.otherCoMorbidities = this.form.controls.othermorbidities.value;
    this.workItemMedicalReport.reportCategory.wheelchairStatus = this.form.controls.wheelchairStatus.value;
    this.workItemMedicalReport.reportCategory.wheelchairIssuedDate = this.form.controls.wheelchairIssuedDate.value;
    this.workItemMedicalReport.reportCategory.wheelchairSerialNumber = this.form.controls.wheelchairSerialNumber.value;

    this.workItemMedicalReport.reportCategory.wheelchairRepairsNeeded = this.form.controls.wheelchairRepairNeeded.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.wheelchairProblems = this.form.controls.problemswiththeWheelchair.value;

    this.workItemMedicalReport.reportCategory.alcoholUse = this.form.controls.alcoholUse.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.quantityAlcoholPerWeek = this.form.controls.quantityofAlcoholperweek.value;

    this.workItemMedicalReport.reportCategory.smoker = this.form.controls.smoker.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.quantityCigarettes = this.form.controls.numberofcigarettesperday.value;

    this.workItemMedicalReport.reportCategory.dagga = this.form.controls.dagga.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.quantityDagga = this.form.controls.amountofdaggaperday.value;
    this.workItemMedicalReport.reportCategory.otherDrugs = this.form.controls.otherDrugs.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.quantityOtherDrugs = this.form.controls.otherdrugsperday.value;

    this.workItemMedicalReport.reportCategory.careGiver = this.form.controls.caregiver.value;
    this.workItemMedicalReport.reportCategory.careGiverRelationship = this.form.controls.relationshipCaregiver.value;
    this.workItemMedicalReport.reportCategory.careGiverAge = this.form.controls.ageCaregiver.value;
    this.workItemMedicalReport.reportCategory.careGiverAttendTraining = this.form.controls.trainingCaregiver.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.careGiverAltRecommendation = this.form.controls.careGiverAltRecommendation.value;

    this.workItemMedicalReport.reportCategory.buildAccessByMotorVehicle = this.form.controls.motorvehicleaccessed.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.needToBuildRamp = this.form.controls.rampsbuilt.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.doorsRequireWidening = this.form.controls.doorsrequirewidening.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.noDoorsRequireWidening = this.form.controls.noofDoorsrequirewidening.value;

    this.workItemMedicalReport.reportCategory.toiletType = this.form.controls.toiletType.value;
    this.workItemMedicalReport.reportCategory.accessToiletByWheelChair = this.form.controls.toiletaccessedwheelchair.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.toiletAlterationsRequired = this.form.controls.toiletAlterationsRequired.value;

    this.workItemMedicalReport.reportCategory.commodeAndUrinal = this.form.controls.cbobCommodeAndUrinal.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.waterSource = this.form.controls.cbosWaterSource.value;
    this.workItemMedicalReport.reportCategory.distanceOfWater = this.form.controls.cbonDistanceOfWater.value;
    this.workItemMedicalReport.reportCategory.waterAccessible = this.form.controls.cbobWaterAccessible.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.noWaterAccessibleReason = this.form.controls.txtsNoWaterAccessibleReason.value;

    this.workItemMedicalReport.reportCategory.waterAccessible = this.form.controls.cbobHasElectricity.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.cookingMethod = this.form.controls.cbosCookingMethod.value;
    this.workItemMedicalReport.reportCategory.medication = this.form.controls.txtsMedication.value;
    this.workItemMedicalReport.reportCategory.reviewedBy = this.form.controls.reviewedBy.value;
  }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportCategoryData = JSON.stringify(this.workItemMedicalReport.reportCategory);
    this.isCompletedEmit.emit(true);
  }
  
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.form.get('GlassesNecessary').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Glasses Necessary is required`);
    }
    return validationResult;
  }
 
}