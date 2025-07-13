import { ItemType } from './item-type.enum';

export class LastViewedItem {
    id: number;
    itemId: number;
    itemType: ItemType;
    user: string;
    date: Date;
    code: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    canEdit: boolean;
}
