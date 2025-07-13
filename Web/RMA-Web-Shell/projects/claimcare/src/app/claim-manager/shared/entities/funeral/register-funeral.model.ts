import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { RuleResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-result';
import { FuneralRuleResult } from './funeral-rule-result';
import { ClaimManagerRoutingModule } from '../../../claim-manager-routing.module';
import { ClaimantModel } from './claimant.model';

export class RegisterFuneralModel extends BaseClass {
    insuredLifeId: number;
    idNumber: string;
    passportNumber: string;
    nationality: string;
    firstName: string;
    lastName: string;
    policyId: number;
    deathType: number;
    dateOfDeath: Date;
    isStillborn: boolean;
    claimId: number;
    wizardId: number;
    funeralId: number;
    uniqueClaimReferenceNumber: string;
    claimant: ClaimantModel;
    ruleResult: FuneralRuleResult;

}
