import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { InvoiceSearchResult } from '../../../shared/models/invoice-search-result';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { BehaviorSubject } from 'rxjs';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { InvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-type-enum';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css'],
})
export class InvoiceDetailsComponent implements OnInit {
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
  invoiceId: number;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showInvoice = false;
  mailAttachment: MailAttachment[];
  invoiceSearchResult: InvoiceSearchResult;
  recipientEmail: string;
  auditResult: AuditResult;
  auditResults: AuditResult[];
  ownerEmail = new UntypedFormControl('', [Validators.required, Validators.email]);
  form: UntypedFormGroup;
  @ViewChild(AuditLogComponent, { static: false }) auditLogComponent: AuditLogComponent;

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager
  ) { }
  ngOnInit(): void {
    this.showInvoice = false;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (value: any) => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
        this.isLoading$.next(false);
      },
      (error) => {
        this.toastr.errorToastr(error.message);
        this.isLoading$.next(false);
      }
    );
  }

  policySearchChangeHandler(invoiceSearchResult: InvoiceSearchResult): void {
    this.invoiceSearchResult = invoiceSearchResult;
    this.isLoading$.next(true);
    this.showInvoice = true;
    this.invoiceId = invoiceSearchResult.invoiceId;
    this.ownerEmail.setValue(invoiceSearchResult.emailAddress);
    this.recipientEmail = invoiceSearchResult.emailAddress;
    this.generateInvoiceDocument(invoiceSearchResult.invoiceId);
    this.getAuditDetails(invoiceSearchResult.invoiceId);
  }

  getAuditDetails(id: number): void {
    this.invoiceService.getInvoiceAudit(id).subscribe(results => {
      this.auditResults = new Array();
      this.auditResults = results;
    });
  }

  validEmail(): boolean {
    if (
      this.ownerEmail.hasError('required') ||
      this.ownerEmail.hasError('email')
    ) {
      return false;
    } else {
      return true;
    }
  }

  onEmailChange(emailValue: string): void {
    this.ownerEmail.setValue(emailValue);
  }

  sendInvoice() {
    this.isSending$.next(true);
    this.invoiceSearchResult.emailAddress = this.ownerEmail.value;
    this.emailInvoice( this.invoiceSearchResult.rolePlayerId, this.invoiceSearchResult.invoiceId,this.invoiceSearchResult.employeeNumber, this.invoiceSearchResult.emailAddress);   
  }

  auditDetails(invoiceSearchResult: InvoiceSearchResult) {
    this.auditResult = new AuditResult();
    this.auditResult.itemId = invoiceSearchResult.invoiceId.toString();
    this.auditResult.itemType = 'Invoice';
    this.auditResult.username = this.authService.getUserEmail();
    this.auditResult.action = 'Invoice sent via email';
    this.auditResult.oldItem = 'Invoice sent via email to ' + invoiceSearchResult.emailAddress;
    this.auditResult.newItem = 'Invoice sent via email to ' + invoiceSearchResult.emailAddress;
    this.invoiceService.addAuditLog(this.auditResult).subscribe(() => { });
  }

  async loadDefaultReport(): Promise<void> {
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

  async generateInvoiceDocument(invoiceId: number): Promise<void> {
    this.reportTitle = 'Invoice';
    this.parametersAudit = { invoiceId };
    this.reportServerAudit = this.ssrsBaseUrl;
    if (this.invoiceSearchResult.invoiceType === InvoiceTypeEnum.Coid) {
      this.reportUrlAudit = 'RMA.Reports.FinCare/RMACoidInvoice';
    } else {
      this.reportUrlAudit = 'RMA.Reports.FinCare/RMAFuneralInvoice';
    }
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

  clear() {
    this.showInvoice = false;
  }

  emailInvoice( roleplayerId:number, invoiceId:number,invoiceNumber: string, toAddress:string) {
    this.invoiceService.emailDebtorInvoice(roleplayerId,[invoiceId],invoiceNumber, toAddress ).subscribe(
      () => {
        this.toastr.successToastr('Email sent successfully');
        this.isSending$.next(false);
        this.auditDetails(this.invoiceSearchResult);
      },
      (error) => {
        this.toastr.errorToastr(error.message);
        this.isSending$.next(false);
      }
      );
  }
}
