export class PolicyLifeExtension {
    policyLifeExtensionId: number;
    policyId:number;
    annualIncreaseTypeId:number;
    affordabilityCheckPassed: boolean = true;
    AffordabilityCheckFailReason:string;
    isEuropAssistExtended:boolean;
    isDeleted: boolean = false;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

}
