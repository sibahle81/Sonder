import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserReminderSearchRequest } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-search-request';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Injectable({
  providedIn: 'root'
})
export class PagedUserRemindersDataSource extends PagedDataSource<UserReminder> {

  userId: number;
  userReminderTypes: UserReminderTypeEnum[];
  userReminderItemType: UserReminderItemTypeEnum;
  selectedUsersFilter: User[];
  itemId: number;
  getAlerts: boolean;

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly userReminderService: UserReminderService) {
    super();
  }

  getData(page: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'createdDate';
    pagedRequest.page = page ? page : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const userReminderSearchRequest = new UserReminderSearchRequest();
    userReminderSearchRequest.getAlerts = this.getAlerts;
    userReminderSearchRequest.itemId = this.itemId;
    userReminderSearchRequest.userId = (this.selectedUsersFilter.length > 0) ? this.selectedUsersFilter[0].id : this.userId;
    userReminderSearchRequest.userReminderItemType = this.userReminderItemType;
    userReminderSearchRequest.userReminderTypes = this.userReminderTypes;
    userReminderSearchRequest.startDateFilter = null;
    userReminderSearchRequest.endDateFilter = null;
    userReminderSearchRequest.usersFilter = null;
    userReminderSearchRequest.pagedRequest = pagedRequest;

    this.userReminderService.getPagedUserReminders(userReminderSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<UserReminder>;
        this.data.page = page;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(true);
        this.loadingSubject.next(false);
      }
    });
  }
}
