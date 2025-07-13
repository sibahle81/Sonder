import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/core/models/security/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { ReportsUrlConstants } from 'src/app/shared/constants/reports-url-constants';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { BrokerPolicyListComponent } from '../broker-policy-list/broker-policy-list.component';

@Component({
  selector: 'app-broker-policy-documents',
  templateUrl: './broker-policy-documents.component.html',
  styleUrls: ['./broker-policy-documents.component.scss']
})
export class BrokerPolicyDocumentsComponent implements OnInit {

  form: FormGroup;
  formIsValid = false;
  policyId = 0;
  userDetails: User;

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
  isViewCommission = false;
  counter = 0;
  data: any;

  baseUrl: any;
  selectedReportType: string;
  selectedReportTypeName: string;

  reportTypes = [
    { name: ConstantPlaceholder.WelcomeLetterTitle, value: ConstantPlaceholder.RMAFuneralWelcomeLetter },
    { name: ConstantPlaceholder.PolicyScheduleTitle, value: ConstantPlaceholder.RMAFuneralPolicySchedule },
    { name: ConstantPlaceholder.MemberCertificateTitle, value: ConstantPlaceholder.RMAFuneralPolicyMemberCertificate }
  ];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public dialogRef: MatDialogRef<BrokerPolicyListComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService) {
    this.isViewCommission = data.isViewCommission as boolean;
    this.data = data;
    this.baseUrl = this.data.BaseUrl;
  }

  ngOnInit() {
    this.loadDefaultReport();

    if (!this.data.isViewCommission) {
      this.policyId = this.data.policyId as number;
    } else {
      this.commissionReport();
    }
  }

  close() {
    this.dialogRef.close(null);
  }

  reportTypeChanged($event: any) {
    this.showReport = false;
    this.isLoading$.next(true);
    this.selectedReportTypeName = $event.value.name;
    this.selectedReportType = $event.value.value;
    this.generateSelectedReport(this.policyId);
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

  generateSelectedReport(PolicyId: number): void {
    this.reportTitle = this.selectedReportTypeName;
    this.parametersAudit = { PolicyId };
    this.reportServerAudit = this.baseUrl;
    console.log(this.reportServerAudit);
    this.reportUrlAudit = ConstantApi.PolicyReportUrl + this.selectedReportType;
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

  commissionReport(): void {
    this.showReport = false;
    this.showReport = false;
    this.parametersAudit = {
      StartDate: this.data.StartDate,
      EndDate: this.data.EndDate,
      BrokerageId: this.data.BrokerageId
    };
    this.reportServerAudit = this.baseUrl;
    this.reportUrlAudit = ReportsUrlConstants.memberPortalCommissionStatementReportURL;
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }
}

