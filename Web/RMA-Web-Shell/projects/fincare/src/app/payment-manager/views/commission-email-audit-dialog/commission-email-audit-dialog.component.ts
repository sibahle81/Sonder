import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommissionService } from '../../services/commission.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { ResendEmailDialogComponent } from '../resend-email-dialog/resend-email-dialog.component';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-commission-email-audit-dialog',
  templateUrl: './commission-email-audit-dialog.component.html',
  styleUrls: ['./commission-email-audit-dialog.component.css']
})
export class CommissionEmailAuditDialogComponent implements OnInit, AfterViewInit {
  menus: { title: string, action: string, disable: boolean }[];
  isSending = false;
  displayedColumns = ['fromAddress', 'recipient', 'dateCreated', 'actions'];
  currentQuery: string;
  datasource = new MatTableDataSource<EmailAudit>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  reciepients: string[] = [];
  accountTypeId: number;
  accountId: number;
  periodId: number;
  isLoading = false;
  searchDone = false;

  constructor(public dialogRef: MatDialogRef<CommissionEmailAuditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly commissionService: CommissionService,
    private readonly emailService: EmailNotificationAuditService,
    private resendEmailsDialog: MatDialog) {
    this.accountId = data.accountId;
    this.accountTypeId = data.accountTypeId;
    this.periodId = data.periodId;
  }

  ngOnInit() {
    this.getSentMails();
    this.menus =
      [
        { title: 'Email', action: 'emails', disable: false },
        { title: 'Attachments', action: 'attachments', disable: false },
        { title: 'Resend', action: 'resend', disable: false }
      ];
  }

  onMenuItemClick(item: EmailAudit, menu: any): void {
    switch (menu.action) {
      case 'emails':
        this.viewEmail(item);
        break;
      case 'attachments':
        this.downloadAttachments(item);
        break;
      case 'resend':
        this.resendReports(item);
        break;
    }
  }

  resendReports(item: EmailAudit) {
    const dialog = this.resendEmailsDialog.open(ResendEmailDialogComponent, this.getResendEmailsDialogConfig(item));
    dialog.afterClosed().subscribe();
  }

  downloadAttachments(item: EmailAudit) {
    this.emailService.GetMailAttachmentsByAuditId(item.id).subscribe(
      (results: MailAttachment[]) => {
        results.forEach(attachment => {
          const byteCharacters = atob(attachment.attachmentByteData);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const b: any = new Blob([byteArray], {
            type: attachment.fileType
          });
          saveAs(b, attachment.fileName);
        });
      });
  }

  viewEmail(item: EmailAudit) {
    const blob = new Blob([item.body], { type: 'text/html' });

    const nav = (window.navigator as any);
    if (nav.msSaveOrOpenBlob) {
      nav.msSaveBlob(blob, item.subject);
    } else {
      const anchor = window.document.createElement('a');
      anchor.href = window.URL.createObjectURL(blob);
      anchor.download = item.subject;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(anchor.href);
    }
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getSentMails() {
    this.isLoading = true;
    this.searchDone = false;
    this.commissionService.getCommissionPeriodicCommunicationSent(this.accountTypeId, this.accountId, this.periodId)
      .subscribe(data => {
        this.searchDone = true;
        this.datasource.data = data;
        this.isLoading = false;
      });
  }

  getResendEmailsDialogConfig(item: EmailAudit): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.height = '300px',
      config.width = '450px';
    config.data = { emailAuditItem: item };
    return config;
  }

  closeDialog() {
    this.dialogRef.close();
  }


  mapMimetype(fileType: string): string {
    switch (fileType) {
      case 'application/pdf': return '.pdf';
      case 'text/plain': return '.txt';
      case 'text/csv': return '.csv';
      case 'application/vnd.ms-exce': return '.xls';
    }
  }
}
