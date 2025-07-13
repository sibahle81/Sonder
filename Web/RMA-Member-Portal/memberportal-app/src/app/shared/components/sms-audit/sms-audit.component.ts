import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/core/models/security/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { SendSMSRequest } from '../../models/send-sms-request.model';
import { SmsAudit } from '../../models/sms-audit.model';
import { AlertService } from '../../services/alert.service';
import { SmsAuditService } from '../../services/sms-audit.service';

@Component({
  selector: 'app-sms-audit',
  templateUrl: './sms-audit.component.html',
  styleUrls: ['./sms-audit.component.scss']
})
export class SmsAuditComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource = new  MatTableDataSource<SmsAudit>();
  public isLoading = false;
  public currentUser: string;
  public loggedInUserRole: string;
  public loggedInUserEmail: string;
  public currentUserObject: User;
  public loggedInUserId: number;
  public menus: { title: string; url: string; disable: boolean }[];
  public displayedColumns: string[] = ['smsNumbers', 'message', 'isSuccess', 'processDescription', 'createdDate', 'actions'];

  constructor(
    public smsService: SmsAuditService,
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
        this.getSmsAudit(this.data);
      } else {
        this.isLoading = false;
      }
  }

  getSmsAudit(data: any): void {
    if (data.itemType === 'Claim' || data.itemType === 'PersonEvent') {
      this.smsService.GetClaimSmsAudit(data.itemType, data.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.dataSource.data = smsAudits;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      });
    } else {
      this.smsService.GetSmsAudit(data.itemType, data.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.dataSource.data = smsAudits;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  filterMenu() {
    this.menus = null;

    this.menus = [
    { title: 'Resend', url: '', disable: false }
    ];
  }

  onMenuSelect(item: any, title: any) {
    if ( title === 'Resend') {
      this.ResendSms(item);
    }
  }

  ResendSms(smsAudit: SmsAudit) {
    this.isLoading = true;
    const smsRequest = new SendSMSRequest();
    smsRequest.itemId = smsAudit.itemId;
    smsRequest.itemType = smsAudit.itemType;
    smsRequest.message = smsAudit.message;
    smsRequest.smsNumbers = [smsAudit.smsNumbers];
    smsRequest.whenToSend = new Date();
    smsRequest.lastChangedBy = this.currentUser;
    this.smsService.sendSMS(smsRequest).subscribe(
      result => {
        if (result === 1) {
          this.alertService.success('Resend was successful');
          this.isLoading = false;
          this.getSmsAudit(this.data);
        } else {
          this.alertService.error('Error when resending message');
          this.isLoading = false;
        }
      }
    );
  }
}
