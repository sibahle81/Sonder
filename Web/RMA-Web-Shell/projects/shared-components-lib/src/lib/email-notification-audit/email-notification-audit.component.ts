import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { EmailNotificationAuditComponentDataSource } from './email-notification-audit.datasource';
import { EmailNotificationAuditService } from './email-notification-audit.service';
import { SendMailRequest } from 'projects/shared-models-lib/src/lib/common/send-mail-request';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-email-notification-audit',
  templateUrl: './email-notification-audit.component.html',
  styleUrls: ['./email-notification-audit.component.css']
})
export class EmailNotificationAuditComponent extends BaseSearchComponent implements OnDestroy, OnInit {

  currentUser: string;
  loggedInUserRole: string;
  loggedInUserEmail: string;
  currentUserObject: User;
  loggedInUserId: number;
  menus: { title: string; url: string; disable: boolean }[];

  private ngUnsubscribe = new Subject();

  columnDefinitions: any[] = [
    { display: 'From', def: 'fromAddress', show: true },
    { display: 'Recipients', def: 'reciepients', show: true },
    { display: 'Subject', def: 'subject', show: true },
    { display: 'SentDate', def: 'createdDate', show: true },
    { display: 'Success', def: 'isSuccess', show: true },
    { display: 'FailureReason', def: 'processDescription', show: true },
    { display: 'Actions', def: 'actions', show: true }
  ];

  constructor(
    router: Router,
    formBuilder: UntypedFormBuilder,
    dataSource: EmailNotificationAuditComponentDataSource,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly emailService: EmailNotificationAuditService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly toastr: ToastrManager) {
    super(dataSource, formBuilder, router, '', []);
  }

  ngOnInit() {
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.loggedInUserEmail = this.currentUserObject.email;
    this.loggedInUserRole = this.currentUserObject.roleName;

    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    this.activatedRoute.params.subscribe((params: any) => {

      if (this.data.itemType != null && this.data.itemId != null) {
        this.getData(this.data.itemType, this.data.itemId);
      }
    });
  }

  splitEmails(emails: string): string[]{
    return emails.split(';');
  }

  getData(itemType: any, itemId: any): void {
    (this.dataSource as EmailNotificationAuditComponentDataSource).getData({
      itemType,
      itemId
    });
  }

  getEmailAuitAndAttachment(auditId: number): Observable<EmailAudit> {
    return (this.dataSource as EmailNotificationAuditComponentDataSource).getEmailAuitAndAttachmentData(auditId)
  }

  View(row: any): void {
    this.dataSource.isLoading = true;
    this.getEmailAuitAndAttachment(row.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result.attachments.length > 0) {
        result.attachments.forEach(x => this.downloadAttachment(x));
      }
      else {
        this.toastr.infoToastr("No Attachments");
      }
      this.dataSource.isLoading = false;
    },
      error => {
        this.toastr.errorToastr(error.message);
        this.dataSource.isLoading = false;
      });

    const blob = new Blob([row.body], { type: 'text/html' });
    const nav = (window.navigator as any);
    if (nav.msSaveOrOpenBlob) {
      nav.msSaveBlob(blob, row.subject);
    } else {
      const anchor = window.document.createElement('a');
      anchor.href = window.URL.createObjectURL(blob);
      anchor.download = row.subject;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(anchor.href);
    }
  }

  downloadAttachment(attachment: MailAttachment) {
    if (attachment) {
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
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu() {
    this.menus = null;

    this.menus = [
      { title: 'View', url: '', disable: false },
      { title: 'Resend', url: '', disable: false }
    ];
  }

  onMenuSelect(item: any, title: any) {
    if (title === 'View') {
      this.View(item);
    } else if (title === 'Resend') {
      this.ResendEmail(item);
    }
  }

  ResendEmail(row: any) {
    this.dataSource.isLoading = true;
    this.dataSource.isLoading = true;
    this.getEmailAuitAndAttachment(row.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result.attachments.length > 0) {
        row.attachments = result.attachments
      }

      const emailRequest = new SendMailRequest();
      emailRequest.itemId = row.itemId;
      emailRequest.body = row.body;
      emailRequest.fromAddress = row.fromAddress;
      emailRequest.attachments = row.attachments;
      emailRequest.recipients = row.reciepients;
      emailRequest.recipientsCC = row.recipientsCC;
      emailRequest.recipientsBCC = row.recipientsBCC;
      emailRequest.subject = row.subject;
      emailRequest.itemType = row.itemType;
      emailRequest.isHtml = row.isHtml;
      emailRequest.createdBy = row.createdBy;
      emailRequest.modifiedBy = row.modifiedBy;
      this.emailService.sendEmail(emailRequest).subscribe(
        result => {
          if (result === 200) {
            this.alertService.success('Resend was successful');
            this.dataSource.getData(this.data);
          }
          this.dataSource.isLoading = false;
        },
        error => {
          this.toastr.errorToastr(error.message);
          this.dataSource.isLoading = false;
        }
      );

    },
      error => {
        this.toastr.errorToastr(error.message);
        this.dataSource.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.unsubscribe();
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
