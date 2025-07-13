import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserRemindersDialogComponent } from './user-reminders-dialog/user-reminders-dialog.component';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UserRemindersAlertDialogComponent } from './user-reminders-alert-dialog/user-reminders-alert-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Constants } from 'projects/clientcare/src/app/constants';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'user-reminders',
  templateUrl: './user-reminders.component.html',
  styleUrls: ['./user-reminders.component.css']
})
export class UserRemindersComponent extends UnSubscribe implements OnInit, OnChanges {

  currentUser: User;

  @Input() userId: number;
  @Input() userReminderItemType: UserReminderItemTypeEnum;
  @Input() itemId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isAlertDialogOpen: boolean;

  previousMessageCount = 0;
  newMessagesReceived$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  messageCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  isInitialised = false;

  constructor(
    public dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly userReminderService: UserReminderService,
    private readonly lookupService: LookupService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    setInterval(() => {
      this.getMessageCountForUser();
    }, 60000); //60000 checks every 1 minutes (60x per hour)

    this.lookupService.getItemByKey(Constants.userReminderAlertTimeInMinutes).subscribe(result => { 
      if (result) {
        const defaultTime = +result > 0 ? (+result * 60000) : 300000; // checks every 5 minutes by default unless setting is supplied in common.Settings Key = 'UserReminderAlertTimeInMinutes'
        setInterval(() => {
          this.getAlertsForUser();
        }, defaultTime); 
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userId) {
      this.getMessageCountForUser();
    }
  }

  getAlertsForUser() {
    this.isLoading$.next(true);
    if (this.userId && !this.isAlertDialogOpen && this.authService.isAuthenticated()) {
      this.userReminderService.checkUserHasAlerts(this.userId).subscribe(result => {
        if (result) {
          this.openUserRemindersAlertDialog();
        }
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  getMessageCountForUser() {
    if (this.userId && this.authService.isAuthenticated()) {
      this.isLoading$.next(true);
      this.userReminderService.checkMessageCount(this.userId).subscribe(result => {

        this.messageCount$.next(result && result > 0 ? result : 0);

        if (this.isInitialised) {
          this.newMessagesReceived$.next(this.previousMessageCount < this.messageCount$.value);
        } else {
          this.previousMessageCount = this.messageCount$.value;
          this.isInitialised = true;
        }

        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  openUserRemindersAlertDialog() {
    this.isAlertDialogOpen = true;

    const dialogRef = this.dialog.open(UserRemindersAlertDialogComponent, {
      width: '70%',
      data: {
        userId: this.userId,
        userReminderItemType: this.userReminderItemType,
        itemId: this.itemId
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (data) => {
        this.isAlertDialogOpen = false;
        this.getMessageCountForUser();
        this.previousMessageCount = this.messageCount$.value ? this.messageCount$.value : 0;
      }
    });
  }

  openUserRemindersDialog() {
    this.isAlertDialogOpen = true;

    const dialogRef = this.dialog.open(UserRemindersDialogComponent, {
      width: '70%',
      data: {
        userId: this.userId,
        userReminderItemType: this.userReminderItemType,
        itemId: this.itemId
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (data) => {
        this.isAlertDialogOpen = false;
        this.getMessageCountForUser();
        this.previousMessageCount = this.messageCount$.value ? this.messageCount$.value : 0;
      }
    });
  }
}
