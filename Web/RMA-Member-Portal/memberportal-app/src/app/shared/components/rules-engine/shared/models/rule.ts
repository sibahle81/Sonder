import { BaseClass } from 'src/app/core/models/base-class.model';



export class Rule extends BaseClass {
    ruleTypeId: number;
    name: string;
    code: string;
    description: string;
    isConfigurable: boolean;
    configurationMetaData: string;
    executionFilter: string;
}
