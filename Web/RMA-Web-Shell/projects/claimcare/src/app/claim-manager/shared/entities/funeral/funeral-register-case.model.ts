import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { ForensicPathologist } from 'projects/clientcare/src/app/policy-manager/shared/entities/forensic-pathologist';
import { BodyCollector } from 'projects/clientcare/src/app/policy-manager/shared/entities/body-collector';
import { FuneralParlor } from 'projects/clientcare/src/app/policy-manager/shared/entities/funeral-parlor';
import { Undertaker } from 'projects/clientcare/src/app/policy-manager/shared/entities/Undertaker';
import { InformantModel } from './informant.model';
import { PersonEventModel } from '../personEvent/personEvent.model';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';

export class FuneralRegisterCase extends BaseClass {
    insuredLifeDetail: InsuredLife;
    personEvent: PersonEventModel;
    informant: InformantModel;
    medicalServiceProvider: HealthCareProviderModel;
    forensicPathologist: ForensicPathologist;
    funeralParlor: FuneralParlor;
    undertaker: Undertaker;
    bodyCollector: BodyCollector;
}