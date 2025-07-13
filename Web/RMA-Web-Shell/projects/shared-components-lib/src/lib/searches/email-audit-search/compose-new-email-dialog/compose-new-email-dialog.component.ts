import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { EmailRequest } from 'projects/shared-services-lib/src/lib/services/email-request/email-request';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserSearchDialogComponent } from '../../../dialogs/user-search-dialog/user-search-dialog.component';
import { GenericDocument } from '../../../models/generic-document';

@Component({
  templateUrl: './compose-new-email-dialog.component.html',
  styleUrls: ['./compose-new-email-dialog.component.css']
})
export class ComposeNewEmailDialogComponent {
  title = 'Compose New Email';
  form: UntypedFormGroup;
  mailAttachments: MailAttachment[] = [];
  recipients: string;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<ComposeNewEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
    this.recipients = this.data.reciepients.map(s => s.emailAddress).join(';');
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      recipients: [{ value: this.data.reciepients.map(s => s.firstname + ' ' + s.surname + '(' + s.emailAddress + ')').join(' ;'), disabled: true }],
      subject: [{ value: null, disabled: false }, Validators.required],
      body: [{ value: null, disabled: false }, Validators.required],
      cc: [{ value: null, disabled: false }],
      bcc: [{ value: null, disabled: false }],
    });
  }

  openUserSearchDialog($event: string) {
    const userSearchDialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '70%',
    });

    userSearchDialogRef.afterClosed().subscribe(result => {
      if (result) {
        if ($event == 'cc') {
          let recipientsCC = this.form.controls.cc.value ? this.form.controls.cc.value : '';
          recipientsCC += result.email + ';';
          this.form.patchValue({
            cc: recipientsCC
          });
        } else {
          let recipientsBCC = this.form.controls.bcc.value ? this.form.controls.bcc.value : '';
          recipientsBCC += result.email + ';';
          this.form.patchValue({
            bcc: recipientsBCC
          });
        }

        this.form.markAsDirty();
        this.form.updateValueAndValidity();
      }
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
          const attachment = new MailAttachment();
          attachment.fileName = file.name;
          attachment.attachmentByteData = reader.result?.toString().split(',')[1]; // Extract base64 string
          attachment.fileType = file.type;

          this.mailAttachments.push(attachment);
        };
      });
    }
  }

  removeAttachment(index: number) {
    this.mailAttachments.splice(index, 1);
  }

  send() {
    const emailRequest = new EmailRequest();
    emailRequest.subject = this.form.controls.subject.value;
    emailRequest.body = this.form.controls.body.value;
    emailRequest.recipients = this.recipients;
    emailRequest.recipientsCC = this.form.controls.cc.value || null;
    emailRequest.recipientsBCC = this.form.controls.bcc.value || null;
    emailRequest.fromAddress = this.authService.getCurrentUser().email;
    emailRequest.isHtml = true;
    emailRequest.attachments = this.mailAttachments.length ? this.mailAttachments : [];
    emailRequest.itemId = this.data.itemId;
    emailRequest.itemType = this.data.itemType;

    this.dialogRef.close(emailRequest);
  }

  cancel() {
    this.dialogRef.close();
  }

  setSelectedDocuments($event: GenericDocument[]) {
    if ($event?.length > 0) {
      $event.forEach(file => {
        if (file.fileAsBase64) {
          const attachment = new MailAttachment();
          attachment.fileName = file.fileName;
          attachment.attachmentByteData = file.fileAsBase64;
          attachment.fileType = this.handleFileExtention(file.fileExtension);

          this.mailAttachments.push(attachment);
        }
      });
    }
  }

  handleFileExtention(fileExtention: string): string {
    const mimeTypes: Record<string, string> = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'pdf': 'application/pdf',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'zip': 'application/zip',
      'rar': 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      'json': 'application/json',
      'xml': 'application/xml',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript'
    };

    return mimeTypes[fileExtention.toLowerCase()] || 'application/octet-stream';
  }
}
