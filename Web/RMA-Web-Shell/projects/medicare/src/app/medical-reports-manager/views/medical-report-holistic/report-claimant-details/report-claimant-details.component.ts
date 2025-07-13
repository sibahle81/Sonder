import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';

import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { PersonEvent } from 'projects/digicare/src/app/digi-manager/models/shared/claim-search/claim-search-response';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import  DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';

import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { FirstMedicalReportForm} from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { ProgressDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-disease-medical-report-form';
import { FinalDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-disease-medical-report-form';

import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';
import { EyeInjuryReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/eye-injury';
import { HomeVisitReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/home-visit';
import { PhysioTherapyReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/physio-therapy';
import { PMPMedHistoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/pmp-med-history';
import { ProstheticReviewDetail } from 'projects/medicare/src/app/medical-reports-manager/models/prosthetic-review';
import { RadiologyReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/radiology-report';
import { UrologicalReviewDetail } from 'projects/medicare/src/app/medical-reports-manager/models/urological-review';

import { MedicalReportCategoryEnum } from 'projects/digicare/src/app/work-manager/models/enum/medical-report-category.enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';

@Component({
    selector: 'app-report-claimant-details',
    templateUrl: './report-claimant-details.component.html',
    styleUrls: ['./report-claimant-details.component.css']
})
export class ReportClaimantDetailsComponent implements OnInit {
    public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    public isSearching$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');
    public searchingMessage$: BehaviorSubject<string> = new BehaviorSubject('Searching claim, please wait ...');
    
    addPermission = 'Add WorkItem';
    editPermission = 'Edit WorkItem';
    viewPermission = 'View WorkItem';

    @Input() medicalReportId: number;
    @Input() claimId: number;
    @Input() healthCareProviderId: number;
    @Input() isReadOnly = false;
    @Input() isFromClaimView = false;

    @Output() workItemMedicalReportEmit: EventEmitter<WorkItemMedicalReport> = new EventEmitter();

    form: UntypedFormGroup;
    medicalReportTypes: any[];
    workItemTypes: WorkItemType[];
    selectedWorkType: WorkItemType;
    selectedWorkItemTypeId: number;
    medicalReportCategories: any;
    selectedReportCategory: any;
    personEvent: PersonEvent;
    disabled = true;
    claimNumberErrorMessage: string;
    tenant: Tenant;
    workItemMedicalReport = new WorkItemMedicalReport();
    personEventId: number = 0;
    eventCategoryId: number;
    event: EventModel;
    

    complate = WorkItemStateEnum.Complete;

    constructor(private readonly lookupService: LookupService,
                private readonly mediCarePreAuthService: MediCarePreAuthService,
                private readonly formBuilder: UntypedFormBuilder,
                private readonly alertService: AlertService,
                private readonly authorizationService: AuthService,
                private readonly userService: UserService,
                public datepipe: DatePipe,
                private readonly medicalFormService: MedicalFormService,
                private readonly claimCareService: ClaimCareService,
                private readonly rolePlayerService: RolePlayerService) {
            this.getMedicalReportTypes();
            this.getMedicalReportCategories();
            this.getCurrentTenant();
            this.createForm();
        }

        ngOnInit(): void {
            if(this.claimId && this.claimId > 0){
                this.getClaimDetails(this.claimId);
                }
        }

        ngOnChanges(changes: SimpleChanges): void {
            if (this.medicalReportId && this.medicalReportId > 0) {
                this.getMedicalReportForm(this.medicalReportId);
            } else {
                this.createForm();
            }
        }

        createForm(): void {
            this.form = this.formBuilder.group({
            reportCategoryId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            reportTypeId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            claimNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            firstName: [{ value: null, disabled: true }],
            lastName: [{ value: null, disabled: true }],
            dateOfBirth: [{ value: null, disabled: true }],
            fileRefNumber: [{ value: null, disabled: true }],
            eventDate: [{ value: null, disabled: true }],
            employerName: [{ value: null, disabled: true }],
            industryNumber: [{ value: null, disabled: true }],
            occupation: [{ value: null, disabled: true }],
            gender: [{ value: null, disabled: true }],
            cellNumber:  [{ value: null, disabled: this.isReadOnly }],
            dateOfConsultation: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            chkNextReviewDateApplicable: [{ value: null, disabled: this.isReadOnly }],
            dateOfNextReview: [{ value: null, disabled: this.isReadOnly }, Validators.required]
            });

            if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
                this.setForm();
            }
        }

        setForm() {
            this.form.patchValue({
                reportTypeId: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.reportTypeId? this.workItemMedicalReport.medicalReport.reportTypeId : null,
                reportCategoryId: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.reportCategoryId? this.workItemMedicalReport.medicalReport.reportCategoryId : null,
                claimNumber: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.claimReferenceNumber ? this.workItemMedicalReport.medicalReport.claimReferenceNumber: null,    
                firstName: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.name? this.workItemMedicalReport.medicalReport.name : null,
                lastName: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.surname? this.workItemMedicalReport.medicalReport.surname : null,

                dateOfBirth: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.dateOfBirth? this.workItemMedicalReport.medicalReport.dateOfBirth : null,
                fileRefNumber: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.claimReferenceNumber? this.workItemMedicalReport.medicalReport.claimReferenceNumber : null,
                eventDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.eventDate? this.workItemMedicalReport.medicalReport.eventDate : null,
                employerName: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.employerName? this.workItemMedicalReport.medicalReport.employerName : null,
                industryNumber: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.industryNumber? this.workItemMedicalReport.medicalReport.industryNumber : null,
                occupation: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.claimantOccupation? this.workItemMedicalReport.medicalReport.claimantOccupation  : null,
                gender: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.gender? this.workItemMedicalReport.medicalReport.gender : null,
                cellNumber: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.contactNumber? this.workItemMedicalReport.medicalReport.contactNumber  : null,
                dateOfConsultation: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.consultationDate? this.workItemMedicalReport.medicalReport.consultationDate : new Date(),
                chkNextReviewDateApplicable: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.nextReviewDate? 1 : 0,
                dateOfNextReview: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.nextReviewDate? this.workItemMedicalReport.medicalReport.nextReviewDate : null            
            });

            this.claimId = this.workItemMedicalReport.medicalReport.claimId;
            this.personEventId = this.workItemMedicalReport.medicalReport.personEventId;
            this.eventCategoryId = this.workItemMedicalReport.medicalReport.eventCategoryId;

            this.disableForm();
        }

        disableForm() {
            if (this.medicalReportId && this.medicalReportId > 0) {
                this.form.controls.reportTypeId.disable();
                this.form.controls.reportCategoryId.disable();
                this.form.controls.claimNumber.disable();
            }
        }

        getMedicalReportTypes(): void {
            this.loadingMessage$.next("loading medical report types...");
            this.lookupService.getMedicalReportTypes().subscribe(data => {
                this.medicalReportTypes = data;
            });
        }

        getMedicalReportCategories(): void {
            this.loadingMessage$.next("loading medical report categories...");
            this.lookupService.getMedicalReportCategories().subscribe(data => {
                this.medicalReportCategories = data;
            });
        }

        getCurrentTenant(): void {
            const user = this.authorizationService.getCurrentUser();
            this.loadingMessage$.next("loading tenant...");
            this.userService.getTenant(user.email).subscribe(tenant => {
                this.tenant = tenant;
                this.isLoading$.next(false);
            });
        }

        getMedicalReportForm(medicalReportId: number)
        {
            this.medicalFormService.getMedicalReportForm(medicalReportId).subscribe(medicalReportType => {
                this.workItemMedicalReport.reportType = medicalReportType;
                this.workItemMedicalReport.medicalReport = this.workItemMedicalReport.reportType.medicalReportForm; 
        
                this.setReportCategoryModelData();
                this.workItemMedicalReportEmit.emit(this.workItemMedicalReport);
                this.createForm();
                })
        }

        getClaimDetails(claimId: number) {
            this.searchingMessage$.next("getting claimant details...");
            this.isSearching$.next(true);
            this.claimCareService.GetClaim(claimId).subscribe(result => {
                this.searchByClaimReferenceNumber(result.claimReferenceNumber)        
            });    
        }

        searchByClaimReferenceNumber(claimReferenceNumber: string): void {
            if (claimReferenceNumber != '' && claimReferenceNumber.length > 6) {
                this.isSearching$.next(true); 

                this.mediCarePreAuthService.GetPersonEventIdByClaimReferenceNumber(btoa(claimReferenceNumber)).subscribe((PEVid) => {
                    this.personEventId = PEVid;
                    if(this.personEventId > 0) {
                        this.claimCareService.getPersonEventDetails(this.personEventId).subscribe(event => {
                            this.event = event;

                            if (this.event){
                                let employee = event.personEvents[0].rolePlayer.person;
                                
                                this.form.patchValue({
                                claimNumber: claimReferenceNumber,
                                claimId: event.personEvents[0].claims[0].claimId,
                                firstName: employee.firstName,
                                lastName: employee.surname,
                                dateOfBirth: employee.dateOfBirth,
                                gender: GenderEnum[employee.gender],
                                fileRefNumber: event.personEvents[0].personEventReferenceNumber,
                                eventDate: event.eventDate,
                                occupation: '',
                                personEventId: event.personEvents[0].personEventId
                                });
                    
                                this.claimId = event.personEvents[0].claims[0].claimId;
                                this.personEventId = event.personEvents[0].personEventId;
                                this.eventCategoryId = event.eventType;

                                this.searchingMessage$.next("getting employer details...");
                                this.rolePlayerService.getRolePlayer(event.memberSiteId).subscribe(employer => {
                                    if (employer) {
                                        this.form.patchValue({
                                            employerName: employer.displayName,
                                            industryNumber: employer.company.industryClass
                                        });

                                        this.isSearching$.next(false);
                                    }
                                    });                    
                            
                                if(this.isFromClaimView) {  
                                    this.form.controls.claimNumber.disable();
                                }
                            }
                        })                
                    } 
                    else {        
                        this.alertService.error('Claim number not found');
                        this.isSearching$.next(false);
                    }
                    
                    })
                }
        }

        selected($event: any) {
            if ($event !== null) {
            this.selectedWorkType = $event;
            this.selectedWorkItemTypeId = $event.value;
            }
        }

        onCategorySelect($event: any) {
            if ($event !== null) {
            this.selectedReportCategory = $event.value;
            }
        }

        save() {
            this.readForm();    

            if (this.workItemMedicalReport.medicalReport.medicalReportFormId > 0) {
                this.workItemMedicalReportEmit.emit(this.workItemMedicalReport);
            } else {
                this.setReportTypeModel();
                this.setReportCategoryModelData();
                this.workItemMedicalReportEmit.emit(this.workItemMedicalReport);
            }
        }

        readForm() {

            if (!this.workItemMedicalReport.medicalReport) {
                this.workItemMedicalReport.medicalReport = new MedicalReportForm();
            }
        
            this.workItemMedicalReport.medicalReport.name = this.form.controls.firstName.value;
            this.workItemMedicalReport.medicalReport.surname = this.form.controls.lastName.value;
            this.workItemMedicalReport.medicalReport.gender = this.form.controls.gender.value;
            this.workItemMedicalReport.medicalReport.claimReferenceNumber = this.form.controls.claimNumber.value;
            this.workItemMedicalReport.medicalReport.eventDate = DateUtility.getDate(this.form.controls.eventDate.value);
            this.workItemMedicalReport.medicalReport.dateOfBirth = DateUtility.getDate(this.form.controls.dateOfBirth.value);
            this.workItemMedicalReport.medicalReport.contactNumber = this.form.controls.cellNumber.value;
            this.workItemMedicalReport.medicalReport.industryNumber = this.form.controls.industryNumber.value;
            this.workItemMedicalReport.medicalReport.employerName = this.form.controls.employerName.value;
            this.workItemMedicalReport.medicalReport.claimantOccupation = this.form.controls.occupation.value;
            this.workItemMedicalReport.medicalReport.consultationDate = DateUtility.getDate(this.form.controls.dateOfConsultation.value);
            this.workItemMedicalReport.medicalReport.nextReviewDate = DateUtility.getDate(this.form.controls.dateOfNextReview.value);

            this.workItemMedicalReport.medicalReport.claimId = this.claimId;
            this.workItemMedicalReport.medicalReport.medicalReportSystemSource = +SourceSystemEnum.Modernisation;
            this.workItemMedicalReport.medicalReport.personEventId = this.personEventId;
            this.workItemMedicalReport.medicalReport.eventCategoryId = this.eventCategoryId;
            this.workItemMedicalReport.medicalReport.medicalReportFormId = this.medicalReportId;
            this.workItemMedicalReport.medicalReport.reportCategoryId = this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.reportCategoryId? this.workItemMedicalReport.medicalReport.reportCategoryId : +this.selectedReportCategory;   
            this.workItemMedicalReport.medicalReport.reportTypeId = this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.reportTypeId ? this.workItemMedicalReport.medicalReport.reportTypeId : +this.selectedWorkItemTypeId;

            const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.form.markAsPristine();
        }

        setReportTypeModel(){
            switch (this.workItemMedicalReport.medicalReport.reportTypeId) {
            case 1:
                if(this.event.eventType == EventTypeEnum.Accident){
                    this.workItemMedicalReport.reportType = new FirstMedicalReportForm();
                }
                else{
                    this.workItemMedicalReport.reportType = new FirstDiseaseMedicalReportForm();
                }
                break;
            case 2:
                if(this.event.eventType == EventTypeEnum.Accident){
                    this.workItemMedicalReport.reportType = new ProgressMedicalReportForm();
                }
                else{
                    this.workItemMedicalReport.reportType = new ProgressDiseaseMedicalReportForm();
                }            
                break;
            case 3:
                if(this.event.eventType == EventTypeEnum.Accident){
                    this.workItemMedicalReport.reportType = new FinalMedicalReportForm();
                }
                else{
                    this.workItemMedicalReport.reportType = new FinalDiseaseMedicalReportForm();
                }            
                break;                          
            }
        }

        setReportCategoryModelData(): void{
            switch (this.workItemMedicalReport.medicalReport.reportCategoryId) {
            case +MedicalReportCategoryEnum.EyeInjuryReport:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: EyeInjuryReportDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData);
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.HomeVisit:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: HomeVisitReportDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData);          
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.PhysioTherapyReport:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: PhysioTherapyReportDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData);
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.PMPMedHistory:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: PMPMedHistoryDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData); 
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.ProstheticReview:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: ProstheticReviewDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData); 
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.RadiologyReport:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: RadiologyReportDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData);
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            case +MedicalReportCategoryEnum.UrologicalReview:
                if(this.workItemMedicalReport.medicalReport.reportCategoryData)
                {
                    let reportCategoryData: UrologicalReviewDetail = JSON.parse(this.workItemMedicalReport.medicalReport.reportCategoryData);
                    this.workItemMedicalReport.reportCategory = reportCategoryData;
                }
                break;
            default:
                this.workItemMedicalReport.reportCategory = new ReportCategoryDetail();

            }

        }
    }
