import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ViewChild } from '@angular/core';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { isNullOrUndefined } from 'util';
import { PreAuthMotivationForClaimReopening } from 'projects/medicare/src/app/preauth-manager/models/preauth-motivation-for-claim-reopening';

@Component({
    selector: 'claim-reopening-form',
    templateUrl: './claim-reopening-form.component.html',
    styleUrls: ['./claim-reopening-form.component.css']
})
export class ClaimReopeningPreAuthComponent extends WizardDetailBaseComponent<PreAuthorisation> {
    healthCareProvider: HealthCareProvider;
    form: UntypedFormGroup;
    preAuthMotivationForClaimReopening = new PreAuthMotivationForClaimReopening();
    resetbtnShow = false;
    isClaimReopeningRequest = false;
    isEditView: boolean = false;
    
    @ViewChild('healthcareProviderSearch', { static: false }) private healthcareProviderSearch: HealthCareProviderSearchComponent;
    
    constructor(
        appEventsManager: AppEventsManager,
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        private readonly HealthcareProviderService: HealthcareProviderService,
        private readonly formBuilder: UntypedFormBuilder) {
        super(appEventsManager, authService, activatedRoute);
    }

    @ViewChild(HealthCareProviderSearchComponent, { static: false })
    private healthCareProviderSearchComponent: HealthCareProviderSearchComponent;

    ngOnInit() {
        this.createForm();
        if (this.model)
        {
            this.isClaimReopeningRequest = this.model.isClaimReopeningRequest;
        }
    }

    populateForm(): void {
        if (!this.model) return;
        if (this.model.isClaimReopeningRequest){
            this.isClaimReopeningRequest = true;
        }
        else {
          this.isClaimReopeningRequest = false;
        }
        if (!this.model.preAuthMotivationForClaimReopenings) return;
        if (this.model.preAuthMotivationForClaimReopenings.length == 0) return;
        
        const form = this.form.controls;
        const claimReopening = this.model.preAuthMotivationForClaimReopenings[0];  
        if (claimReopening.preAuthMotivationForClaimReopeningId > 0){
            this.isEditView = true;
        }
        this.isClaimReopeningRequest = this.model.isClaimReopeningRequest;
        if (new Date(claimReopening.admissionDate) > DateUtility.minDate())
            form.dateOfAdmission.setValue(claimReopening.admissionDate);
        if (new Date(claimReopening.procedureDate) > DateUtility.minDate())
            form.dateOfService.setValue(claimReopening.procedureDate);
        if (claimReopening.injuryDetails)
            form.currentComplaints.setValue(claimReopening.injuryDetails);
        if (claimReopening.relationWithOldInjury)
            form.casualRelation.setValue(claimReopening.relationWithOldInjury);
        if (claimReopening.motivation)
            form.reopeningMotivation.setValue(claimReopening.motivation);
        if (claimReopening.comment)
            form.latestInvestigations.setValue(claimReopening.comment);

        if (!isNullOrUndefined(claimReopening.referringDoctorId) && claimReopening.referringDoctorId > 0) {
            this.HealthcareProviderService.getHealthCareProviderById(claimReopening.referringDoctorId).subscribe((result) => {
            if (result !== null && result.rolePlayerId > 0) {
                this.healthCareProvider = result;
            }
            });
        }
    }

    createForm(): void {
        if(!this.form){
            this.form = this.formBuilder.group({
                currentComplaints: new UntypedFormControl(),
                casualRelation: new UntypedFormControl(),
                dateOfAdmission: new UntypedFormControl(),
                dateOfService: new UntypedFormControl(),
                reopeningMotivation: new UntypedFormControl(),
                latestInvestigations: new UntypedFormControl(),
                isPatientVerified: new UntypedFormControl()
            });
         }
  }

    populateModel(): void {
      if (!this.model) return;
            const form = this.form as UntypedFormGroup;
            
            this.preAuthMotivationForClaimReopening.preAuthId = this.model.preAuthId;
            this.preAuthMotivationForClaimReopening.requestStatusId = 0;
            this.preAuthMotivationForClaimReopening.injuryDetails = form.controls.currentComplaints.value;
            this.preAuthMotivationForClaimReopening.relationWithOldInjury = form.controls.casualRelation.value;
            this.preAuthMotivationForClaimReopening.admissionDate = DateUtility.getDate(form.controls.dateOfAdmission.value);
            this.preAuthMotivationForClaimReopening.procedureDate = DateUtility.getDate(form.controls.dateOfService.value);
            this.preAuthMotivationForClaimReopening.motivation = form.controls.reopeningMotivation.value;
            this.preAuthMotivationForClaimReopening.comment = form.controls.latestInvestigations.value;
            let currentUser = this.authService.getCurrentUser();
            this.preAuthMotivationForClaimReopening.submittedByUser = currentUser.email;
            this.preAuthMotivationForClaimReopening.submittedDate = DateUtility.getDate(new Date());

            if (this.model.preAuthMotivationForClaimReopenings && this.model.preAuthMotivationForClaimReopenings.length > 0){
                this.preAuthMotivationForClaimReopening.preAuthMotivationForClaimReopeningId = this.model.preAuthMotivationForClaimReopenings[0].preAuthMotivationForClaimReopeningId;
            }

      if (this.model.preAuthMotivationForClaimReopenings !== undefined){
                let claimReopening = [];
                claimReopening.push(this.preAuthMotivationForClaimReopening); 
                this.model.preAuthMotivationForClaimReopenings = claimReopening;
            }
            else if (this.model.isClaimReopeningRequest){
                this.model.preAuthMotivationForClaimReopenings = [];
                this.model.preAuthMotivationForClaimReopenings.push(this.preAuthMotivationForClaimReopening);
            }
    }

    onLoadLookups(): void {
    }

    healthCareProviderChangedFunction(valueEmitted) {
        this.healthCareProvider = valueEmitted as HealthCareProvider;
    }

    onHealthCareProviderChanged(event: any){
        this.preAuthMotivationForClaimReopening.referringDoctorId = event.rolePlayerId;
       
        //get lastest Health Care Provider details
        if(!isNullOrUndefined(event.rolePlayerId) && event.rolePlayerId > 0){
            this.HealthcareProviderService.getHealthCareProviderById(event.rolePlayerId).subscribe((result) => {
                if (result !== null && result.rolePlayerId > 0) {
                    this.healthCareProvider = result;
                }
            });
        }
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        if(this.isClaimReopeningRequest){
            ReportFormValidationUtility.FieldRequired('currentComplaints', 'Current Complaints', this.form, validationResult);
            ReportFormValidationUtility.FieldRequired('casualRelation', 'Casual relation between current complaint and original injury', this.form, validationResult);
            ReportFormValidationUtility.FieldRequired('dateOfService', 'Date Of Service/Procedure', this.form, validationResult);
            ReportFormValidationUtility.FieldRequired('reopeningMotivation', 'Claim Re-opening Motivation', this.form, validationResult);
            ReportFormValidationUtility.FieldRequired('latestInvestigations', 'Latest Investigations', this.form, validationResult);
        }

        return validationResult;
    }

    resetForm(): void {
        if (!isNullOrUndefined(this.healthcareProviderSearch)) {
            this.form.reset();
            this.healthcareProviderSearch.form.reset();
        }
    }
}
