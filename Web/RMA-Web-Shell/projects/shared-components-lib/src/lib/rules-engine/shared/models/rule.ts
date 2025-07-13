import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Rule extends BaseClass {
    ruleTypeId: number;
    name: string;
    code: string;
    description: string;
    isConfigurable: boolean;
    configurationMetaData: string;
    executionFilter: string;
}
