import { PagedRequest } from "../pagination/PagedRequest";
import { UserReminderItemTypeEnum } from "./user-reminder-item-type-enum";
import { UserReminderTypeEnum } from "./user-reminder-type-enum";

export class UserReminderSearchRequest {
    userId: number;
    userReminderTypes: UserReminderTypeEnum[];
    userReminderItemType: UserReminderItemTypeEnum;
    itemId: number;
    getAlerts: boolean;

    pagedRequest: PagedRequest;

    startDateFilter: Date;
    endDateFilter: Date;

    usersFilter: number[];
}
