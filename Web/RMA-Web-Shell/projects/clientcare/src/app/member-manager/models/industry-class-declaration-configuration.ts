import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { DeclarationPenaltyPercentage } from './declaration-penalty-percentage';
import { MaxAverageEarning } from './max-average-earning';
import { LiveInAllowance } from './live-in-allowance';
import { InflationPercentage } from './inflation-percentage';
import { MinimumAllowablePremium } from './minimum-allowable-premium';

export class IndustryClassDeclarationConfiguration {
    industryClassDeclarationConfigurationId: number;
    industryClass: IndustryClassEnum;
    renewalPeriodStartMonth: number;
    renewalPeriodStartDayOfMonth: number;
    varianceThreshold: number;
    onlineSubmissionStartMonth: number;
    onlineSubmissionStartDayOfMonth: number;

    maxAverageEarnings: MaxAverageEarning[];
    declarationPenaltyPercentages: DeclarationPenaltyPercentage[];
    liveInAllowances: LiveInAllowance[];
    inflationPercentages: InflationPercentage[];
    minimumAllowablePremiums: MinimumAllowablePremium[];
}
