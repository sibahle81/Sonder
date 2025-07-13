import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

import  DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';

import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';


import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { MedicalReportCategoryEnum } from 'projects/digicare/src/app/work-manager/models/enum/medical-report-category.enum';
import { MedicalReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-type-enum';
import { MedicalReportModeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-mode.enum';
import { MedicalReportStatusEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-status-enum';

import { RejectMedicalReportDialogComponent } from 'projects/medicare/src/app/medical-reports-manager/views/medical-report-holistic/reject-medical-report-dialog/reject-medical-report-dialog.component';


@Component({
  selector: 'app-medical-report-view',
  templateUrl: './medical-report-view.component.html',
  styleUrls: ['./medical-report-view.component.css']
})
export class MedicalReportViewComponent extends UnSubscribe implements OnInit, OnChanges {

    public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    @Input() isFromClaimView = false;
    @Input() medicalReportId: number = 0;
    @Input() claimId: number = 0;
    @Input() healthCareProviderId: number = 0;
    @Input() isReadOnly = false;
    @Input() mode: MedicalReportModeEnum = MedicalReportModeEnum.Add;

    workItem: WorkItem;
    workItemMedicalReport: WorkItemMedicalReport;
    isInternalUser: boolean;
    tenant: Tenant;

    showDeleteReport: boolean;
    showAcceptReport: boolean;
    showRejectReport: boolean;
    canDeleteReport: boolean = false;
    canAcceptReport: boolean = false;
    canRejectReport: boolean = false;
    altDeleteReport: string = 'Delete Report';
    altAcceptReport: string = 'Accept Report';
    altRejectReport: string = 'Reject Report';

    tabIndex = 0;
    currenttabIndex = 0;

    constructor(    
        public dialog: MatDialog,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly alertService: AlertService,
        private readonly medicalFormService: MedicalFormService,
        private readonly digiCareService: DigiCareService,
        private readonly authService: AuthService,
        private readonly userService: UserService) {
        super(); 
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params: any) => {
            let currentUser = this.authService.getCurrentUser();
            this.isInternalUser = currentUser.isInternalUser;   

            if (params.isClaimView) {
                this.isFromClaimView = params.isClaimView;
            }

            if (params.mode) {
                this.mode = params.mode;
                if(this.mode == 2 || this.mode == 4){
                    this.isReadOnly = true;
                }
            }

            if (params.medicalReportId) {
                this.medicalReportId = params.medicalReportId;
            }

            if (params.claimId) {
                this.claimId = params.claimId;
            }

            if (params.healthCareProviderId) {
                this.healthCareProviderId = params.healthCareProviderId;
            }

            this.enableFunctionality();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.medicalReportId.currentValue) {
        this.medicalReportId = +changes.medicalReportId.currentValue;
        }
    }

    setWorkItemMedicalReport($event: WorkItemMedicalReport)
    {
        this.workItemMedicalReport = $event;

        if(this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.medicalReportFormId == 0){
            this.setTabIndex(1);
        }

        if(this.workItemMedicalReport.medicalReport){
            this.validateRejectMedicalReport();
            this.validateAcceptMedicalReport();
            this.validateDeleteMedicalReport();
        }
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        this.currenttabIndex = tabChangeEvent.index;
    }

    setTabIndex(index: number) {
        this.tabIndex = index;
    }

    setTabIndexOrUpdate(nextTab: boolean) {    
        if(this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.medicalReportFormId == 0){
        if(nextTab){
            this.setTabIndex(this.currenttabIndex + 1);
        }
        }
        else{
        this.updateMedicalReportForm();
        }
    }

    save() {
        if(this.isMedicalReportDetailsValid()){
            if(this.mode == +MedicalReportModeEnum.Edit){
                this.updateMedicalReportForm();
            }
            else{
                this.createMedicalReport();
            }
        }
    }

    getCurrentTenant(): void {
        this.userService.getTenant(this.authService.getCurrentUser().email).subscribe(
        tenant => {
            this.tenant = tenant;
        }
        );
    }

    populateUserDatails(): void {
        const user = this.authService.getCurrentUser();

        this.getCurrentTenant();

        if (user) {
        this.workItemMedicalReport.medicalReport.createdBy = user.email;
        this.workItemMedicalReport.medicalReport.modifiedBy = user.email;
        this.workItemMedicalReport.medicalReport.createdDate = new Date();
        this.workItemMedicalReport.medicalReport.ModifiedDate = new Date();
        if (this.tenant){
            this.workItemMedicalReport.medicalReport.tenantId = this.tenant.id;
        }
        }
    }

    isMedicalReportDetailsValid() : boolean{
        /// Report date may not be earlier consultation date
        if(this.workItemMedicalReport.medicalReport.consultationDate >  DateUtility.getDate(this.workItemMedicalReport.medicalReport.reportDate)){
            this.alertService.error('Report date may not be earlier consultation date');
            return false;
        }

        /// Report date may not be earlier than the Event Date
        if(this.workItemMedicalReport.medicalReport.eventDate >  DateUtility.getDate(this.workItemMedicalReport.medicalReport.reportDate)){
            this.alertService.error('Report date may not be earlier than the Event Date');
            return false;
        }

        /// Report date may not be earlier than Date of Stabilization. - Only final medical report(Disease and Accident)
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {
            if(this.workItemMedicalReport.reportType.dateStabilised >  DateUtility.getDate(this.workItemMedicalReport.medicalReport.reportDate)){
                this.alertService.error('Report date may not be earlier than Date of Stabilization');
                return false;
            }
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {
            if(this.workItemMedicalReport.reportType.stabilisedDate >  DateUtility.getDate(this.workItemMedicalReport.medicalReport.reportDate)){
                this.alertService.error('Report date may not be earlier than Date of Stabilization');
                return false;
            }
        }

        /// Report Date may not be earlier than First Consultation Date. - Only first medical report(Disease and Accident)
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport) {
            if(this.workItemMedicalReport.reportType.firstConsultationDate >  DateUtility.getDate(this.workItemMedicalReport.medicalReport.reportDate)){
                this.alertService.error('Report Date may not be earlier than First Consultation Date');
                return false;
            }
        }

        return true;
    }

    createMedicalReport() {
        this.isLoading$.next(true);
        this.workItemMedicalReport.medicalReport.workItemId = 1001;
        this.workItemMedicalReport.reportType.medicalReportForm = this.workItemMedicalReport.medicalReport;
        this.populateUserDatails();
        this.medicalFormService.IsDuplicateMedicalReportForm(this.workItemMedicalReport.medicalReport).subscribe(duplicate => {                
            if(duplicate){
                this.alertService.error('Duplicate Medical Report: Medical report with matching details already exists...');
            }
            else{
                this.setMedicalReportStatus();
                this.addMedicalReportForm();
            }                                    
        })
    }

    addMedicalReportForm(){
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {             
            this.medicalFormService.AddFirstMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                 this.back();
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {            
            this.medicalFormService.AddFirstDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                this.back();
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {
            this.medicalFormService.AddProgressMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                this.back();
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {
            this.medicalFormService.AddProgressDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                this.back();
            })
        }
        
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {
            this.medicalFormService.AddFinalMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                this.back();
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {
            this.medicalFormService.AddFinalDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
                this.back();
            })
        }
    }

    updateMedicalReportForm(){
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {             
            this.medicalFormService.UpdateFirstMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {            
            this.medicalFormService.UpdateFirstDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {
            this.medicalFormService.UpdateProgressMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {
            this.medicalFormService.UpdateProgressDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }
        
        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident) {
            this.medicalFormService.UpdateFinalMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }

        if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease) {
            this.medicalFormService.UpdateFinalDiseaseMedicalReportForm(this.workItemMedicalReport.reportType).subscribe(medicalReportForm => {
            })
        }
    }

    back() {
        this.router.navigate([`/medicare/medical-report`]);
    }

    reload(medicalReportId : number) {
        this.isLoading$.next(false);
        this.router.navigate([`/medicare/medical-report/report-view/${medicalReportId}`]);
    }

    isValid(): boolean {
        return this.isClaimantDetailsValid() && this.isDiagnosisValid() && this.isMedicalReportValid() && this.isDeclarationValid();
    }

    setMedicalReportStatus() {
        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport) {            
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport){
                this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.Pending;
            }
            else{
                if(this.workItemMedicalReport.medicalReport.isICD10CodeMatch){
                    this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.Accepted;
                }
                else{
                    if(this.isInternalUser){
                        this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.Pending;
                    }
                    else{
                        this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.MemberSubmit;
                    }                
                }
            }
        }
    }
        
    isClaimantDetailsValid(): boolean {
        return this.workItemMedicalReport && this.workItemMedicalReport.medicalReport 
        && this.workItemMedicalReport.medicalReport != null && this.workItemMedicalReport.medicalReport.personEventId > 0;
    }

    isDiagnosisValid(): boolean {
        return this.workItemMedicalReport && this.workItemMedicalReport.medicalReport 
            && this.workItemMedicalReport.medicalReport != null && this.workItemMedicalReport.medicalReport.icd10Codes != null;
    }

    isMedicalReportValid(): boolean {
        return true;
    }

    isDeclarationValid(): boolean {
        return this.workItemMedicalReport && this.workItemMedicalReport.medicalReport 
            && this.workItemMedicalReport.medicalReport != null && this.workItemMedicalReport.medicalReport.isDeclarationAccepted;
    }

    canShowTab(tabName: string): boolean {
        let result = false;
        switch (tabName) {
        case 'firstMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Accident)
            result = true;
            break;
        case 'firstDiseaseMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FirstMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId  == EventTypeEnum.Disease)
            result = true;
            break;
        case 'progressMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId  == EventTypeEnum.Accident)
            result = true;
            break;
        case 'progressDiseaseMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.ProgressReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId == EventTypeEnum.Disease)
            result = true;
            break;
        case 'finalMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId  == EventTypeEnum.Accident)
            result = true;
            break;
        case 'finalDiseaseMedicalReport':
            if(this.getMedicalReportTypeId() == +MedicalReportTypeEnum.FinalMedicalReport && this.workItemMedicalReport?.medicalReport?.eventCategoryId  == EventTypeEnum.Disease)
            result = true;
            break;
        case 'EyeInjuryReport':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.EyeInjuryReport)
            result = true;
            break;
        case 'HomeVisit':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.HomeVisit)
            result = true;
            break;
        case 'PhysioTherapyReport':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.PhysioTherapyReport)
            result = true;
            break;
        case 'PMPMedHistory':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.PMPMedHistory)
            result = true;
            break;
        case 'ProstheticReview':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.ProstheticReview)
            result = true;
            break;
        case 'RadiologyReport':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.RadiologyReport)
            result = true;
            break;
        case 'UrologicalReview':
            if(this.getMedicalReportCategoryId() == +MedicalReportCategoryEnum.UrologicalReview)
            result = true;
            break;
        default:
            result = false;        
        } 
        return result;    
    }

    getMedicalReportTypeId(): number{
        let id = 0;
        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport)
            id = this.workItemMedicalReport.medicalReport.reportTypeId;

        return id;
    }

    getMedicalReportCategoryId(): number{
        let id = 0;
        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport)
        id = this.workItemMedicalReport.medicalReport.reportCategoryId;

        return id;
    }

    acceptMedicalReport(): void {
        this.workItemMedicalReport.medicalReport.reportStatusId = MedicalReportStatusEnum.Accepted;
        this.medicalFormService.UpdateMedicalReportForm(this.workItemMedicalReport.medicalReport).subscribe(result => {
            if(result > 0) {
                this.alertService.success('Medical report accepted sucessfully','Accept Medical Report');
                this.back();
            }
            else{
                this.alertService.error('Failed to accept a medical report', 'Accept Medical Report');
                this.back();
            }
        })
    }

    openRejectMedicalReportDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '40%';
        dialogConfig.maxHeight = '750px';
        dialogConfig.disableClose = false;
        dialogConfig.data = {
            medicalReport: this.workItemMedicalReport.medicalReport
        }

        const dialogRef = this.dialog.open(RejectMedicalReportDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.back();
            }
          });
    }
    
    deleteMedicalReport(): void
    {
        this.medicalFormService.UpdateMedicalReportForm(this.workItemMedicalReport.medicalReport).subscribe(result => {
            if(result > 0) {
                this.alertService.success('Medical report deleted sucessfully','Delete Medical Report');
                this.back();
            }
            else{
                this.alertService.error('Failed to delete a medical report', 'Delete Medical Report');
                this.back();
            }
        })
    }

    enableFunctionality(): void {
        if(this.mode == +MedicalReportModeEnum.Edit){
            this.showAcceptReport = true;
            this.showRejectReport = true;
        }

        if(this.mode == +MedicalReportModeEnum.Delete){
            this.showDeleteReport = true;
        }
    }

    validateRejectMedicalReport(): void{
        if(!this.showRejectReport){
            return;
        }
            
        if(this.workItemMedicalReport.medicalReport){
            if(this.workItemMedicalReport.medicalReport.reportStatusId == MedicalReportStatusEnum.Rejected){
                this.canRejectReport = true;
                this.altRejectReport = 'Cannot reject medical report. Already rejected';
            }

            if(this.workItemMedicalReport.medicalReport.reportStatusId == MedicalReportStatusEnum.Accepted){
                this.canRejectReport = true;
                this.altRejectReport = 'Cannot reject medical report. Already accepted';
            }
        }
    }

    validateAcceptMedicalReport(): void{
        if(!this.showAcceptReport){
            return;
        }

        if(this.workItemMedicalReport.medicalReport){
            if(this.workItemMedicalReport.medicalReport.reportStatusId == MedicalReportStatusEnum.Rejected){
                this.canAcceptReport = true;
                this.altAcceptReport = 'Cannot accept medical report. Already rejected';
            }

            if(this.workItemMedicalReport.medicalReport.reportStatusId == MedicalReportStatusEnum.Accepted){
                this.canAcceptReport = true;
                this.altAcceptReport = 'Cannot accept medical report. Already accepted';
            }
        }
    }

    validateDeleteMedicalReport(): void{
        if(!this.showDeleteReport){
            return;
        }

        if(this.workItemMedicalReport.medicalReport){
            if(this.workItemMedicalReport.medicalReport.reportStatusId == MedicalReportStatusEnum.Rejected){
                this.canDeleteReport = true;
                this.altDeleteReport = 'Cannot not delete rejected medical report!';
            }
        }
    }

}
