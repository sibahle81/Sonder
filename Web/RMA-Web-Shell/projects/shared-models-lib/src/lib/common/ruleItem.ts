export class RuleItem {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isDeleted: boolean;

    name: string; // TODO not sure what this is used for
    itemId: number;
    ruleId: number;
    ruleConfiguration: string;
}
