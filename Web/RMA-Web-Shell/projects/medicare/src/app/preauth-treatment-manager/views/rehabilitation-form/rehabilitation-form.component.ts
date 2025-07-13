import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { UntypedFormBuilder, UntypedFormControl,  UntypedFormGroup } from '@angular/forms';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PreAuthRehabilitation } from 'projects/medicare/src/app/preauth-manager/models/rehabilitation';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';

 @Component({
  selector: 'app-rehabilitation-form',
  templateUrl: './rehabilitation-form.component.html',
  styleUrls: ['./rehabilitation-form.component.css'],
})
export class RehabilitationFormComponent extends WizardDetailBaseComponent<PreAuthorisation> {
  isInternalUser: boolean = true;
  isDuplicatePreAuth: boolean = false;
  authType: string;
  form: UntypedFormGroup;
  rehabilitationList = [];
  rehabilitationGoalList = [];
  @ViewChild('healthCareProviderSearchComponent', { static: true }) private healthCareProviderSearchComponent;
  currentUrl = this.activatedRoute.snapshot.params.type;
  healthCareProvider: HealthCareProvider;
  telephone_number: string = '';
  isRehabilitationRequest = false;
  isEditView: boolean = false;
  preAuthRehabilitation = new PreAuthRehabilitation();

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    private readonly HealthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService) {
    super(appEventsManager, authService, activatedRoute);
  }
  /* #region initialisation  */
  ngOnInit() {
    this.createForm();
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    FormValidation.markFormTouched(this.form);
    if(this.model)
      {
          this.isRehabilitationRequest = this.model.isRehabilitationRequest;
      }
  }

  onChange(): void {
    this.populateModel();
  }

  createForm(): void {
    if (this.form == undefined) {
      this.form = this.formBuilder.group({
        consultationDate: new UntypedFormControl(),
        therapistName: new UntypedFormControl(),
        frequencyOfTreament: new UntypedFormControl(),
        overallExpectedTreatmentDuration: new UntypedFormControl(),
        numberOfTreatmentSessionRequested: new UntypedFormControl(),
        rehabilitationGoals: new UntypedFormControl(),
        telephoneNumber: new UntypedFormControl()
      });
    }
  }

  onLoadLookups(): void {

  }

  ngAfterViewInit(): void {

  }

  ngAfterContentInit(): void {
  }

  populateModel(): void {
    if (!this.model) return;    
    const form = this.form.getRawValue();
    this.preAuthRehabilitation.initialConsultationDate = DateUtility.getDate(form.consultationDate);
    this.preAuthRehabilitation.therapistName = form.therapistName;
    this.preAuthRehabilitation.treatmentFrequency = form.frequencyOfTreament;
    this.preAuthRehabilitation.treatmentDuration = form.overallExpectedTreatmentDuration;
    this.preAuthRehabilitation.treatmentSessionCount = form.numberOfTreatmentSessionRequested;
    this.preAuthRehabilitation.rehabilitationGoal = this.rehabilitationGoalList.join(',');
    if(this.model.preAuthRehabilitations && this.model.preAuthRehabilitations.length > 0){
    this.preAuthRehabilitation.preAuthRehabilitationId = this.model.preAuthRehabilitations[0].preAuthRehabilitationId;
    }
    this.rehabilitationList = [];   
    if(this.model.isRehabilitationRequest){
      this.rehabilitationList.push(this.preAuthRehabilitation); 
      this.model.isRehabilitationRequest = true;
    }else{
      this.model.isRehabilitationRequest = false;
    }
    this.model.preAuthRehabilitations = this.rehabilitationList;    
  }

  populateForm(): void {
    if (!this.model) return;
    if(this.model.isRehabilitationRequest){
       this.isRehabilitationRequest = true;
    }else{
      this.isRehabilitationRequest = false;
    }
    if (!this.model.preAuthRehabilitations) return;
    if (this.model.preAuthRehabilitations.length == 0) return;
    const form = this.form.controls;
    const rehabilitation = this.model.preAuthRehabilitations[0];
    this.isRehabilitationRequest = this.model.isRehabilitationRequest;
    if(rehabilitation.preAuthRehabilitationId > 0){
      this.isEditView = true;
    }
    if (new Date(rehabilitation.initialConsultationDate) > DateUtility.minDate())
      form.consultationDate.setValue(rehabilitation.initialConsultationDate);
    if(rehabilitation.therapistName)
      form.therapistName.setValue(rehabilitation.therapistName);
    if(rehabilitation.treatmentFrequency)
      form.frequencyOfTreament.setValue(rehabilitation.treatmentFrequency);
    if(rehabilitation.treatmentDuration)
      form.overallExpectedTreatmentDuration.setValue(rehabilitation.treatmentDuration);
    if(rehabilitation.treatmentSessionCount)
      form.numberOfTreatmentSessionRequested.setValue(rehabilitation.treatmentSessionCount);
    if(rehabilitation.rehabilitationGoal)
      this.rehabilitationGoalList = rehabilitation.rehabilitationGoal.split(',');
      
    if(!isNullOrUndefined(rehabilitation.referringDoctorId) && rehabilitation.referringDoctorId > 0){
      this.telephone_number = rehabilitation.referringDoctorContact;
        this.HealthcareProviderService.getHealthCareProviderById(rehabilitation.referringDoctorId).subscribe((result) => {
          if (result !== null && result.rolePlayerId > 0) {
            this.healthCareProvider = result;
          }
        });
    }
  }


  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null && this.model.isRehabilitationRequest) {
      
      ReportFormValidationUtility.FieldRequired('consultationDate', 'Consultation date ', this.form, validationResult);
      DateCompareValidator.compareDates(this.form.controls.consultationDate.value, new Date(), 'Consultation date cannot be future date', validationResult);
      ReportFormValidationUtility.FieldRequired('therapistName', 'Therapist Name', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('frequencyOfTreament', 'Frequency Of Treament', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('overallExpectedTreatmentDuration', 'Overall Expected Treatment Duration', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('numberOfTreatmentSessionRequested', 'Number Of Treatment Session Requested', this.form, validationResult);
      if(this.rehabilitationGoalList.length == 0)
        ReportFormValidationUtility.FieldRequired('rehabilitationGoals', 'Rehabilitation Goals', this.form, validationResult);
      if(!this.model.preAuthRehabilitations[0].referringDoctorContact && !this.isEditView)
        ReportFormValidationUtility.FieldRequired('telephoneNumber', 'Telephone Number', this.form, validationResult);
      
    }
    return validationResult;

  }

  resetForm(): void {
    this.form.reset();
    this.healthCareProviderSearchComponent.reset();
  }

  onHealthCareProviderChanged(event: any){
    this.preAuthRehabilitation.referringDoctorId = event.rolePlayerId;
    //get lastest Health Care Provider details
    if(!isNullOrUndefined(event.rolePlayerId) && event.rolePlayerId > 0){
        this.HealthcareProviderService.getHealthCareProviderById(event.rolePlayerId).subscribe((result) => {
          if (result !== null && result.rolePlayerId > 0) {
            this.healthCareProvider = result;
          }
        });
    }
  }

  onHealthCareProviderTelephoneNoChanged(event: any){
    this.preAuthRehabilitation.referringDoctorContact = event;
    this.telephone_number = event;
  }

  addRehabilitationGoal(){
    const rehahilitationGoal = this.form.controls.rehabilitationGoals.getRawValue();
    if(rehahilitationGoal){
    this.form.controls.rehabilitationGoals.setValue('');
    this.rehabilitationGoalList.push(rehahilitationGoal);
    }
  }

  removeRehabilitationGoal(item: string, index: number){
    this.rehabilitationGoalList.splice(index,1);
  }

}
