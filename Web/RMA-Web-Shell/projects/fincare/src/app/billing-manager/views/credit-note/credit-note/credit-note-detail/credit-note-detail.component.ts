import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CreditNoteSearchResult } from 'projects/fincare/src/app/shared/models/credit-note-search-result';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-credit-note-detail',
  templateUrl: './credit-note-detail.component.html',
  styleUrls: ['./credit-note-detail.component.css']
})
export class CreditNoteDetailComponent implements OnInit {
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
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showCreditNote = false;
  mailAttachment: MailAttachment[];
  creditNoteSearchResult: CreditNoteSearchResult;
  recipientEmail: string;
  auditResult: AuditResult;
  auditResults: AuditResult[];
  ownerEmail = new UntypedFormControl('', [Validators.required, Validators.email]);
  form: UntypedFormGroup;
  @ViewChild(AuditLogComponent, { static: false }) auditLogComponent: AuditLogComponent;

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager
  ) { }
  ngOnInit(): void {
    this.showCreditNote = false;
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

  policySearchChangeHandler(creditNoteSearchResult: CreditNoteSearchResult): void {
    this.creditNoteSearchResult = creditNoteSearchResult;
    this.isLoading$.next(true);
    this.showCreditNote = true;
    this.ownerEmail.setValue(creditNoteSearchResult.emailAddress);
    this.recipientEmail = creditNoteSearchResult.emailAddress;
    this.generateCreditDocument(creditNoteSearchResult.transactionId);
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

  sendCreditNote() {
    this.isSending$.next(true);
    this.creditNoteSearchResult.emailAddress = this.ownerEmail.value;
    this.emailCreditNote(this.creditNoteSearchResult.rolePlayerId, [this.creditNoteSearchResult.transactionId], this.creditNoteSearchResult.documentReference, this.creditNoteSearchResult.emailAddress);
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

  async generateCreditDocument(transactionId: number): Promise<void> {
    this.reportTitle = 'Credit Note';
    this.parametersAudit = { transactionId };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMACreditNote';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

  clear() {
    this.showCreditNote = false;
  }

  emailCreditNote(roleplayerId: number, transactionIds: number[], invoiceNumber: string, toAddress: string) {
    this.invoiceService.emailDebtorCreditNote(roleplayerId, transactionIds, invoiceNumber, toAddress).subscribe(
      () => {
        this.toastr.successToastr('Email sent successfully');
        this.isSending$.next(false);
      },
      (error) => {
        this.toastr.errorToastr(error.message);
        this.isSending$.next(false);
      }
    );
  }
}