
import { ModuleTypeEnum } from "../enums/module-type-enum";
import { NoteCategoryEnum } from "../enums/note-category-enum";
import { NoteItemTypeEnum } from "../enums/note-item-type-enum";
import { NoteTypeEnum } from "../enums/note-type-enum";
import { PagedRequest } from "../pagination/PagedRequest";
import { BaseClass } from './base-class';

export class CommonNoteSearchRequest {
    id: number;
    itemId: number;
    noteItemType: NoteItemTypeEnum | null;
    text: string;
    noteType: NoteTypeEnum | null;
    noteCategory: NoteCategoryEnum | null;
    createdBy: string;
    modifiedBy: string;
    modifiedDate: Date | null;
    moduleType: ModuleTypeEnum[];
    pagedRequest: PagedRequest;
    startDateFilter: Date | null;
    endDateFilter: Date | null;
}
