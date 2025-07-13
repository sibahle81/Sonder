import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SendSMSRequest } from 'projects/shared-models-lib/src/lib/common/send-sms-request';
import { SmsAudit } from 'projects/shared-models-lib/src/lib/common/sms-audit';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DefaultConfirmationDialogComponent } from '../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { CommunicationFailureReasonDialogComponent } from '../dialogs/communication-failure-reason-dialog/communication-failure-reason-dialog.component';
import { ComposeNewSmsDialogComponent } from './compose-new-sms-dialog/compose-new-sms-dialog.component';
import { RolePlayerContactOptionsDialogComponent } from '../searches/email-audit-search/role-player-contact-options-dialog/role-player-contact-options-dialog.component';
import { MemberContactDialogComponent } from '../member-contacts/member-contact-dialog/member-contact-dialog.component';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { KeyValue } from '@angular/common';
import { SmsAuditDataSource } from './sms-audit.datasource';
import { SmsAuditService } from './sms-audit.service';

@Component({
  templateUrl: './sms-audit.component.html',
  styleUrls: ['./sms-audit.component.css']
})
export class SmsAuditComponent implements OnInit, AfterViewInit {

  _itemType: string = '';
  _itemId: number = 0;
  _consolidatedView: boolean = false;
  _rolePlayerContactOptions: KeyValue<string, number>[];

  showCloseButton: boolean = true;
  
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  currentQuery: any;

  dataSource: SmsAuditDataSource;
  public menus: { title: string; url: string; disable: boolean }[];

  constructor(
    public dialog: MatDialog,
    public smsService: SmsAuditService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService) { }

  ngOnInit() {
    this.dataSource = new SmsAuditDataSource(this.smsService);

    if (this._itemType != null && this._itemId != null) {
      this.getData();
    }
  }

  ngAfterViewInit(): void {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.getData())
      )
      .subscribe();
  }

  reset() {
    this.paginator.firstPage();
    this.getData();
  }

  getData(): void {
    this.dataSource.itemType = this._itemType;
    this.dataSource.itemId = this._itemId;
    if (this._itemType === 'Policy' && this._consolidatedView) {
      this.dataSource.policyId = this._itemId;
    } else {
      this.currentQuery = { "itemType": this._itemType, "itemId": this._itemId }
      this.dataSource.policyId = null;
    }
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  filterMenu() {
    this.menus = null;
    this.menus = [
      { title: 'Resend', url: '', disable: false }
    ];
  }

  openConfirmationDialog($event: SmsAudit) {
    if ($event) {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          text: `Are you sure you would like to resend this sms?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.resend($event)
        }
      });
    }
  }

  resend(smsAudit: SmsAudit) {
    this.isSending$.next(true);

    const smsRequest = new SendSMSRequest();

    smsRequest.itemId = smsAudit.itemId;
    smsRequest.itemType = smsAudit.itemType;
    smsRequest.message = smsAudit.message;
    smsRequest.smsNumbers = [smsAudit.smsNumbers];
    smsRequest.whenToSend = new Date();
    smsRequest.lastChangedBy = this.authService.getUserEmail();

    this.smsService.sendSMS(smsRequest).subscribe(result => {
      if (result === 1) {
        this.alertService.success('Resend was successful');
        this.reset();
        this.isSending$.next(false);
      } else {
        this.alertService.error('Error when resending message');
        this.isSending$.next(false);
      }
    }
    );
  }

  send(smsRequest: SendSMSRequest) {
    this.isSending$.next(true);
    this.smsService.sendSMS(smsRequest).subscribe(
      result => {
        if (result === 1) {
          this.alertService.success('Sms sent successfully...');
          this.reset();
          this.isSending$.next(false);
        } else {
          this.alertService.error('Sms failed to send...');
          this.isSending$.next(false);
        }
      }
    );
  }

  viewFailureReason($event: SmsAudit) {
    const dialogRef = this.dialog.open(CommunicationFailureReasonDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        communicationFailureReason: $event.processDescription
      }
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  openRolePlayerContactOptionsDialog($event: SmsAudit) {
    const dialogRef = this.dialog.open(RolePlayerContactOptionsDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        rolePlayerContactOptions: this._rolePlayerContactOptions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (+result) {
        if ($event) {
          this.openContactsDialogResend($event, +result)
        } else {
          this.openContactsDialogCompose(+result);
        }
      }
    });
  }

  openContactsDialogResend($event: SmsAudit, rolePlayerId: number) {
    if ($event) {
      const dialogRef = this.dialog.open(MemberContactDialogComponent, {
        width: '75%',
        disableClose: true,
        data: {
          rolePlayerId: rolePlayerId
        }
      });

      dialogRef.afterClosed().subscribe(results => {
        if (results?.length > 0) {

          const smsRequest = new SendSMSRequest();
          smsRequest.message = $event.message;
          smsRequest.smsNumbers = results.map(s => s.contactNumber);
          smsRequest.itemId = $event.itemId;
          smsRequest.itemType = $event.itemType;
          smsRequest.lastChangedBy = this.authService.getUserEmail();

          this.send(smsRequest);
        }
      });
    }
  }

  openContactsDialogCompose(rolePlayerId: number) {
    const dialogRef = this.dialog.open(MemberContactDialogComponent, {
      width: '75%',
      disableClose: true,
      data: {
        rolePlayerId: rolePlayerId
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      if (results?.length > 0) {
        let reciepients: RolePlayerContact[] = [];
        results.forEach(rolePlayerContact => {
          if (rolePlayerContact.contactNumber && rolePlayerContact.contactNumber != '') {
            reciepients.push(rolePlayerContact);
          }
        });

        this.openComposeNewSmsDialogComponent(reciepients);
      }
    });
  }

  openComposeNewSmsDialogComponent(reciepients: RolePlayerContact[]) {
    if (reciepients) {
      const dialogRef = this.dialog.open(ComposeNewSmsDialogComponent, {
        width: '70%',
        disableClose: true,
        data: {
          reciepients: reciepients,
          itemType: this._itemType,
          itemId: this._itemId
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.send(result);
        }
      });
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'isSuccess', show: true },
      { def: 'message', show: true },
      { def: 'smsNumbers', show: true },
      { def: 'createdDate', show: true },
      { def: 'createdBy', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
