import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

@Component({
  selector: 'app-medical-report-home',
  templateUrl: './medical-report-home.component.html',
  styleUrls: ['./medical-report-home.component.css']
})
export class MedicalReportHomeComponent extends PermissionHelper implements OnInit {

    constructor(public router: Router) {
        super();
    }

    ngOnInit(): void {
    }

    navigate($event: MedicalReportForm) {
        this.router.navigate([`/medicare/medical-report/report-view/${$event.medicalReportFormId}`]);
    }
}
