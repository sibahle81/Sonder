
import { NoteCategoryEnum } from "../enums/note-category-enum";
import { NoteItemTypeEnum } from "../enums/note-item-type-enum";
import { NoteTypeEnum } from "../enums/note-type-enum";
import { CommonNoteModule } from "./common-note-module";

export class CommonNote {
    id: number;
    itemId: number;
    noteItemType: NoteItemTypeEnum | null;
    text: string;
    isActive: boolean;
    isDeleted: boolean;
    noteType: NoteTypeEnum | null;
    noteCategory: NoteCategoryEnum | null;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    noteModules: CommonNoteModule[];
}