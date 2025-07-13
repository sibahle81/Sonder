// wiki: http://bit.ly/2AxAnO5
// The base class for all model classes.

/** @description The base class for all model classes. */
export class BaseClass {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isActive: boolean;
    isDeleted: boolean;
    canEdit: boolean;
    canAdd: boolean;
    canRemove: boolean;
    permissionIds: number[];
}
