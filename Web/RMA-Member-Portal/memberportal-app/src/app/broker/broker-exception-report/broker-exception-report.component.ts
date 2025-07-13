import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { BrokerPolicyListComponent } from '../broker-policy-list/broker-policy-list.component';

@Component({
  selector: 'app-broker-exception-report',
  templateUrl: './broker-exception-report.component.html',
  styleUrls: ['./broker-exception-report.component.scss']
})
export class BrokerExceptionReportComponent implements OnInit {

  fileIdentifier = '';

  // generating Selected Report variables
  reportTitle: string;
  parametersAudit: any;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  showReport = false;
  isViewExceptionReport = false;
  data: any;

  baseUrl: any;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public dialogRef: MatDialogRef<BrokerPolicyListComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.isViewExceptionReport = data.isViewExceptionReport as boolean;
    this.data = data;
    this.baseUrl = this.data.BaseUrl;
  }

  ngOnInit() {
    this.loadDefaultReport();

    if (this.data.isViewExceptionReport) {
      this.fileIdentifier = this.data.fileIdentifier as string;
      this.generateSelectedReport(this.fileIdentifier);
    }
  }

  close() {
    this.dialogRef.close(null);
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServerAudit = this.baseUrl;
    this.reportUrlAudit = ConstantApi.DefaultCommonReport;
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  generateSelectedReport(fileIdentifier: string): void {
    this.reportTitle = ConstantPlaceholder.ExceptionReportTitle
    this.parametersAudit = { fileIdentifier };
    this.reportServerAudit = this.baseUrl;
    this.reportUrlAudit = ConstantApi.PolicyReportUrl + ConstantPlaceholder.RMAExceptionReport;
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }
}

