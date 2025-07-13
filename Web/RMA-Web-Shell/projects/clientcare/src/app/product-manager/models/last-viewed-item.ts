import { ItemType } from './item-type.enum';

export class LastViewedItem {
    id: number;
    itemId: number;
    itemType: ItemType;
    user: string;
    date: Date;
    code = '';
    name = '';
    description = '';
    startDate: Date;
    endDate: Date;
    canEdit: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    isActive: boolean;
    statusText: string;
}
