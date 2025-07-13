import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommissionEmailAuditDialogComponent } from '../commission-email-audit-dialog/commission-email-audit-dialog.component';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { SendMailRequest } from 'projects/shared-models-lib/src/lib/common/send-mail-request';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-resend-email-dialog',
  templateUrl: './resend-email-dialog.component.html',
  styleUrls: ['./resend-email-dialog.component.css']
})
export class ResendEmailDialogComponent implements OnInit {
  recipient = '';
  isSending = false;
  emailAudit: EmailAudit;
  form: UntypedFormGroup;
  constructor(public dialogRef: MatDialogRef<CommissionEmailAuditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly emailService: EmailNotificationAuditService,
              private readonly alertService: AlertService,
              private readonly toastr: ToastrManager) {
    this.emailAudit = data.emailAuditItem;
  }
  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.form = this.formBuilder.group({
      recipient: ['', [Validators.required, Validators.email]]
    });
    this.form.patchValue({ recipient: this.emailAudit.reciepients });
  }
  send() {
    if (this.form.valid) {
      this.isSending = true;
      this.emailService.GetMailAttachmentsByAuditId(this.emailAudit.id).subscribe(
        (results: MailAttachment[]) => {
          this.emailAudit.attachments = results;
          const emailRequest = new SendMailRequest();
          emailRequest.itemId = this.emailAudit.itemId;
          emailRequest.body = this.emailAudit.body;
          emailRequest.fromAddress = this.emailAudit.fromAddress;
          emailRequest.attachments = this.emailAudit.attachments;
          emailRequest.recipients = this.form.get('recipient').value;
          emailRequest.recipientsCC = this.emailAudit.reciepientsCc;
          emailRequest.recipientsBCC = this.emailAudit.reciepientsBcc;
          emailRequest.subject = this.emailAudit.subject;
          emailRequest.itemType = this.emailAudit.itemType;
          emailRequest.isHtml = this.emailAudit.isHtml;
          emailRequest.createdBy = this.emailAudit.createdBy;
          emailRequest.modifiedBy = this.emailAudit.modifiedBy;
          this.emailService.sendEmail(emailRequest).subscribe(
            result => {
              if (result === 200) {
                this.toastr.successToastr('Resend was successful');
                this.isSending = false;
                this.dialogRef.close(true);
              }
            }
          );
        });
    }
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then(() => {
      this.isSending = false;
      this.dialogRef.close(true);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
