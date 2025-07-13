import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';


@Component({
  selector: 'app-home-visit-report',
  templateUrl: './home-visit-report.component.html',
  styleUrls: ['./home-visit-report.component.css']
})


export class HomeVisitReportComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm>  implements OnInit {
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
      form.pain.setValue('')
      form.painDescription.setValue('')
      form.skinblister.setValue('')
      form.sizeofBlister.setValue('')
      form.colourofskin.setValue('')
      form.txtsOtherSymptoms5.setValue('')
      form.heightinmeters.setValue('')
      form.weightinkilograms.setValue('')
      form.bMI.setValue('')
      form.waistcircumference.setValue('')
      form.pulseBPM.setValue('')
      form.bloodPressure.setValue('')
      form.hasPressureSores.setValue('')
      form.pressureSoresElbowSkin.setValue('')
      form.pressureSoresKneesSkin.setValue('')
      form.pressureSoresBackSkin.setValue('')
      form.pressureSoresSacralSkin.setValue('')
      form.otherPressureSores.setValue('')
      form.otherPhysicalFeatures.setValue('')
      form.respirationinbreathperminute.setValue('')
      form.cynanosis.setValue('')
      form.cynanosisDescription.setValue('')
      form.cyClubbingofFingersnanosis.setValue('')
      form.clubbingDescription.setValue('')
      form.auscultationofChest.setValue('')
      form.auscultationDescription.setValue('')
      form.cbobPalpableMassesOrHernia.setValue('')
      form.anyabdomenscars.setValue('')
      form.abdomenScarsWhere.setValue('')
      form.toneofabdomen.setValue('')
      form.tendernessofabdomen.setValue('')
      form.abdomenTendernessDescription.setValue('')
      form.isthescrotumnormal.setValue('')
      form.scrotumNormalDescription.setValue('')
      form.hydroceleofScrotum.setValue('')
      form.genitalsScrotumHydroceleDescription.setValue('')
      form.phimosis.setValue('')
      form.phimosisDescription.setValue('')
      form.othersGenitalsOtherAbnomalities.setValue('')
      form.urinarydipstix.setValue('')
      form.urinecolour.setValue('')
      form.urineodour.setValue('')
      form.actionplanresponse.setValue('')
      form.actiontakenresponse.setValue('')
      form.toiletAlterationsRequired.setValue('')
      form.toiletType.setValue('')
      form.toiletaccessedwheelchair.setValue('')
      form.cbobCommodeAndUrinal.setValue('')
      form.cbosWaterSource.setValue('')
      form.reviewedBy.setValue('')
    
  }

  populateModel(): void {}
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      pain:new UntypedFormControl({ value: ''}),
      painDescription:new UntypedFormControl({ value: ''}),
      skinblister:new UntypedFormControl({ value: ''}),
      sizeofBlister:new UntypedFormControl({ value: ''}),
      colourofskin:new UntypedFormControl({ value: ''}),
      txtsOtherSymptoms5:new UntypedFormControl({ value: ''}),
      heightinmeters:new UntypedFormControl({ value: ''}),
      weightinkilograms:new UntypedFormControl({ value: ''}),
      bMI:new UntypedFormControl({ value: ''}),
      waistcircumference:new UntypedFormControl({ value: ''}),
      pulseBPM:new UntypedFormControl({ value: ''}),
      bloodPressure:new UntypedFormControl({ value: ''}),
      hasPressureSores:new UntypedFormControl({ value: ''}),
      pressureSoresElbowSkin:new UntypedFormControl({ value: ''}),
      pressureSoresKneesSkin:new UntypedFormControl({ value: ''}),
      pressureSoresBackSkin:new UntypedFormControl({ value: ''}),
      pressureSoresSacralSkin:new UntypedFormControl({ value: ''}),
      otherPressureSores:new UntypedFormControl({ value: ''}),
      otherPhysicalFeatures:new UntypedFormControl({ value: ''}),
      respirationinbreathperminute:new UntypedFormControl({ value: ''}),
      cynanosis:new UntypedFormControl({ value: ''}),
      cynanosisDescription:new UntypedFormControl({ value: ''}),
      cyClubbingofFingersnanosis:new UntypedFormControl({ value: ''}),
      clubbingDescription:new UntypedFormControl({ value: ''}),
      auscultationofChest:new UntypedFormControl({ value: ''}),
      auscultationDescription:new UntypedFormControl({ value: ''}),
      cbobPalpableMassesOrHernia:new UntypedFormControl({ value: ''}),
      anyabdomenscars:new UntypedFormControl({ value: ''}),
      abdomenScarsWhere:new UntypedFormControl({ value: ''}),
      toneofabdomen:new UntypedFormControl({ value: ''}),
      tendernessofabdomen:new UntypedFormControl({ value: ''}),
      abdomenTendernessDescription:new UntypedFormControl({ value: ''}),
      isthescrotumnormal:new UntypedFormControl({ value: ''}),
      scrotumNormalDescription:new UntypedFormControl({ value: ''}),
      hydroceleofScrotum:new UntypedFormControl({ value: ''}),
      genitalsScrotumHydroceleDescription:new UntypedFormControl({ value: ''}),
      phimosis:new UntypedFormControl({ value: ''}),
      phimosisDescription:new UntypedFormControl({ value: ''}),
      othersGenitalsOtherAbnomalities:new UntypedFormControl({ value: ''}),
      urinarydipstix:new UntypedFormControl({ value: ''}),
      urinecolour:new UntypedFormControl({ value: ''}),
      urineodour:new UntypedFormControl({ value: ''}),
      actionplanresponse:new UntypedFormControl({ value: ''}),
      actiontakenresponse:new UntypedFormControl({ value: ''}),
      toiletAlterationsRequired:new UntypedFormControl({ value: ''}),
      toiletType:new UntypedFormControl({ value: ''}),
      toiletaccessedwheelchair:new UntypedFormControl({ value: ''}),
      cbobCommodeAndUrinal:new UntypedFormControl({ value: ''}),
      cbosWaterSource:new UntypedFormControl({ value: ''}),
      reviewedBy:new UntypedFormControl({ value: ''})
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }

    if (!this.form.get('Pain').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Pain input is required`);
    }
    return validationResult;
  }
 
}