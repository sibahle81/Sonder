    import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
    import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
    import { ActivatedRoute } from '@angular/router';
    import { DatePipe } from '@angular/common';
    import { BehaviorSubject } from 'rxjs';

    import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
    import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
    import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
    import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
    import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
    import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
    import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

    import { MedicalReportStatusEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-status-enum';

    @Component({
    selector: 'app-report-declaration',
    templateUrl: './report-declaration.component.html',
    styleUrls: ['./report-declaration.component.css']
    })
    export class ReportDeclarationComponent implements OnInit {

    @Input() workItemMedicalReport: WorkItemMedicalReport;
    @Input() isReadOnly = false;
    @Input() healthCareProviderId: number = 0;

    @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

    public form: UntypedFormGroup
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    showSearchProgress = false
    today = new Date();
    disabled: boolean = true;
    tenant: Tenant;
    userHealthCareProviders: UserHealthCareProvider[];
    disablePracticeNumber = false;
    isAccident: boolean = true;
    isInternalUser: boolean = false;
    

    constructor(appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly userService: UserService,
        private readonly datePipe: DatePipe,
        protected readonly authService: AuthService,
        private readonly medicalFormService: MedicalFormService,
        private readonly healthCareProviderService: HealthcareProviderService,
        private readonly alertService: AlertService,
        private readonly digiCareService: DigiCareService) { }

    ngOnInit(): void {
        this.createForm();
        var currentUser = this.authService.getCurrentUser();
        this.isInternalUser = currentUser.isInternalUser;        
    }

    ngOnChange(): void{
        if (this.workItemMedicalReport) {
            this.createForm();
            }
    }
    
    createForm(): void {
    
        if (this.form) { return; }
    
        this.form = this.formBuilder.group({  
            healthcareProviderPracticeNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            healthcareProviderName: [{ value: null, disabled: true }],
            reportDate: [{ value: null, disabled: true }],
            isDeclarationAccepted: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            healthcareProviderId: [{ value: null, disabled: true }]
        });

        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
            this.setForm();
        }
    }

    setForm() {
        this.form.patchValue({
            healthcareProviderPracticeNumber: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.healthcareProviderPracticeNumber? this.workItemMedicalReport.medicalReport.healthcareProviderPracticeNumber : null,
            healthcareProviderName: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.healthcareProviderName? this.workItemMedicalReport.medicalReport.healthcareProviderName : null,
            healthcareProviderId: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.healthcareProviderId? this.workItemMedicalReport.medicalReport.healthcareProviderId : null,  
            reportDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.reportDate ? this.datePipe.transform(this.workItemMedicalReport.medicalReport.reportDate, 'yyyy-MM-dd'): this.datePipe.transform(this.today, 'yyyy-MM-dd'),    
            isDeclarationAccepted: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.isDeclarationAccepted === true ? true : false     
                
        });

        this.setHealthCareProvider();
    }

    readForm() {
        if (!this.workItemMedicalReport.medicalReport) {
            this.workItemMedicalReport.medicalReport = new MedicalReportForm();
        }
    
        this.workItemMedicalReport.medicalReport.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value;
        this.workItemMedicalReport.medicalReport.healthcareProviderName = this.form.controls.healthcareProviderName.value;
        this.workItemMedicalReport.medicalReport.healthcareProviderId = this.form.controls.healthcareProviderId.value;
        this.workItemMedicalReport.medicalReport.reportDate = this.form.controls.reportDate.value;
        this.workItemMedicalReport.medicalReport.isDeclarationAccepted = this.form.controls.isDeclarationAccepted.value;
        this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.MemberSubmit;
    }
    
    save() {
        this.readForm();   
        this.isCompletedEmit.emit(true);
    }

    setHealthCareProvider(){
        if (!this.isInternalUser && this.healthCareProviderId && this.healthCareProviderId > 0) {
            const practiceNumber = this.healthCareProviderId.toString();
            this.getHealthCareProvider(practiceNumber);
          }
    }
        
    searchHealthCareProvider(){
        const practiceNumber = this.form.controls.healthcareProviderPracticeNumber.value as string;
        this.getHealthCareProvider(practiceNumber);
    }

    getHealthCareProvider(practiceNumber){        
        this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
            if (healthCareProvider) {
            this.form.patchValue({
                healthcareProviderPracticeNumber: healthCareProvider.practiceNumber,
                healthcareProviderName: healthCareProvider.name,
                healthcareProviderId: healthCareProvider.rolePlayerId,                  
            });
            }
            else {
            this.alertService.error("Practice not found.")
            }
        });
    }
    
    getMedicalServiceProvider(event: any) {
        if (event instanceof KeyboardEvent && event.key !== 'Enter') {
            return;
        }
    
        if (String.isNullOrEmpty(this.form.controls.healthcareProviderPracticeNumber.value)){
            return;
        }
    
        const practiceNumber = this.form.controls.healthcareProviderPracticeNumber.value as string;
        this.showSearchProgress = true;
        this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
            if (healthCareProvider) {
            this.form.patchValue({
                healthcareProviderPracticeNumber: healthCareProvider.practiceNumber,
                healthcareProviderName: healthCareProvider.name,
                healthcareProviderId: healthCareProvider.rolePlayerId,                  
            });
            }
            else {
            this.alertService.error("Practice not found.")
            }
    
            this.showSearchProgress = false;
        });
    }

    getUserHealthCareProviders(): void {
        const user = this.authService.getCurrentUser();
        this.userService.getUserHealthCareProviders(user.email).subscribe(
            userHealthCareProviders => {
    
            if (userHealthCareProviders) {
    
                if (userHealthCareProviders.length == 1)
                this.setHealthCareProviderDetails(userHealthCareProviders[0]);
                else
                this.userHealthCareProviders = userHealthCareProviders;
            }
            }
        );
    }

    selected($event: any) {
        if ($event && $event.value) {
            this.setHealthCareProviderDetails($event.value);
        }
    }

    setHealthCareProviderDetails(userHealthCareProvider: UserHealthCareProvider) {

        this.form.patchValue({
            healthcareProviderPracticeNumber: userHealthCareProvider.practiceNumber,
            healthcareProviderName: userHealthCareProvider.name,
            healthcareProviderId: userHealthCareProvider.compCareMSPId
        });
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        if (this.form == null) return;
    
        if (!this.form.get("isDeclarationAccepted").value) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(`Declaration not accepted`);
        }
    
        if (!this.form.get("healthcareProviderPracticeNumber").value) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(`Healthcare provider's practice number is required`);
        }
        return validationResult;
    } 

    isDeclarationTicked() : boolean{
            if (this.form == null) return false;

            if (this.form.get("isDeclarationAccepted").value === true) 
                return true 
            else return false
    }
    }
