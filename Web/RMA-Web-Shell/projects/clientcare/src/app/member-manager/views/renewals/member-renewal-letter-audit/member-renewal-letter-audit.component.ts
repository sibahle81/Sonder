import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service'
import { SendMailRequest } from 'projects/shared-models-lib/src/lib/common/send-mail-request';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import * as saveAs from 'file-saver';
import { DatePipe } from '@angular/common';
import { MemberRenewalLetterSearchDataSource } from '../../../datasources/member-renewal-letter-search.datasource';
import { MemberService} from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MemberResendEmailRequest } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact'
import { ResendMemberRenewalLetterComponent } from '../resend-member-renewal-letter/resend-member-renewal-letter.component';

@Component({
  selector: 'app-member-renewal-letter-audit',
  templateUrl: './member-renewal-letter-audit.component.html',
  styleUrls: ['./member-renewal-letter-audit.component.css']
})
export class MemberRenewalLetterAuditComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @Input() title: string;
  @Input() isclaim: boolean;

  displayedColumns: string[] = ['fromAddress', 'reciepients', 'subject', 'isSuccess', 'processDescription','createdDate', 'actions'];

  start: any;
  startDate: Date;
  startDt: UntypedFormControl;
  startMaxDate: Date;
  currentUser: string;
  loggedInUserRole: string;
  loggedInUserEmail: string;
  currentUserObject: User;
  loggedInUserId: number;
  menus: { title: string; url: string; disable: boolean }[];
  paymentId: number;
  private ngUnsubscribe = new Subject();
  selectedIndex: number;
  dataSource: MemberRenewalLetterSearchDataSource;
  form: any;
  formBuilder: any;
  currentQuery: any;
  query = '';
  roleplayerId: number;
  loadingEmails: boolean = false;
  sendingEmails: boolean = false;
  downloadEmails: boolean = false;

  constructor(
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly emailService: EmailNotificationAuditService,
    private readonly toastr: ToastrManager,
    public memberService: MemberService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly alert: ToastrManager,
    public datePipe: DatePipe) {
    this.startDate = new Date();
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);
  }

  ngOnInit() {
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.loggedInUserEmail = this.currentUserObject.email;
    this.loggedInUserRole = this.currentUserObject.roleName;

    this.activatedRoute.params.subscribe((params: any) => {
    const today = new Date();
    const y = new Date(today).getFullYear();
    const m = new Date(today).getMonth() + 1;
    const d = new Date(today).getDate();
    const startDate = y + '-' + m + '-' + d; 
      
        this.selectedIndex = params.tabIndex;
        this.dataSource = new MemberRenewalLetterSearchDataSource(this.memberService, this.emailService);
        this.currentQuery = startDate;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);

    });  
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.loadData();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData(): void {
    this.currentQuery = this.start;  
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  getAuditData() {
    this.loadData();
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  splitEmails(emails: string) {
    const temp = emails.split(';');
    return temp;
  }

  getEmailAuitAndAttachment(auditId: number): Observable<EmailAudit> {
    return this.dataSource.getEmailAuitAndAttachmentData(auditId)
  }

  View(row: any): void {
    this.downloadEmails = true;
    this.getEmailAuitAndAttachment(row.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result.attachments.length > 0) {
        result.attachments.forEach(x => this.downloadAttachment(x));
      }
      else {
        this.downloadEmails = false;
        this.toastr.infoToastr("No Attachments");
      }
    },
      error => {
        this.downloadEmails = false;
        this.toastr.errorToastr(error.message);
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
      this.downloadEmails = false;
    }

  }

  filterMenu() {
    this.menus = null;

    this.menus = [
      { title: 'View', url: '', disable: false },
      { title: 'Resend', url: '', disable: false }
    ];
  }

  onMenuItemClick(item: any, title: string) {
    if (title === 'View') {
      this.View(item);
    } else if (title === 'Resend') {
      this.openEmailDialog(item);
    }
  }

  openEmailDialog(row: any) {
    this.loadingEmails = true;
    this.roleplayerId = row.itemId;
    this.rolePlayerService.getRolePlayer(this.roleplayerId).subscribe(result => {
      const contacts = result.rolePlayerContacts;
      if(contacts){
        this.loadingEmails = false;
        const dialogRef = this.dialog.open(ResendMemberRenewalLetterComponent, {
          data: { contacts }
        });

        dialogRef.afterClosed().subscribe({
          next: (data) => {
            if (data != null) {
              this.sendingEmails = true;
              const selectedEmailContacts = data.rolePlayerContacts;
              const rolePlayerContact = new MemberResendEmailRequest();
              rolePlayerContact.rolePlayerContacts = selectedEmailContacts;
              this.memberService.resendRenewalLetter(rolePlayerContact).subscribe(s => {
                this.alert.successToastr(`emailed successfully`);
                this.sendingEmails = false;
              });
            } 
          }
        });
      }
    });

  }


  ResendEmail(row: any) {
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
          }
        },
        error => {
          this.toastr.errorToastr(error.message);
        }
      );

    },
      error => {
        this.toastr.errorToastr(error.message);
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
