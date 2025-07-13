import { PensionGazetteTypeEnum } from "../../enums/gazette/pension/pension-gazette-type-enum";
import { PensionGazetteValueTypeEnum } from "../../enums/gazette/pension/pension-gazette-value-type-enum";

export class PensionGazetteResult {
    pensionGazetteId: number;
    pensionGazetteType: PensionGazetteTypeEnum;
    effectiveFrom: Date;
    effectiveTo: Date;
    increases: PensionGazetteIncrease[];
}

export class PensionGazetteIncrease {
    incidentMinDate: Date;
    incidentMaxDate: Date;
    valueType: PensionGazetteValueTypeEnum;
    value: number;
}
