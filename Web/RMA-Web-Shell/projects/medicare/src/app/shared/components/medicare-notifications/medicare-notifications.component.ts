import { Component, OnInit } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'medicare-notifications',
  templateUrl: './medicare-notifications.component.html',
  styleUrls: ['./medicare-notifications.component.css']
})
export class MedicareNotificationsComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  lockStatus: string;
  showView: boolean;
  selectedUserReminder: UserReminder;

  userId: number;
  userReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications; // if this is set it will only return notifications that are of this type

  targetModuleType = ModuleTypeEnum.MediCare;
  isExternalUser: boolean = false;

  constructor(
    private readonly authService: AuthService
  ) {
    this.lockStatus = '0';
  }

  ngOnInit(): void {
    this.setCurrentUser();
    this.isExternalUser = !this.authService.getCurrentUser().isInternalUser;
  }

  setCurrentUser() {
    this.userId = this.authService.getCurrentUser()?.id;
    if (this.authService.getCurrentUser().roleId == +RoleEnum.MedicalAdminAssistant) {
      this.lockStatus = 'Unlocked';
    }
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
