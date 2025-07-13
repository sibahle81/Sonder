import { UserReminderItemTypeEnum } from "./user-reminder-item-type-enum";
import { UserReminderTypeEnum } from "./user-reminder-type-enum";

export class UserReminder {
    userReminderId: number;
    userReminderType: UserReminderTypeEnum;
    userReminderItemType: UserReminderItemTypeEnum;
    itemId: number;
    text: string;
    assignedByUserId: number;
    assignedToUserId: number;
    alertDateTime: Date;
    linkUrl: string;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
