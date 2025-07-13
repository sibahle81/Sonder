import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-medical-report-details-viewer',
  templateUrl: './medical-report-details-viewer.component.html',
  styleUrls: ['./medical-report-details-viewer.component.css']
})
export class MedicalReportDetailsViewerComponent implements OnInit {

  loadingFormInProgress: boolean;
  medicalReportType: string;
  @Input() medicalReportFormId: number;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit: string = 'PDF';
  extensionAudit: string = 'PDF';
  reportTitle: string;
  ssrsBaseUrl: string;
  showReport = false;
  medicalFormError: boolean;

  reportStatus : string;
  reportDetail : string;

  constructor(
    private readonly medicalFormService: MedicalFormService,
    private lookupService: LookupService,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.medicalReportFormId = (Number(params.id) > 0) ? (Number(params.id)) : Number(this.medicalReportFormId);
      this.getMedicalForm(this.medicalReportFormId);
    });

  }

  getMedicalForm(medicalFormId: number) {
    this.loadingFormInProgress = true;
    this.medicalFormService.getMedicalReportForm(medicalFormId).subscribe(
      data => {
        let rdlReportName:string;

        this.reportStatus = data.medicalReportForm.reportStatus;
        this.reportDetail = data.medicalReportForm.reportStatusDetail;

        if (data.firstMedicalReportFormId) {
          this.medicalReportType = 'First accident';
          rdlReportName = 'FirstAccidentMedicalForm';
        }
        if (data.firstDiseaseMedicalReportFormId) {
          this.medicalReportType = 'First disease';
          rdlReportName = 'FirstDiseaseMedicalForm';
        }
        else if (data.progressMedicalReportFormId) {
          this.medicalReportType = 'Progress accident';
          rdlReportName = 'ProgressAccidentMedicalForm';
        }
        else if (data.finalMedicalReportFormId) {
          this.medicalReportType = "Final accident";
          rdlReportName = 'FinalAccidentMedicalForm';
        }
        else if (data.progressDiseaseMedicalReportFormId) {
          this.medicalReportType = "Progress Disease";
          rdlReportName = 'ProgressDiseaseMedicalForm';
        }
        else if (data.finalDiseaseMedicalReportFormId) {
          this.medicalReportType = "Final Disease";
          rdlReportName = 'FinalDiseaseMedicalForm';
        }
        else {
          this.medicalFormError = true;
        }

        this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
          value => {
            this.ssrsBaseUrl = value;
            this.viewReport(rdlReportName, medicalFormId);
          }
        );

        this.loadingFormInProgress = false;
      }
    );

  }

  viewReport(rdlReportName:string, medicalFormId: number) {

    this.reportServerAudit = this.ssrsBaseUrl;

    this.reportUrlAudit = 'RMA.Reports.DigiCare/' + rdlReportName;

    this.parametersAudit = { MedicalReportFormId: medicalFormId };

    this.showParametersAudit = 'false';
    this.formatAudit = 'PDF';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;

  }

  back(): void {
    this.location.back();
  }

  isEmpty(str): boolean {
    return (!str || 0 === str.length);
  }
}
