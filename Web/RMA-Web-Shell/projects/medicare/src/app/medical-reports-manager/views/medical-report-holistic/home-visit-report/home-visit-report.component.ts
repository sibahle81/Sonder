import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { HomeVisitReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/home-visit';

@Component({
  selector: 'app-home-visit-report',
  templateUrl: './home-visit-report.component.html',
  styleUrls: ['./home-visit-report.component.css']
})


export class HomeVisitReportComponent implements OnInit {

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
      pain: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      painDescription: [{ value: null, disabled: this.isReadOnly }],
      skinblister:  [{ value: null, disabled: this.isReadOnly }, Validators.required],
      sizeofBlister:  [{ value: null, disabled: this.isReadOnly }],

      colourofskin: [{ value: null, disabled: this.isReadOnly }],
      txtsOtherSymptoms: [{ value: null, disabled: this.isReadOnly }],     
      heightinmeters: [{ value: null, disabled: this.isReadOnly }],
      weightinkilograms: [{ value: null, disabled: this.isReadOnly }],

      bMI: [{ value: null, disabled: this.isReadOnly }],
      waistcircumference: [{ value: null, disabled: this.isReadOnly }],
      pulseBPM: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bloodPressure: [{ value: null, disabled: this.isReadOnly }, Validators.required],

      hasPressureSores: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      pressureSoresElbowSkin: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      pressureSoresKneesSkin: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      pressureSoresBackSkin: [{ value: null, disabled: this.isReadOnly }, Validators.required],

      pressureSoresSacralSkin: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      otherPressureSores: [{ value: null, disabled: this.isReadOnly }],
      otherPhysicalFeatures: [{ value: null, disabled: this.isReadOnly }],     
      respirationinbreathperminute: [{ value: null, disabled: this.isReadOnly }],

      cynanosis: [{ value: null, disabled: this.isReadOnly }],
      cynanosisDescription: [{ value: null, disabled: this.isReadOnly }],
      cyClubbingofFingersnanosis: [{ value: null, disabled: this.isReadOnly }],     
      clubbingDescription: [{ value: null, disabled: this.isReadOnly }],

      auscultationofChest: [{ value: null, disabled: this.isReadOnly }],
      auscultationDescription: [{ value: null, disabled: this.isReadOnly }],
      cbobPalpableMassesOrHernia: [{ value: null, disabled: this.isReadOnly }],     
      anyabdomenscars: [{ value: null, disabled: this.isReadOnly }],

      abdomenScarsWhere: [{ value: null, disabled: this.isReadOnly }],
      toneofabdomen: [{ value: null, disabled: this.isReadOnly }],
      tendernessofabdomen: [{ value: null, disabled: this.isReadOnly }],     
      abdomenTendernessDescription: [{ value: null, disabled: this.isReadOnly }],

      isthescrotumnormal: [{ value: null, disabled: this.isReadOnly }],
      scrotumNormalDescription: [{ value: null, disabled: this.isReadOnly }],
      hydroceleofScrotum: [{ value: null, disabled: this.isReadOnly }],     
      genitalsScrotumHydroceleDescription: [{ value: null, disabled: this.isReadOnly }],

      phimosis: [{ value: null, disabled: this.isReadOnly }],
      phimosisDescription: [{ value: null, disabled: this.isReadOnly }],
      othersGenitalsOtherAbnomalities: [{ value: null, disabled: this.isReadOnly }],     
      urinarydipstix: [{ value: null, disabled: this.isReadOnly }],

      urinecolour: [{ value: null, disabled: this.isReadOnly }],
      urineodour: [{ value: null, disabled: this.isReadOnly }],
      generalComment: [{ value: null, disabled: this.isReadOnly }, Validators.required],     
      actionplanresponse: [{ value: null, disabled: this.isReadOnly }, Validators.required],

      actiontakenresponse: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      reviewedBy: [{ value: null, disabled: this.isReadOnly }]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({ 
      pain: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.pain? "Yes" : "No",   
      painDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.painDescription? this.workItemMedicalReport.reportCategory.painDescription : null,
      skinblister: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.skinBlisterOrSore? "Yes" : "No", 
      sizeofBlister: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.blisterSize? this.workItemMedicalReport.reportCategory.blisterSize : null,

      colourofskin: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.skinColour? this.workItemMedicalReport.reportCategory.skinColour : null,  
      txtsOtherSymptoms: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherSymptoms? this.workItemMedicalReport.reportCategory.otherSymptoms : null,
      heightinmeters: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.heightInMeters? this.workItemMedicalReport.reportCategory.heightInMeters : null,   
      weightinkilograms: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.weightInKilograms? this.workItemMedicalReport.reportCategory.weightInKilograms : null,  
      bMI: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bodyMassIndex? this.workItemMedicalReport.reportCategory.bodyMassIndex : null,  
      waistcircumference: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.waistInCentimeters? this.workItemMedicalReport.reportCategory.waistInCentimeters : null, 
      pulseBPM: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.pulseInBeatsPerMinute? this.workItemMedicalReport.reportCategory.pulseInBeatsPerMinute : null,  
      bloodPressure: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bloodPressureInmmHg? this.workItemMedicalReport.reportCategory.bloodPressureInmmHg : null,  
      hasPressureSores: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.hasPressureSores? "Yes" : "No",

      pressureSoresElbowSkin: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.elbowsSkin? "Yes" : "No",  
      pressureSoresKneesSkin: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.kneesSkin? "Yes" : "No",
      pressureSoresBackSkin: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.backSkin? "Yes" : "No",   
      pressureSoresSacralSkin: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.sacralSkin? "Yes" : "No",  
      otherPressureSores: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherPressureSore? this.workItemMedicalReport.reportCategory.otherPressureSore : null,  
      otherPhysicalFeatures: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherPhysicalFeatures? this.workItemMedicalReport.reportCategory.otherPhysicalFeatures : null, 
      respirationinbreathperminute: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.respirationInBreathsPerMinute? this.workItemMedicalReport.reportCategory.respirationInBreathsPerMinute : null,  
      cynanosis: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.cynanosis? "Yes" : "No",

      cynanosisDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.cynanosisDescription? this.workItemMedicalReport.reportCategory.cynanosisDescription : null,  
      cyClubbingofFingersnanosis: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.fingerClubbing? "Yes" : "No",

      clubbingDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.fingerClubbingDescription? this.workItemMedicalReport.reportCategory.fingerClubbingDescription : null, 
      auscultationofChest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.chestAuscultation? this.workItemMedicalReport.reportCategory.chestAuscultation : null,  

      auscultationDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.chestAuscultationDescription? this.workItemMedicalReport.reportCategory.chestAuscultationDescription : null,  
      cbobPalpableMassesOrHernia: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.palpableMassesOrHernia? "Yes" : "No",
      anyabdomenscars: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.abdomenScars? "Yes" : "No",

      abdomenScarsWhere: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.abdomenScarsWhere? this.workItemMedicalReport.reportCategory.abdomenScarsWhere : null, 
      toneofabdomen: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.abdomenTone? this.workItemMedicalReport.reportCategory.abdomenTone : null,  
      tendernessofabdomen: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.abdomenTenderness? "Yes" : "No",
      abdomenTendernessDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.abdomenTendernessDescription? this.workItemMedicalReport.reportCategory.abdomenTendernessDescription : null,  

      isthescrotumnormal: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsScrotumNormal? "Yes" : "No",
      scrotumNormalDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsScrotumNormalDescription? this.workItemMedicalReport.reportCategory.genitalsScrotumNormalDescription : null,  
      hydroceleofScrotum: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsScrotumHydrocele? "Yes" : "No",
      genitalsScrotumHydroceleDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsScrotumHydroceleDescription? this.workItemMedicalReport.reportCategory.genitalsScrotumHydroceleDescription : null,  

      phimosis: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsPhimosis? "Yes" : "No",
      phimosisDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsPhimosisDescription? this.workItemMedicalReport.reportCategory.genitalsPhimosisDescription : null,  
      othersGenitalsOtherAbnomalities: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.genitalsOtherAbnomalities? this.workItemMedicalReport.reportCategory.genitalsOtherAbnomalities : null,  

      urinarydipstix: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.urinaryDipstix? this.workItemMedicalReport.reportCategory.urinaryDipstix : null,  
      urinecolour: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.urineColour? this.workItemMedicalReport.reportCategory.urineColour : null,  
      urineodour: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.urineOdour? this.workItemMedicalReport.reportCategory.urineOdour : null,  
      
      generalComment: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.homeVisitGeneralComment? this.workItemMedicalReport.reportCategory.homeVisitGeneralComment : null,  
      actionplanresponse: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.homeVisitActionPlan? this.workItemMedicalReport.reportCategory.homeVisitActionPlan : null,  
      actiontakenresponse: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.homeVisitActionTaken? this.workItemMedicalReport.reportCategory.homeVisitActionTaken : null,  
      reviewedBy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.reviewedBy? this.workItemMedicalReport.reportCategory.reviewedBy : null,  

      });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new HomeVisitReportDetail();
    }

    this.workItemMedicalReport.reportCategory.pain = this.form.controls.pain.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.painDescription = this.form.controls.painDescription.value;
    this.workItemMedicalReport.reportCategory.skinBlisterOrSore = this.form.controls.skinblister.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.blisterSize = this.form.controls.sizeofBlister.value;

    this.workItemMedicalReport.reportCategory.skinColour = this.form.controls.colourofskin.value;
    this.workItemMedicalReport.reportCategory.otherSymptoms = this.form.controls.txtsOtherSymptoms.value;
    this.workItemMedicalReport.reportCategory.heightInMeters = this.form.controls.heightinmeters.value;
    this.workItemMedicalReport.reportCategory.weightInKilograms = this.form.controls.weightinkilograms.value;
    this.workItemMedicalReport.reportCategory.bodyMassIndex = this.form.controls.bMI.value;
    this.workItemMedicalReport.reportCategory.waistInCentimeters = this.form.controls.waistcircumference.value;
    this.workItemMedicalReport.reportCategory.pulseInBeatsPerMinute = this.form.controls.pulseBPM.value;
    this.workItemMedicalReport.reportCategory.bloodPressureInmmHg = this.form.controls.bloodPressure.value;
    this.workItemMedicalReport.reportCategory.hasPressureSores = this.form.controls.hasPressureSores.value === "Yes" ? true : false;

    this.workItemMedicalReport.reportCategory.elbowsSkin = this.form.controls.pressureSoresElbowSkin.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.kneesSkin = this.form.controls.pressureSoresKneesSkin.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.backSkin = this.form.controls.pressureSoresBackSkin.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.sacralSkin = this.form.controls.pressureSoresSacralSkin.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.otherPressureSore = this.form.controls.otherPressureSores.value;
    this.workItemMedicalReport.reportCategory.otherPhysicalFeatures = this.form.controls.otherPhysicalFeatures.value;
    this.workItemMedicalReport.reportCategory.respirationInBreathsPerMinute = this.form.controls.respirationinbreathperminute.value;
    this.workItemMedicalReport.reportCategory.cynanosis = this.form.controls.cynanosis.value === "Yes" ? true : false;

    this.workItemMedicalReport.reportCategory.cynanosisDescription = this.form.controls.cynanosisDescription.value;
    this.workItemMedicalReport.reportCategory.fingerClubbing = this.form.controls.cyClubbingofFingersnanosis.value === "Yes" ? true : false;

    this.workItemMedicalReport.reportCategory.fingerClubbingDescription = this.form.controls.clubbingDescription.value;
    this.workItemMedicalReport.reportCategory.chestAuscultation = this.form.controls.auscultationofChest.value;

    this.workItemMedicalReport.reportCategory.chestAuscultationDescription = this.form.controls.auscultationDescription.value;
    this.workItemMedicalReport.reportCategory.palpableMassesOrHernia = this.form.controls.cbobPalpableMassesOrHernia.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.abdomenScars = this.form.controls.anyabdomenscars.value === "Yes" ? true : false;

    this.workItemMedicalReport.reportCategory.abdomenScarsWhere = this.form.controls.abdomenScarsWhere.value;
    this.workItemMedicalReport.reportCategory.abdomenTone = this.form.controls.toneofabdomen.value;
    this.workItemMedicalReport.reportCategory.abdomenTenderness = this.form.controls.tendernessofabdomen.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.abdomenTendernessDescription = this.form.controls.abdomenTendernessDescription.value;

    this.workItemMedicalReport.reportCategory.genitalsScrotumNormal = this.form.controls.isthescrotumnormal.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.genitalsScrotumNormalDescription = this.form.controls.scrotumNormalDescription.value;
    this.workItemMedicalReport.reportCategory.genitalsScrotumHydrocele = this.form.controls.hydroceleofScrotum.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.genitalsScrotumHydroceleDescription = this.form.controls.genitalsScrotumHydroceleDescription.value;

    this.workItemMedicalReport.reportCategory.genitalsPhimosis = this.form.controls.phimosis.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.genitalsPhimosisDescription = this.form.controls.phimosisDescription.value;
    this.workItemMedicalReport.reportCategory.genitalsOtherAbnomalities = this.form.controls.othersGenitalsOtherAbnomalities.value;

    this.workItemMedicalReport.reportCategory.urinaryDipstix = this.form.controls.urinarydipstix.value;
    this.workItemMedicalReport.reportCategory.urineColour = this.form.controls.urinecolour.value;
    this.workItemMedicalReport.reportCategory.urineOdour = this.form.controls.urineodour.value;

    this.workItemMedicalReport.reportCategory.homeVisitGeneralComment = this.form.controls.generalComment.value;
    this.workItemMedicalReport.reportCategory.homeVisitActionPlan = this.form.controls.actionplanresponse.value;
    this.workItemMedicalReport.reportCategory.homeVisitActionTaken = this.form.controls.actiontakenresponse.value;
    this.workItemMedicalReport.reportCategory.reviewedBy = this.form.controls.reviewedBy.value;
  }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportCategoryData = JSON.stringify(this.workItemMedicalReport.reportCategory);
    this.isCompletedEmit.emit(true);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.form.get('Pain').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Pain input is required`);
    }
    return validationResult;
  }
 
}