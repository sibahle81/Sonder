import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { InvoiceSearchResult } from '../../../shared/models/invoice-search-result';
import { UntypedFormControl } from '@angular/forms';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';
import { PolicyProductCategory } from '../../models/policy-product-category';

@Component({
  selector: 'app-statement-details',
  templateUrl: './statement-details.component.html',
  styleUrls: ['./statement-details.component.css']
})
export class StatementDetailsComponent implements OnInit {
  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  showReport = false;
  reportTitle: string;
  showStatement = false;
  mailAttachment: MailAttachment[];

  invoiceSearchResult: InvoiceSearchResult;
  recipientEmail: string;
  ownerEmail = new UntypedFormControl('');
  auditResult: AuditResult;
  auditResults: AuditResult[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  rolePlayerId = 0;
  selectedPolicyIds = [];

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.showStatement = false;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.loadDefaultReport();
      this.isLoading$.next(false);
    },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoading$.next(false);
      });
  }

  policySearchChangeHandler(searchAccountResults: SearchAccountResults) {
    this.isLoading$.next(true);
    this.showStatement = true;
    this.invoiceSearchResult = new InvoiceSearchResult();
    this.invoiceSearchResult.firstName = searchAccountResults.displayName;
    this.invoiceSearchResult.policyNumber = searchAccountResults.policyNumber;
    this.invoiceSearchResult.policyId = searchAccountResults.policyId;
    this.invoiceSearchResult.invoiceId = searchAccountResults.policyId;
    this.recipientEmail = searchAccountResults.emailAddress;
    this.invoiceSearchResult.rolePlayerId = searchAccountResults.rolePlayerId;
    this.ownerEmail.setValue(searchAccountResults.emailAddress);
    this.rolePlayerId = searchAccountResults.rolePlayerId;
    this.isLoading$.next(false);
  }

  onEmailChange(emailValue: string): void {
    this.ownerEmail.setValue(emailValue);
  }

  sendStatement() {
    this.isSending$.next(true);
    this.invoiceSearchResult.emailAddress = this.ownerEmail.value;
    this.invoiceService.sendStatement(this.invoiceSearchResult).subscribe(() => {
      this.toastr.successToastr('Email sent successfully');
      this.isSending$.next(false);
      this.auditDetails(this.invoiceSearchResult);
    }, error => { this.toastr.errorToastr(error.message); this.isSending$.next(false); });
  }

  getAuditDetails(id: number): void {
    this.invoiceService.getStatementAudit(id).subscribe(results => {
      this.auditResults = new Array();
      this.auditResults = results;
    });
  }

  auditDetails(invoiceSearchResult: InvoiceSearchResult) {
    this.auditResult = new AuditResult();
    this.auditResult.itemId = invoiceSearchResult.policyId.toString();
    this.auditResult.itemType = 'Statement';
    this.auditResult.username = this.authService.getUserEmail();
    this.auditResult.action = 'Statement sent via email';
    this.auditResult.oldItem = 'Statement sent via email to ' + invoiceSearchResult.emailAddress;
    this.auditResult.newItem = 'Statement sent via email to ' + invoiceSearchResult.emailAddress;
    this.invoiceService.addAuditLog(this.auditResult).subscribe(() => {
    });
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  generateStatementDocument(policyIds: string): void {
    this.reportTitle = 'Statement';
    this.parametersAudit = { policyIds };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMAStatement';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

  back() { this.ngOnInit(); }

  policiesSelected(policies: PolicyProductCategory[]) {
    if (policies.length > 0) {
      this.isLoading$.next(true);
      let policyIds = policies.map(c => c.policyId);
      this.generateStatementDocument(policyIds.toString());
      policies.forEach(element => {
        this.getAuditDetails(element.policyId);
      });
    }
  }
}
