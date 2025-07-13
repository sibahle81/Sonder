import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderSearchRequest } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-search-request';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserReminderService {
  private apiUrl = 'mdm/api/UserReminder';

  constructor(
    private readonly commonService: CommonService) {
  }

  createUserReminder(userReminder: UserReminder): Observable<number> {
    return this.commonService.postGeneric(`${this.apiUrl}/CreateUserReminder`, userReminder);
  }

  createUserReminders(userReminders: UserReminder[]): Observable<number> {
    return this.commonService.postGeneric(`${this.apiUrl}/CreateUserReminders`, userReminders);
  }

  updateUserReminder(userReminder: UserReminder): Observable<boolean> {
    return this.commonService.edit(userReminder, this.apiUrl + '/UpdateUserReminder');
  }

  updateUserReminders(userReminders: UserReminder[]): Observable<boolean> {
    return this.commonService.edit(userReminders, this.apiUrl + '/UpdateUserReminders');
  }

  checkUserHasAlerts(userId: number): Observable<boolean> {
    const userReminder = new UserReminder();
    userReminder.assignedToUserId = userId;
    return this.commonService.postGeneric<UserReminder, boolean>(`${this.apiUrl}/CheckUserHasAlerts/`, userReminder);
  }

  getPagedUserReminders(userReminderSearchRequest: UserReminderSearchRequest): Observable<PagedRequestResult<UserReminder>> {
    return this.commonService.postGeneric<UserReminderSearchRequest, PagedRequestResult<UserReminder>>(`${this.apiUrl}/GetPagedUserReminders/`, userReminderSearchRequest);
  }

  checkMessageCount(userId: number): Observable<number> {
    const userReminder = new UserReminder();
    userReminder.assignedToUserId = userId;
    return this.commonService.postGeneric<UserReminder, number>(`${this.apiUrl}/CheckMessageCount/`, userReminder);
  }

}

