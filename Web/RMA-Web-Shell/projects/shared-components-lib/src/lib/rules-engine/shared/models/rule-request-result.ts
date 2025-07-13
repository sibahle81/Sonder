import { RuleResult } from './rule-result';

export class RuleRequestResult {
    requestId: string;
    overallSuccess: boolean;
    ruleResults: RuleResult[];
}
