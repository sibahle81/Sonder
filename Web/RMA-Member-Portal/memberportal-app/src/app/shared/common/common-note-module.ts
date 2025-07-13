
import { ModuleTypeEnum } from "../enums/module-type-enum";
import { BaseClass } from './base-class';

export class CommonNoteModule {
    id: number;
    noteId: number;
    moduleType: ModuleTypeEnum;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
