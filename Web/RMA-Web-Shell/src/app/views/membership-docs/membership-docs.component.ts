import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ClientPolicyScheduleDocumentsService } from 'projects/clientcare/src/app/policy-manager/shared/Services/client-policy-schedule-document.service';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import * as saveAs from 'file-saver';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-membership-docs',
  templateUrl: './membership-docs.component.html',
  styleUrls: ['./membership-docs.component.css']
})
export class MembershipDocsComponent implements OnInit {
  membershipDocsForm: UntypedFormGroup;
  backgroundImage = '';
  oneTimePin: number;
  policyNumber: string;
  isfetchingDocuments: boolean;
  isRequestingOTP: boolean;
  otpStatus: number;
  otpMessage: string;
  fetchMessageStatus: number;
  fetchMessage: string;
  policyDocuments: MailAttachment[];
  passwordHint : string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly clientPolicyScheduleDocumentsService: ClientPolicyScheduleDocumentsService
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.appEventsManager.setLoggedInUser(null);
    const random = Math.floor(Math.random() * 11);
    this.backgroundImage = `/assets/images/landingpage${random}.jpg`;

    this.isfetchingDocuments = false;
    this.isRequestingOTP = false;

    this.otpStatus = 0;
    this.otpMessage = '';
    this.fetchMessageStatus = 0;
    this.fetchMessage = '';

    this.policyDocuments = null;
  }

  createForm(): void {
    this.membershipDocsForm = this.formBuilder.group({
      policynumber: ['', Validators.required],
      onetimepin: [''],
    });
  }

  readForm(): any {
    this.policyNumber = this.membershipDocsForm.value.policynumber as string;
    this.oneTimePin = this.membershipDocsForm.value.onetimepin as number;
  }

  requestPin(): void {
    if (this.membershipDocsForm.valid) {
      this.otpStatus = 0;
      this.otpMessage = '';
      this.isRequestingOTP = true;
      this.membershipDocsForm.disable();
      this.alertService.loading('Requesting One Time Pin...');

      this.policyNumber = this.membershipDocsForm.value.policynumber as string;
      this.oneTimePin = this.membershipDocsForm.value.onetimepin as number;

      this.clientPolicyScheduleDocumentsService.getOneTimePinByPolicyNumber(this.policyNumber).subscribe(otpm => {
        this.alertService.clear();
        this.membershipDocsForm.enable();
        this.isRequestingOTP = false;
        if (otpm !== null) {
          this.otpStatus = otpm.status;
          this.otpMessage = otpm.message;

          if (otpm.status === 200) {
            this.alertService.success(otpm.message);
          } else {
            this.alertService.loading(otpm.message);
          }
        } else {
          this.otpMessage = 'One Time Pin Request Failed';
          this.alertService.loading('One Time Pin Request Failed');
        }
      }, () => {
        this.membershipDocsForm.enable();
        this.isRequestingOTP = false;
        this.otpMessage = 'One Time Pin Request Failed';
        this.alertService.error('One Time Pin Request Failed');
      });
    }
  }

  fetchDocuments(): void {
    if (this.membershipDocsForm.valid) {
      this.membershipDocsForm.disable();
      this.fetchMessageStatus = 0;
      this.fetchMessage = '';
      this.isfetchingDocuments = true;
      this.policyDocuments = null;

      this.alertService.loading('Fetching Documents');

      this.policyNumber = this.membershipDocsForm.value.policynumber as string;
      this.oneTimePin = this.membershipDocsForm.value.onetimepin as number;    

      this.clientPolicyScheduleDocumentsService.GetDocumentPassword(this.getLastSixDigits(this.policyNumber))
      .pipe(
        catchError(error => {
          console.error('Error occurred:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result && String(result).trim().length >= 13) {
          this.passwordHint = String(result).length >= 13 ? String(result).substring(0, 3) + '*'.repeat(7) + String(result).substring(10) : String(result);
        } else if (result && String(result).trim().length >= 8) {
          this.passwordHint = String(result).substring(0, 1) + '*'.repeat(5) + String(result).substring(6);
        } else {
          this.passwordHint = String(result);
        }
      });
      
      this.clientPolicyScheduleDocumentsService.getPolicyDocumentsByPolicyNumber(this.policyNumber, this.oneTimePin).subscribe(attachments => {
        this.alertService.clear();
        this.membershipDocsForm.enable();
        this.isfetchingDocuments = false;
        if (attachments.length > 0) {
          this.membershipDocsForm.disable();
          this.policyDocuments = attachments;
          this.fetchMessageStatus = 200;
          this.fetchMessage = 'Please download documents below:';
        } else {
          this.fetchMessage = 'Error occured fetching documents';
          this.alertService.error('Error occured fetching documents');
        }
      }, () => {
        this.membershipDocsForm.enable();
        this.isfetchingDocuments = false;
        this.fetchMessage = 'New One Time Pin Required';
        this.alertService.error('New One Time Pin Required');
      });
    }
  }

  downloadAttachment(attachment: MailAttachment) {
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

  getLastSixDigits(input: string): number | null {
    const match = input.match(/(\d{6})$/);
    return match ? parseInt(match[0], 10) : null;
  }
}
