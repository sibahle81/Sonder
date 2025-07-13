export interface PdExtentLookup {
    pdExtentLookupId: number;
    minimum: number;
    average: number;
    maximum: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: string;
}
