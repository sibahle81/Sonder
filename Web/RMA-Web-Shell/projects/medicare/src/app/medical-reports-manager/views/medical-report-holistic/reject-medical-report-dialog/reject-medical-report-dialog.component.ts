
import { Component, Inject, AfterViewInit, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

import { MedicalReportRejectionReason} from 'projects/digicare/src/app/medical-form-manager/models/medical_report_rejection_reason';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

import { MedicalReportStatusEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-status-enum';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';


@Component({
  selector: 'app-reject-medical-report-dialog',
  templateUrl: './reject-medical-report-dialog.component.html',
  styleUrls: ['./reject-medical-report-dialog.component.css']
})
export class RejectMedicalReportDialogComponent implements OnInit 
{
    public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    medicalReport: MedicalReportForm;
    heading = 'Rejecting Medical Report';

    requiredPermission = 'View Audits';
    hasPermission = false;

    isReadOnly = false;


    form: UntypedFormGroup;
    rejectionReasons: MedicalReportRejectionReason[];
    rejectionReasonId: number;

    constructor(
        public dialogRef: MatDialogRef<RejectMedicalReportDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly alertService: AlertService,
        private readonly lookupService: LookupService,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly medicalFormService: MedicalFormService,
    ) 
    {    
        if (data) {
            this.medicalReport = data.medicalReport;
        }
        this.getRejectionReasons();    
    }

    ngOnInit() {
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {        
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            rejectionReasonId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            description: [{ value: null, disabled: this.isReadOnly }, Validators.required]
        });
    }

    ngAfterViewInit(): void {
    }

    getRejectionReasons(): void {
        this.medicalFormService.GetMedicalReportRejectionReasonList().subscribe(result => {
            this.rejectionReasons = result;})
    }

    onRejectReasonSelect($event: any) {
        if ($event !== null) {
            this.rejectionReasonId = $event.value;
            this.form.patchValue({
                description: this.rejectionReasons.find(x => x.id === this.rejectionReasonId).description
            })
        }
    }

    onRejectMedicalReport(): void {
        if(!this.rejectionReasonId || this.rejectionReasonId <= 0) {
            this.alertService.error('Please select rejection reason', 'Reject Medical Report');
            return;
        }

        if(!this.form.controls.description.value){
            this.alertService.error('Please provide descrition', 'Reject Medical Report');
        }
            
        this.rejectMedicalReport();
    }
    
    async rejectMedicalReport() {
        if (this.medicalReport) {
            this.medicalReport.reportStatusId = MedicalReportStatusEnum.Rejected;
            this.medicalReport.medicalReportRejectionReasonId = this.rejectionReasonId;
            this.medicalReport.medicalReportRejectionReasonDescription = this.form.controls.description.value;

            this.medicalFormService.UpdateMedicalReportForm(this.medicalReport).subscribe(result => {
                if(result > 0) {
                    this.alertService.success('Medical report rejected sucessfully','Reject Medical Report');
                    this.dialogRef.close(true)
                }
                else{
                    this.alertService.error('Failed to reject medical report', 'Reject Medical Report');
                    this.dialogRef.close(false)
                }
            })
        }
    }
    
    closeDialog() {
        this.dialogRef.close(false);
    }
}
