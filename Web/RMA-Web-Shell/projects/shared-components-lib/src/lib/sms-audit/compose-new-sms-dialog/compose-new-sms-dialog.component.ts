import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SendSMSRequest } from 'projects/shared-models-lib/src/lib/common/send-sms-request';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  templateUrl: './compose-new-sms-dialog.component.html',
  styleUrls: ['./compose-new-sms-dialog.component.css']
})
export class ComposeNewSmsDialogComponent {
  title = 'Compose New Sms';
  form: UntypedFormGroup;
  mailAttachments: MailAttachment[] = [];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    public dialogRef: MatDialogRef<ComposeNewSmsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      recipients: [{ value: this.data.reciepients.map(s => s.firstname + ' ' + s.surname + '(' + s.contactNumber + ')').join(' ;'), disabled: true }],
      body: [{ value: null, disabled: false }, Validators.required],
    });
  }

  send() {
    const smsRequest = new SendSMSRequest();
    smsRequest.message = this.form.controls.body.value;
    smsRequest.smsNumbers = this.data.reciepients.map(s => s.contactNumber);
    smsRequest.itemId = this.data.itemId;
    smsRequest.itemType = this.data.itemType;
    smsRequest.lastChangedBy = this.authService.getUserEmail();

    this.dialogRef.close(smsRequest);
  }

  cancel() {
    this.dialogRef.close();
  }
}
