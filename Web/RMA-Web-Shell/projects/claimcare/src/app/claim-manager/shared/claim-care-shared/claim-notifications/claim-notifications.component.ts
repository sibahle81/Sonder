import { Component, OnInit } from '@angular/core';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'claim-notifications',
  templateUrl: './claim-notifications.component.html',
  styleUrls: ['./claim-notifications.component.css']
})
export class ClaimNotificationsComponent implements OnInit {
  @Input() userLoggedIn: User;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  showView: boolean;
  selectedUserReminder: UserReminder;

  userId: number;
  userReminderItemType = UserReminderItemTypeEnum.Claim; // if this is set it will only return notifications that are of this type

  constructor(
    private readonly authService: AuthService
  ) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


  setCurrentUser() {
    this.userId = this.authService.getCurrentUser()?.id;
    this.isLoading$.next(false);
  }

  viewUserReminder($event: UserReminder) {
    this.selectedUserReminder = $event;
    this.toggleView();
  }

  toggleView() {
    this.showView = !this.showView;
  }

  getUserReminderItemType(userReminderType: UserReminderItemTypeEnum): string {
    if (userReminderType) {
      return this.formatText(UserReminderItemTypeEnum[+userReminderType]);
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

}