import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/models/security/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MailAttachment } from '../../models/email-attachment.model';
import { EmailAudit } from '../../models/email-audit.model';
import { SendMailRequest } from '../../models/send-mail-request.model';
import { AlertService } from '../../services/alert.service';
import { EmailAuditService } from '../../services/email-audit.service';

@Component({
  selector: 'app-email-audit',
  templateUrl: './email-audit.component.html',
  styleUrls: ['./email-audit.component.scss']
})
export class EmailAuditComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource = new  MatTableDataSource<EmailAudit>();
  public isLoading = false;
  public isResending = false;
  public currentUser: string;
  public loggedInUserRole: string;
  public loggedInUserEmail: string;
  public currentUserObject: User;
  public loggedInUserId: number;
  public menus: { title: string; url: string; disable: boolean }[];
  public displayedColumns: string[] = ['fromAddress', 'reciepients', 'createdDate', 'isSuccess', 'processDescription', 'actions'];
  public mailAttachment: MailAttachment[];

  constructor(
    public emailService: EmailAuditService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.loggedInUserEmail = this.currentUserObject.email;
    this.loggedInUserRole = this.currentUserObject.roleName;

    if (this.data.itemType != null && this.data.itemId != null) {
      this.getEmailAudit(this.data);
      } else {
      this.isLoading = false;
    }
  }

  getEmailAudit(data: any) {
    if (data.itemType === 'Claim' || data.itemType === 'PersonEvent') {
      this.emailService.GetClaimNotificationAudit(data.itemType, data.itemId).subscribe(emailAudits => {
        if (emailAudits.length > 0) {
          this.dataSource.data = emailAudits;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;

        } else {
          this.isLoading = false;
        }
      });
    } else {
      this.emailService.GetEmailAudit(data.itemType, data.itemId).subscribe(emailAudits => {
        if (emailAudits.length > 0) {
          this.dataSource.data = emailAudits;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error => {},
      () => {
        if(this.dataSource.data.length > 0){
        this.GetAttachments(this.dataSource.data);
        }
      }
      );
    }
  }

  splitEmails(emails: string) {
    const temp = emails.split(';');
    return temp;
  }


  View(row: EmailAudit): void {
    row.attachments.forEach(element => {
      this.getData(element);
    });
    const blob = new Blob([row.body], { type: 'text/html' });

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, row.subject);
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

  getData(documentDetails: any) {
    const byteCharacters = atob(documentDetails.attachmentByteData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob: any = new Blob([byteArray], {
      type: documentDetails.fileType
    });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
      window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
      // window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
    } else { // Chrome & Firefox
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      // link.download = documentDetails.fileName;
      window.open(URL.createObjectURL(blob));
    }
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
    } else if ( title === 'Resend') {
      this.ResendEmail(item);
    }
  }

  GetAttachments(data: EmailAudit[]): any {
    this.isLoading = true;
    data.forEach(a => {
      this.emailService.GetMailAttachmentsByAuditId(a.id).subscribe( mailAttachment => {
        if (mailAttachment) {
          a.attachments = mailAttachment;
          this.isLoading = false;
          return mailAttachment;
        } else {
          this.isLoading = false;
          return a.attachments = a.attachments;
        }
      });
    });
  }

  ResendEmail(row: any) {
    this.isLoading = true;
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
          this.isLoading = false;
          this.getEmailAudit(this.data);
        } else {
          this.alertService.error('Error when resending message');
          this.isLoading = false;
        }
      }
    );
  }

}
